<script setup lang="ts">
import { positionNames } from "~/modules/teams/data/position-names";
import type { Position } from "~/modules/teams/types/teams";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { useRepositories } from "~/core/api/repository-context";
import type { TeamPlayer } from "~/modules/teams/types/teams";
const repository = useRepositories().teams,
  catalog = useTeams();
const manager = {
  teams: catalog.teams,
  async update(id: string, name: string, coach: string) {
    await repository.update(id, {
      name,
      head_coach_name: coach,
      crest: crest.value,
      city: city.value,
      stadium_name: stadium.value,
      founded_year: foundedYear.value,
    });
    await catalog.refresh();
    await loadTeam();
  },
  async savePlayer(teamId: string, player: Omit<TeamPlayer, "id" | "is_captain">, id?: string) {
    if (id) await repository.updatePlayer(teamId, id, player);
    else await repository.addPlayer(teamId, player);
    await loadTeam();
  },
  async setCaptain(teamId: string, playerId: string) {
    await repository.setCaptain(teamId, playerId);
    await loadTeam();
  },
};
const teamId = ref(manager.teams.value[0]?.id ?? ""),
  name = ref(""),
  coach = ref(""),
  crest = ref<string | null>(null),
  city = ref(""),
  stadium = ref(""),
  foundedYear = ref<number | null>(null),
  playerId = ref(""),
  playerName = ref(""),
  position = ref<Position | "">(""),
  shirt = ref<number | null>(null),
  captain = ref(""),
  error = ref(""),
  message = ref("");
