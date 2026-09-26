<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import ManagementPanel from "~/components/ManagementPanel.vue";
import AppSelect from "~/components/AppSelect.vue";
import GroupManagement from "~/modules/tournaments/components/GroupManagement.vue";
import SeasonBoard from "~/modules/tournaments/components/SeasonBoard.vue";
import { useTournamentManagement } from "~/modules/tournaments/composables/useTournamentManagement";
import { useTeams } from "~/modules/teams/composables/useTeams";
const manager = useTournamentManagement(),
  { tournaments, seasons, phases, registrations } = manager,
  { teamById } = useTeams();
const tournamentId = ref(String(useRoute().query.tournament ?? tournaments.value[0]?.id ?? "")),
  seasonId = ref(String(useRoute().query.season ?? "")),
  name = ref(""),
  logo = ref<string | null>(null),
  cap = ref(4),
  edition = ref(""),
  phaseName = ref("Fase de grupos"),
  editedPhaseName = ref(""),
  editedPhaseKind = ref<"groups" | "knockout" | "third_place">("groups"),
  editedPhaseOrder = ref(0),
  editedQualifying = ref(2),
  editedMatchdays = ref(6),
  qualifying = ref(2),
  matchdays = ref(6),
  phaseId = ref(""),
  groupName = ref(""),
  entrants = ref<string[]>([]),
  source = ref(""),
  date = ref(""),
  interval = ref(7),
  third = ref(false),
  error = ref(""),
  message = ref("");
const tournament = computed(() => tournaments.value.find((t) => t.id === tournamentId.value)!),
  editions = computed(() => seasons.value.filter((s) => s.tournament === tournamentId.value)),
  currentPhases = computed(() => phases.value.filter((p) => p.season === seasonId.value)),
  selectedPhase = computed(() => currentPhases.value.find((p) => p.id === phaseId.value)),
  enrolled = computed(() => registrations.value[seasonId.value] ?? []);
