<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import ManagementPanel from "~/components/ManagementPanel.vue";
import AppSelect from "~/components/AppSelect.vue";
import OperatedMatchReport from "~/modules/matches/components/OperatedMatchReport.vue";
import ShootoutSummary from "~/modules/matches/components/ShootoutSummary.vue";
import { useMatchOperations } from "~/modules/matches/composables/useMatchOperations";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { eventLabels, type EventKind, type Side } from "~/modules/matches/types/operations";
import { matchState } from "~/modules/matches/utils/matches";
import FormationEditor from "~/modules/teams/components/FormationEditor.vue";
import { formationPositions, type FormationPosition } from "~/modules/matches/data/formations";
const ops = useMatchOperations(),
  { matches, operations, roster, formations } = ops,
  { teams } = useTeams();
const home = ref(""),
  away = ref(""),
  date = ref(""),
  selected = ref(String(useRoute().query.match ?? "")),
  side = ref<Side>("home"),
  kind = ref<EventKind>("goal"),
  player = ref(""),
  replacement = ref(""),
  minute = ref(0),
  error = ref(""),
  message = ref(""),
  kicker = ref("");
const homeLineup = ref<string[]>([]),
  awayLineup = ref<string[]>([]);
const formationChoice = reactive<Record<Side, string>>({
  home: "builtin:4-3-3",
  away: "builtin:4-3-3",
});
const formationShape = reactive<Record<Side, string>>({ home: "4-3-3", away: "4-3-3" });
const formationLayout = reactive<Record<Side, FormationPosition[]>>({
  home: formationPositions("4-3-3"),
  away: formationPositions("4-3-3"),
});
const match = computed(() => matches.value.find((m) => m.id === selected.value));
const state = computed(() => operations.value[selected.value]);
const candidates = computed(() =>
  match.value
    ? roster(match.value[`${side.value}_team`].id).filter((p) =>
        ops.activePlayers(selected.value, side.value).includes(p.id),
      )
    : [],
);
const kickSide = computed(() => (match.value?.shootout?.nextSide === 1 ? "away" : "home"));
const kickers = computed(() =>
  match.value
    ? roster(match.value[`${kickSide.value}_team`].id).filter((p) =>
        ops.activePlayers(selected.value, kickSide.value).includes(p.id),
      )
    : [],
);
async function run(action: () => Promise<unknown>, success = "Cambios guardados.") {
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
  selected,
  async () => {
    error.value = "";
    message.value = "";
    player.value = "";
    kicker.value = "";
    if (selected.value) await ops.prepare(selected.value);
    homeLineup.value = [...(state.value?.lineups.home ?? [])];
    awayLineup.value = [...(state.value?.lineups.away ?? [])];
    minute.value = match.value?.current_minute ?? 0;
    for (const which of ["home", "away"] as Side[]) {
      const shape = match.value?.[`${which}_team`].formation || "4-3-3";
      formationShape[which] = shape;
      formationChoice[which] = `builtin:${shape}`;
      const current = (
        match.value?.[`${which}_team`] as { lineup?: Array<Record<string, unknown>> } | undefined
      )?.lineup?.filter((item) => item.role === "starter" && item.is_on_field !== false);
      formationLayout[which] = current?.length
        ? current.map((item, index) => ({
            slot: index + 1,
            x: Number(item.position_x ?? formationPositions(shape)[index]?.x),
            y: Number(item.position_y ?? formationPositions(shape)[index]?.y),
          }))
        : formationPositions(shape);
    }
  },
  { immediate: true },
);
function selectFormation(which: Side, value: string) {
  formationChoice[which] = value;
  const teamId = match.value?.[`${which}_team`].id;
  const saved = teamId ? formations.value[teamId]?.find((item) => item.id === value) : undefined;
  formationShape[which] = saved?.shape ?? value.replace("builtin:", "");
  formationLayout[which] = structuredClone(
    saved?.positions ?? formationPositions(formationShape[which]),
  );
}
watch(side, () => {
  player.value = "";
  replacement.value = "";
});
useHead({ title: "Operar partidos · Matchday" });
</script>
<template>
  <main class="match-management">
    <PageHeading
      title="Operar partidos"
      kicker="GESTIÓN"
      back-to="/"
      back-label="Ver calendario"
      description="Los resultados y eventos se reflejan en el calendario y en el acta del partido."
    />
    <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
    <p v-if="message" class="feedback" role="status">{{ message }}</p>
    <div class="columns">
      <ManagementPanel title="Crear partido"
        ><form
          @submit.prevent="
            run(async () => {
              selected = await ops.create(home, away, date);
            }, 'Partido creado.')
          "
        >
          <label
            >Local<AppSelect v-model="home" required
              ><option value="">Selecciona equipo</option>
              <option v-for="club in teams" :key="club.id" :value="club.id">
                {{ club.name }}
              </option></AppSelect
            ></label
          ><label
            >Visitante<AppSelect v-model="away" required
              ><option value="">Selecciona equipo</option>
              <option
                v-for="club in teams"
                :key="club.id"
                :value="club.id"
                :disabled="club.id === home"
              >
                {{ club.name }}
              </option></AppSelect
            ></label
          ><label>Fecha y hora local<input v-model="date" type="datetime-local" required /></label
          ><button>Crear partido</button>
        </form></ManagementPanel
      >
      <ManagementPanel title="Seleccionar partido"
        ><label
          >Partido<AppSelect v-model="selected"
            ><option value="">Selecciona partido</option>
            <option v-for="m in matches" :key="m.id" :value="m.id">
              {{ m.home_team.name }} – {{ m.away_team.name }} ·
              {{
                m.status === "scheduled"
                  ? "Pendiente"
                  : m.status === "live"
                    ? "En juego"
                    : "Finalizado"
              }}
            </option></AppSelect
          ></label
        ><template v-if="match"
          ><h3>
            {{ match.home_team.score }} – {{ match.away_team.score }} · {{ matchState(match) }}
          </h3>
          <NuxtLink :to="`/matches/${match.id}`">Ver partido</NuxtLink
          ><template v-if="match.status === 'scheduled'"
            ><button v-if="!state" @click="run(() => ops.prepare(selected))">
              Preparar alineaciones
            </button></template
          >
          <p v-else-if="!state">
            Este encuentro histórico es de solo consulta. Crea un partido para probar la operación.
          </p></template
        ></ManagementPanel
      >
      <template v-if="match && state"
        ><ManagementPanel v-if="match.status === 'scheduled'" title="Alineaciones"
          ><p>Selecciona y guarda once titulares por equipo antes de comenzar.</p>
          <div v-for="which in ['home', 'away'] as const" :key="which">
            <h3>{{ match[`${which}_team`].name }}</h3>
            <div class="formation-controls">
              <label
                >Formación
                <AppSelect
                  :model-value="formationChoice[which]"
                  @update:model-value="selectFormation(which, String($event))"
                >
                  <option
                    v-for="shape in ['4-3-3', '4-4-2', '4-2-3-1', '4-1-4-1', '3-5-2', '3-4-3']"
                    :key="shape"
                    :value="`builtin:${shape}`"
                  >
                    {{ shape }} · base
                  </option>
                  <option
                    v-for="item in formations[match[`${which}_team`].id] ?? []"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }} · {{ item.shape }}
                  </option>
                </AppSelect>
              </label>
              <NuxtLink :to="`/teams/${match[`${which}_team`].id}/formations`"
                >Crear formación del equipo</NuxtLink
              >
            </div>
            <p class="hint">
              Puedes mover jugadores aquí: los cambios quedan exclusivos para este partido.
            </p>
            <FormationEditor v-model="formationLayout[which]" compact />
            <label v-for="p in roster(match[`${which}_team`].id)" :key="p.id" class="check"
              ><input
                v-if="which === 'home'"
                v-model="homeLineup"
                type="checkbox"
                :value="p.id"
              /><input v-else v-model="awayLineup" type="checkbox" :value="p.id" />{{
                p.preferred_shirt_number ?? "—"
              }}
              · {{ p.name }}</label
            >
            <p v-if="roster(match[`${which}_team`].id).length < 11">
              La plantilla necesita al menos once jugadores.
            </p>
            <button
              @click="
                run(() =>
                  ops.lineup(
                    selected,
                    which,
                    which === 'home' ? homeLineup : awayLineup,
                    formationShape[which],
                    formationLayout[which],
                  ),
                )
              "
            >
              Guardar titulares ({{ (which === "home" ? homeLineup : awayLineup).length }}/11)
            </button>
          </div></ManagementPanel
        >
        <ManagementPanel v-if="match.status === 'live'" title="Ajuste táctico en vivo">
          <p>Cambia la disposición de quienes siguen en cancha. Esto no reemplaza jugadores.</p>
          <div
            v-for="which in ['home', 'away'] as const"
            :key="`tactical-${which}`"
            class="tactical-team"
          >
            <h3>{{ match[`${which}_team`].name }}</h3>
            <AppSelect
              :model-value="formationChoice[which]"
              @update:model-value="selectFormation(which, String($event))"
            >
              <option
                v-for="shape in ['4-3-3', '4-4-2', '4-2-3-1', '4-1-4-1', '3-5-2', '3-4-3']"
                :key="shape"
                :value="`builtin:${shape}`"
              >
                {{ shape }}
              </option>
              <option
                v-for="item in formations[match[`${which}_team`].id] ?? []"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }} · {{ item.shape }}
              </option>
            </AppSelect>
            <FormationEditor v-model="formationLayout[which]" compact />
            <button
              @click="
                run(
                  () =>
                    ops.changeFormation(
                      selected,
                      which,
                      formationShape[which],
                      formationLayout[which],
                    ),
                  'Formación táctica actualizada.',
                )
              "
            >
              Aplicar cambio táctico
            </button>
          </div>
        </ManagementPanel>
        <ManagementPanel
          v-if="match.status !== 'finished' && !match.shootout"
          title="Control del partido"
          ><p>
            El reloj se avanza manualmente desde la API. Cierra cada tiempo indicando su minuto
            final y después avanza al siguiente periodo.
          </p>
          <label>Minuto<input v-model.number="minute" type="number" min="0" max="150" /></label>
          <div class="actions">
            <button @click="run(() => ops.period(selected, 'next', minute))">
              {{
                match.status === "scheduled"
                  ? "Comenzar partido"
                  : match.clock.status === "running"
                    ? "Cerrar periodo"
                    : "Siguiente periodo"
              }}</button
            ><button
              v-if="match.status === 'live'"
              @click="run(() => ops.period(selected, 'extra'))"
            >
              Iniciar prórroga</button
            ><button
              v-if="match.status === 'live'"
              @click="run(() => ops.period(selected, 'finish'))"
            >
              Finalizar partido</button
            ><button v-if="match.status === 'live'" @click="run(() => ops.shootout(selected))">
              Iniciar tanda
            </button>
          </div></ManagementPanel
        >
        <ManagementPanel v-if="match.status === 'live' && !match.shootout" title="Registrar evento"
          ><form
            @submit.prevent="
              run(async () => {
                await ops.event(selected, side, kind, player, minute, replacement);
                player = '';
                replacement = '';
              }, 'Evento registrado.')
            "
          >
            <label
              >Equipo<AppSelect v-model="side"
                ><option value="home">{{ match.home_team.name }}</option>
                <option value="away">{{ match.away_team.name }}</option></AppSelect
              ></label
            ><label
              >Evento<AppSelect v-model="kind"
                ><option v-for="(label, key) in eventLabels" :key="key" :value="key">
                  {{ label }}
                </option></AppSelect
              ></label
            ><label
              >Jugador<AppSelect v-model="player" required
                ><option value="">Selecciona jugador en campo</option>
                <option v-for="p in candidates" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option></AppSelect
              ></label
            ><label v-if="kind === 'substitution'"
              >Entra<AppSelect v-model="replacement" required
                ><option value="">Selecciona suplente</option>
                <option
                  v-for="p in roster(match[`${side}_team`].id).filter(
                    (p) => !candidates.some((c) => c.id === p.id),
                  )"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }}
                </option></AppSelect
              ></label
            ><label
              >Minuto del evento<input
                v-model.number="minute"
                type="number"
                min="0"
                max="150"
                required /></label
            ><button :disabled="match.clock.status !== 'running'">Registrar evento</button>
          </form>
          <div
            v-for="e in state.events.filter((e) => !e.cancelled && e.kind !== 'substitution')"
            :key="e.id"
            class="actions"
          >
            <span>{{ e.minute }}′ · {{ eventLabels[e.kind] }}</span
            ><button @click="run(() => ops.cancel(selected, e.id), 'Evento anulado.')">
              Anular
            </button>
          </div></ManagementPanel
        >
        <ManagementPanel v-if="match.shootout" title="Tanda de penales"
          ><ShootoutSummary
            :shootout="match.shootout"
            :home="match.home_team.name"
            :away="match.away_team.name"
          /><template v-if="match.shootout.status === 'in_progress'"
            ><p>Lanza {{ match[`${kickSide}_team`].name }}</p>
            <label
              >Lanzador<AppSelect v-model="kicker"
                ><option value="">Selecciona jugador</option>
                <option v-for="p in kickers" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option></AppSelect
              ></label
            >
            <div class="actions">
              <button
                @click="
                  run(async () => {
                    await ops.kick(selected, kicker, true);
                    kicker = '';
                  })
                "
              >
                Gol</button
              ><button
                @click="
                  run(async () => {
                    await ops.kick(selected, kicker, false);
                    kicker = '';
                  })
                "
              >
                Fallado
              </button>
            </div></template
          ></ManagementPanel
        >
      </template>
    </div>
    <OperatedMatchReport v-if="match && state" :match-id="match.id" class="report" />
  </main>
</template>
<style scoped>
.match-management {
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
.formation-controls {
  display: flex;
  align-items: end;
  gap: 16px;
  margin: 18px 0 8px;
}
.formation-controls label {
  flex: 1;
}
.hint {
  color: var(--text-muted);
}
.tactical-team {
  display: grid;
  gap: 12px;
  margin-top: 22px;
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
.report {
  margin-top: 24px;
}
@media (max-width: 850px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