const roster = ref<TeamPlayer[]>([]);
async function loadTeam() {
  if (!teamId.value) return;
  const team = await repository.get(teamId.value);
  name.value = team.name;
  coach.value = team.head_coach_name ?? "";
  crest.value = team.crest;
  city.value = team.city ?? "";
  stadium.value = team.stadium_name ?? "";
  foundedYear.value = team.founded_year;
  roster.value = team.players;
  captain.value = roster.value.find((player) => player.is_captain)?.id ?? "";
  resetPlayer();
}
function resetPlayer() {
  playerId.value = "";
  playerName.value = "";
  position.value = "";
  shirt.value = null;
}
function editPlayer(id: string) {
  const player = roster.value.find((item) => item.id === id);
  if (!player) return;
  playerId.value = id;
  playerName.value = player.name;
  position.value = player.preferred_position ?? "";
  shirt.value = player.preferred_shirt_number;
}
function uploadCrest(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) {
    error.value = "Elige un escudo JPG, PNG o WebP de hasta 5 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => (crest.value = String(reader.result));
  reader.readAsDataURL(file);
}
async function run(action: () => Promise<unknown>, success: string) {
  error.value = "";
  message.value = "";
  try {
    await action();
    message.value = success;
  } catch (e) {
    error.value = (e as Error).message;
  }
}
watch(
  teamId,
  () => {
    void loadTeam();
  },
  { immediate: true },
);
useHead({ title: "Administrar equipos · Matchday" });
</script>
<template>
  <main class="management">
    <PageHeading
      title="Administrar equipos"
      kicker="GESTIÓN"
      description="Edita la identidad del equipo, su plantilla y la capitanía."
      back-to="/teams"
      back-label="Ver equipos"
      ><ActionLink to="/players">Ver jugadores</ActionLink></PageHeading
    >
    <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
    <p v-if="message" class="feedback" role="status">{{ message }}</p>
    <div class="columns">
      <ManagementPanel title="Equipo"
        ><label
          >Seleccionar equipo<AppSelect v-model="teamId"
            ><option v-for="team in manager.teams.value" :key="team.id" :value="team.id">
              {{ team.name }}
            </option></AppSelect
          ></label
        >
        <form
          @submit.prevent="run(() => manager.update(teamId, name, coach), 'Equipo actualizado.')"
        >
          <label>Nombre<input v-model="name" required /></label
          ><label>Director técnico<input v-model="coach" required /></label
          ><label>Ciudad<input v-model="city" maxlength="100" /></label
          ><label>Estadio<input v-model="stadium" maxlength="200" /></label
          ><label
            >Año de fundación<input v-model.number="foundedYear" type="number" min="1800" /></label
          ><label
            >Escudo<input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="uploadCrest" /></label
          ><TeamBadge v-if="crest" :name="name" :src="crest" /> ><button class="primary">
            Guardar equipo
          </button>
        </form>
        <label
          >Capitán<AppSelect v-model="captain"
            ><option value="">Selecciona un jugador</option>
            <option v-for="player in roster" :key="player.id" :value="player.id">
              {{ player.name }}
            </option></AppSelect
          ></label
        ><button
          :disabled="!captain"
          @click="run(() => manager.setCaptain(teamId, captain), 'Capitán actualizado.')"
        >
          Asignar capitán
        </button></ManagementPanel
      ><ManagementPanel :title="playerId ? 'Editar jugador' : 'Añadir jugador'"
        ><form
          @submit.prevent="
            run(
              async () => {
                await manager.savePlayer(
                  teamId,
                  {
                    name: playerName,
                    preferred_position: position || null,
                    preferred_shirt_number: shirt,
                  },
                  playerId || undefined,
                );
                resetPlayer();
              },
              playerId ? 'Jugador actualizado.' : 'Jugador añadido.',
            )
          "
        >
          <label>Nombre<input v-model="playerName" required /></label
          ><label
            >Posición<AppSelect v-model="position"
              ><option value="">Sin definir</option>
              <option v-for="(label, key) in positionNames" :key="key" :value="key">
                {{ label }}
              </option></AppSelect
            ></label
          ><label>Dorsal<input v-model.number="shirt" type="number" min="1" max="99" /></label>
          <div class="actions">
            <button class="primary">
              {{ playerId ? "Guardar cambios" : "Añadir a plantilla" }}</button
            ><button v-if="playerId" type="button" @click="resetPlayer">Cancelar</button>
          </div>
        </form></ManagementPanel
      >
    </div>
    <section class="roster">
      <div class="section-title">
        <div>
          <span>PLANTILLA</span>
          <h2>{{ roster.length }} jugadores</h2>
        </div>
      </div>
      <div class="roster-grid">
        <button
          v-for="player in roster"
          :key="player.id"
          class="player"
          @click="editPlayer(player.id)"
        >
          <strong>{{ player.preferred_shirt_number ?? "—" }}</strong
          ><span>{{ player.name }}</span
          ><small
            >{{
              player.preferred_position ? positionNames[player.preferred_position] : "Sin posición"
            }}<template v-if="player.is_captain"> · Capitán</template></small
          >
        </button>
      </div>
    </section>
  </main>
</template>
<style scoped>
.management {
  max-width: 1280px;
  margin: auto;
  padding: 30px 24px 70px;
}
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-top: 24px;
}
form,
label {
  display: grid;
  gap: 9px;
}
form {
  gap: 16px;
}
label {
  font-size: 12px;
  color: var(--muted);
}
input {
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-color);
}
button {
  min-height: 42px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
}
button:hover {
  border-color: var(--accent);
}
.primary {
  background: var(--accent-fill);
  color: var(--on-accent);
  border-color: transparent;
}
.actions {
  display: flex;
  gap: 10px;
}
.feedback {
  margin-top: 16px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.error {
  color: var(--ui-danger, #ffaaa3);
}
.roster {
  margin-top: 26px;
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--panel-bg);
}
.section-title span {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--accent);
}
.section-title h2 {
  margin: 6px 0 20px;
}
.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}
.player {
  display: grid;
  grid-template-columns: 36px 1fr;
  text-align: left;
  align-items: center;
}
.player strong {
  grid-row: 1/3;
  font-size: 22px;
  color: var(--accent);
}
.player small {
  color: var(--muted);
}
@media (max-width: 760px) {
  .columns {
    grid-template-columns: 1fr;
  }
  .management {
    padding: 24px 18px 50px;
  }
}
</style>