watch(selectedPhase, (phase) => {
  if (!phase) return;
  editedPhaseName.value = phase.name;
  editedPhaseKind.value = phase.kind;
  editedPhaseOrder.value = phase.order;
  editedQualifying.value = phase.qualifying;
  editedMatchdays.value = phase.matchdays;
});
watchEffect(() => {
  if (!tournamentId.value && tournaments.value[0]) tournamentId.value = tournaments.value[0].id;
});
watch(
  tournamentId,
  () => {
    if (!editions.value.some((s) => s.id === seasonId.value))
      seasonId.value = editions.value[0]?.id ?? "";
  },
  { immediate: true },
);
watch(seasonId, () => {
  phaseId.value = "";
  entrants.value = [];
  source.value = "";
  error.value = "";
  message.value = "";
});
async function run(action: () => Promise<unknown>) {
  error.value = "";
  message.value = "";
  try {
    await action();
    message.value = "Cambios guardados.";
  } catch (e) {
    error.value = (e as Error).message;
  }
}
function uploadLogo(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) {
    error.value = "Elige un emblema JPG, PNG o WebP de hasta 5 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => (logo.value = String(reader.result));
  reader.readAsDataURL(file);
}
useHead({ title: "Gestionar torneos · Matchday" });
</script>
<template>
  <main class="tournament-management">
    <PageHeading
      title="Gestionar torneos"
      kicker="GESTIÓN"
      back-to="/tournaments"
      back-label="Ver torneos"
      description="Configura temporadas, inscripciones, grupos y eliminatorias."
    />
    <p v-if="error" role="alert" class="feedback error">{{ error }}</p>
    <p v-if="message" role="status" class="feedback">{{ message }}</p>
    <div class="columns">
      <ManagementPanel title="Nuevo torneo"
        ><form
          @submit.prevent="
            run(async () => {
              tournamentId = await manager.createTournament(name, cap, logo);
              name = '';
              logo = null;
            })
          "
        >
          <label>Nombre<input v-model="name" required /></label
          ><label
            >Emblema<input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="uploadLogo" /></label
          ><img v-if="logo" :src="logo" alt="Vista previa del emblema" class="logo-preview" /><label
            >Máximo de equipos por grupo<input
              v-model.number="cap"
              type="number"
              min="1"
              max="32767"
              required /></label
          ><button>Crear torneo</button>
        </form></ManagementPanel
      >
      <ManagementPanel title="Torneo y temporada"
        ><label
          >Torneo<AppSelect v-model="tournamentId"
            ><option v-for="t in tournaments" :key="t.id" :value="t.id">
              {{ t.name }}
            </option></AppSelect
          ></label
        ><label
          >Temporada<AppSelect v-model="seasonId"
            ><option value="">Selecciona temporada</option>
            <option v-for="s in editions" :key="s.id" :value="s.id">{{ s.name }}</option></AppSelect
          ></label
        >
        <form
          @submit.prevent="
            run(async () => {
              seasonId = await manager.createSeason(tournamentId, edition);
              edition = '';
            })
          "
        >
          <label>Nueva temporada<input v-model="edition" placeholder="2028" required /></label
          ><button>Crear temporada</button>
        </form>
        <NuxtLink v-if="tournament" :to="`/tournaments/${tournament.slug}?season=${seasonId}`"
          >Ver torneo</NuxtLink
        ></ManagementPanel
      >
      <template v-if="seasonId"
        ><ManagementPanel title="Inscripciones"
          ><p v-if="manager.locked(seasonId)" class="notice">
            Inscripciones y estructura bloqueadas: eliminatorias generadas.
          </p>
          <NuxtLink :to="`/tournaments/register?season=${seasonId}`"
            >Inscribir equipos paso a paso</NuxtLink
          >
          <p>{{ enrolled.length }} equipos inscritos</p>
          <ul>
            <li v-for="id in enrolled" :key="id">
              <div class="actions">
                <NuxtLink :to="`/teams/${id}`">{{ teamById(id)?.name }}</NuxtLink
                ><button
                  :disabled="manager.locked(seasonId)"
                  @click="run(() => manager.withdraw(seasonId, id))"
                >
                  Retirar inscripción
                </button>
              </div>
            </li>
          </ul></ManagementPanel
        >
        <ManagementPanel title="Fases de grupos"
          ><form
            @submit.prevent="
              run(async () => {
                phaseId = await manager.createPhase(seasonId, phaseName, qualifying, matchdays);
              })
            "
          >
            <label>Nombre de fase<input v-model="phaseName" required /></label
            ><label
              >Clasificados por grupo<input
                v-model.number="qualifying"
                type="number"
                min="1"
                required /></label
            ><label
              >Jornadas<input v-model.number="matchdays" type="number" min="1" required /></label
            ><button :disabled="manager.locked(seasonId)">Crear fase</button>
          </form>
          <label
            >Fase<AppSelect v-model="phaseId"
              ><option value="">Selecciona fase</option>
              <option v-for="p in currentPhases" :key="p.id" :value="p.id">
                {{ p.name }}
              </option></AppSelect
            ></label
          ><template v-if="selectedPhase"
            ><form
              class="phase-editor"
              @submit.prevent="
                run(() =>
                  manager.updatePhase(phaseId, {
                    name: editedPhaseName,
                    kind: editedPhaseKind,
                    order: editedPhaseOrder,
                    qualifying_teams: editedQualifying,
                    matchdays: editedMatchdays,
                  }),
                )
              "
            >
              <h3>Editar fase</h3>
              <label>Nombre<input v-model="editedPhaseName" required /></label>
              <label
                >Tipo<AppSelect v-model="editedPhaseKind"
                  ><option value="groups">Grupos</option>
                  <option value="knockout">Eliminatoria</option>
                  <option value="third_place">Tercer puesto</option></AppSelect
                ></label
              >
              <label
                >Orden<input v-model.number="editedPhaseOrder" type="number" min="0" required
              /></label>
              <label
                >Clasificados por grupo<input
                  v-model.number="editedQualifying"
                  type="number"
                  min="0"
                  required
              /></label>
              <label
                >Jornadas<input v-model.number="editedMatchdays" type="number" min="1" required
              /></label>
              <button :disabled="manager.locked(seasonId)">Guardar cambios de fase</button>
            </form>
            <template v-if="selectedPhase.kind === 'groups'">
              <label>Nombre de grupo<input v-model="groupName" placeholder="A" /></label>
              <div class="actions">
                <button
                  @click="
                    run(async () => {
                      await manager.addGroup(phaseId, groupName);
                      groupName = '';
                    })
                  "
                >
                  Crear grupo</button
                ><button @click="run(() => manager.finishGroups(phaseId))">
                  Finalizar fase de grupos</button
                ><button
                  @click="
                    run(async () => {
                      await manager.removePhase(phaseId);
                      phaseId = '';
                    })
                  "
                >
                  Eliminar fase vacía
                </button>
              </div>
            </template></template
          ></ManagementPanel
        >
        <template v-if="selectedPhase?.kind === 'groups'"
          ><GroupManagement
            v-for="group in selectedPhase.groups"
            :key="group.id"
            :phase="selectedPhase"
            :group="group"
            :capacity="tournament.max_teams_per_group"
            @feedback="run"
        /></template>
        <ManagementPanel title="Generar eliminatorias"
          ><p>
            El primer cruce enfrenta al primer seleccionado con el último. Las rondas siguientes
            esperan los ganadores. El tercer puesto recibe a los perdedores de semifinales.
          </p>
          <label
            >Participantes<AppSelect v-model="source"
              ><option value="">Seleccionar inscritos</option>
              <option
                v-for="p in currentPhases.filter((p) => p.kind === 'groups')"
                :key="p.id"
                :value="p.id"
              >
                Clasificados de {{ p.name }}
              </option></AppSelect
            ></label
          ><template v-if="!source"
            ><label v-for="id in enrolled" :key="id" class="check"
              ><input
                v-model="entrants"
                type="checkbox"
                :value="id"
                :disabled="manager.locked(seasonId)"
              />{{ teamById(id)?.name }}</label
            >
            <p>
              {{ entrants.length }} seleccionados · orden de selección:
              {{ entrants.map((id) => teamById(id)?.name).join(" → ") }}
            </p></template
          ><label>Primera ronda<input v-model="date" type="datetime-local" /></label
          ><label
            >Días entre rondas<input
              v-model.number="interval"
              type="number"
              min="1"
              max="365" /></label
          ><label class="check"
            ><input v-model="third" type="checkbox" />Incluir tercer puesto</label
          ><button
            :disabled="manager.locked(seasonId)"
            @click="
              run(() =>
                manager.generate(seasonId, entrants, date, interval, third, source || undefined),
              )
            "
          >
            Generar y cerrar inscripciones</button
          ><button @click="run(() => manager.advance(seasonId))">
            Actualizar rondas con los resultados
          </button>
          <p>
            Un empate sin tanda resuelta no permite avanzar. Pulsa actualizar después de terminar
            los partidos.
          </p></ManagementPanel
        ></template
      >
    </div>
    <SeasonBoard
      v-if="seasonId !== 'season-2026' && seasonId"
      :season-id="seasonId"
      class="board"
    />
  </main>
</template>
<style scoped>
.tournament-management {
  max-width: 1280px;
  margin: auto;
  padding: 30px 24px 60px;
  color: var(--text-color);
}
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
form {
  display: grid;
  gap: 16px;
}
.feedback {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin: 16px 0;
}
.error {
  color: var(--ui-danger, #ffaaa3);
}
.board {
  margin-top: 24px;
}
@media (max-width: 850px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
