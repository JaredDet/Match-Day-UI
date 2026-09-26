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
const props = withDefaults(defineProps<{ mode?: "create" | "manage" }>(), { mode: "manage" });
const route = useRoute();
const ops = useMatchOperations(),
  { matches, operations, roster, formations } = ops,
  { teams } = useTeams();
const home = ref(""),
  away = ref(""),
  date = ref(""),
  creationStep = ref(1),
  selected = ref(String(route.params.id ?? route.query.match ?? "")),
  side = ref<Side>("home"),
  kind = ref<EventKind>("goal"),
  player = ref(""),
  replacement = ref(""),
  minute = ref(0),
  addedMinutes = ref(0),
  statisticKind = ref<
    "foul" | "corner" | "offside" | "injury" | "shot" | "penalty_attempt" | "var"
  >("shot"),
  statisticPlayer = ref(""),
  statisticOutcome = ref("off_target"),
  goalkeeper = ref(""),
  varReason = ref("goal"),
  varDecision = ref("confirmed"),
  homePossession = ref(50),
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
const createFormationChoice = reactive<Record<Side, string>>({
  home: "builtin:4-3-3",
  away: "builtin:4-3-3",
});
const createFormationShape = reactive<Record<Side, string>>({ home: "4-3-3", away: "4-3-3" });
const createFormationLayout = reactive<Record<Side, FormationPosition[]>>({
  home: formationPositions("4-3-3"),
  away: formationPositions("4-3-3"),
});
const formationShapes = ["4-3-3", "4-4-2", "4-2-3-1", "4-1-4-1", "3-5-2", "3-4-3"];
let pendingCreationPreset: Record<Side, string> | null = null;
const match = computed(() => matches.value.find((m) => m.id === selected.value));
const state = computed(() => operations.value[selected.value]);
const isBreak = computed(
  () =>
    match.value?.current_period === "halftime" ||
    match.value?.current_period === "extra_time_halftime",
);
const hasActiveClock = computed(
  () =>
    match.value?.status === "live" &&
    !isBreak.value &&
    match.value.clock.status !== "closed" &&
    match.value.clock.status !== "not_started",
);
const canChooseOutcome = computed(
  () =>
    match.value?.status === "live" &&
    match.value.current_period === "second_half" &&
    match.value.clock.status === "closed",
);
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
const opponentPlayers = computed(() => {
  if (!match.value) return [];
  const opponent = side.value === "home" ? "away" : "home";
  return roster(match.value[`${opponent}_team`].id).filter((candidate) =>
    ops.activePlayers(selected.value, opponent).includes(candidate.id),
  );
});
function formationPlayers(which: Side) {
  if (!match.value) return [];
  const selectedPlayers =
    match.value.status === "scheduled"
      ? which === "home"
        ? homeLineup.value
        : awayLineup.value
      : ops.activePlayers(selected.value, which);
  const teamRoster = roster(match.value[`${which}_team`].id);
  return selectedPlayers.map((id) => {
    const selectedPlayer = teamRoster.find((candidate) => candidate.id === id);
    return {
      id,
      name: selectedPlayer?.name ?? "Jugador",
      number: selectedPlayer?.preferred_shirt_number ?? null,
      preferredPosition: selectedPlayer?.preferred_position ?? null,
    };
  });
}
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
    addedMinutes.value = match.value?.clock.announced_added_minutes ?? 0;
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
    if (pendingCreationPreset && match.value) {
      for (const which of ["home", "away"] as Side[])
        selectFormation(which, pendingCreationPreset[which]);
      pendingCreationPreset = null;
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
function selectCreateFormation(which: Side, value: string) {
  createFormationChoice[which] = value;
  const teamId = which === "home" ? home.value : away.value;
  const saved = formations.value[teamId]?.find((item) => item.id === value);
  createFormationShape[which] = saved?.shape ?? value.replace("builtin:", "");
  createFormationLayout[which] = structuredClone(
    saved?.positions ?? formationPositions(createFormationShape[which]),
  );
}
async function loadCreationFormations(which: Side, teamId: string) {
  createFormationChoice[which] = "builtin:4-3-3";
  createFormationShape[which] = "4-3-3";
  createFormationLayout[which] = formationPositions("4-3-3");
  if (!teamId) return;
  await ops.loadTeamFormations(teamId);
  const preferred = formations.value[teamId]?.find((item) => item.is_default);
  if (preferred) selectCreateFormation(which, preferred.id);
}
watch(home, (teamId) => void loadCreationFormations("home", teamId));
watch(away, (teamId) => void loadCreationFormations("away", teamId));
async function createMatch() {
  pendingCreationPreset = { ...createFormationChoice };
  const id = await ops.create(home.value, away.value, date.value, {
    home: createFormationShape.home,
    away: createFormationShape.away,
  });
  await navigateTo(`/matches/manage/${id}`);
}
const selectedHome = computed(() => teams.value.find((team) => team.id === home.value));
const selectedAway = computed(() => teams.value.find((team) => team.id === away.value));
const formattedCreationDate = computed(() =>
  date.value ? new Date(date.value).toLocaleString("es-CL") : "Sin fecha",
);
function continueCreation() {
  error.value = "";
  if (creationStep.value === 1) {
    if (!home.value || !away.value || home.value === away.value) {
      error.value = "Selecciona dos equipos distintos.";
      return;
    }
    if (!Number.isFinite(Date.parse(date.value))) {
      error.value = "Selecciona una fecha válida.";
      return;
    }
  }
  creationStep.value = Math.min(3, creationStep.value + 1);
}
watch(side, () => {
  player.value = "";
  replacement.value = "";
  statisticPlayer.value = "";
  goalkeeper.value = "";
});
watch(statisticKind, (value) => {
  statisticPlayer.value = "";
  goalkeeper.value = "";
  statisticOutcome.value = value === "penalty_attempt" ? "missed" : "off_target";
});
useHead({
  title: props.mode === "create" ? "Crear partido · Matchday" : "Operar partidos · Matchday",
});
</script>
<template>
  <main class="match-management">
    <PageHeading
      :title="props.mode === 'create' ? 'Crear partido' : 'Panel de partido'"
      kicker="GESTIÓN"
      back-to="/"
      back-label="Ver calendario"
      :description="
        props.mode === 'create'
          ? 'Define el encuentro en pocos pasos. La alineación y la operación se realizan después.'
          : 'Controla alineaciones, reloj, eventos y estadísticas del encuentro.'
      "
    />
    <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
    <p v-if="message" class="feedback" role="status">{{ message }}</p>
    <div class="columns" :class="{ 'creation-layout': props.mode === 'create' }">
      <ManagementPanel v-if="props.mode === 'create'" title="Crear partido">
        <ol class="creation-steps" aria-label="Progreso de creación del partido">
          <li v-for="(label, index) in ['Partido', 'Formaciones', 'Revisión']" :key="label">
            <button
              type="button"
              :class="{ active: creationStep === index + 1, complete: creationStep > index + 1 }"
              :disabled="index + 1 > creationStep"
              @click="creationStep = index + 1"
            >
              <span>{{ index + 1 }}</span
              >{{ label }}
            </button>
          </li>
        </ol>
        <form
          @submit.prevent="
            run(
              createMatch,
              'Partido creado. Ahora selecciona los titulares y ajusta sus posiciones.',
            )
          "
        >
          <template v-if="creationStep === 1">
            <p class="step-copy">
              Define el encuentro. Podrás volver a modificar estos datos antes de crearlo.
            </p>
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
            ><label
              >Fecha y hora local<input v-model="date" type="datetime-local" required
            /></label>
            <div class="step-actions">
              <button type="button" @click="continueCreation">Continuar</button>
            </div>
          </template>
          <template v-else-if="creationStep === 2">
            <p class="step-copy">
              Elige la disposición inicial. Los jugadores se asignan después de crear el partido.
            </p>
            <div class="create-formation-field">
              <label
                >{{ selectedHome?.name }} · formación inicial
                <AppSelect
                  :model-value="createFormationChoice.home"
                  @update:model-value="selectCreateFormation('home', String($event))"
                >
                  <option v-for="shape in formationShapes" :key="shape" :value="`builtin:${shape}`">
                    {{ shape }} · base
                  </option>
                  <option v-for="item in formations[home] ?? []" :key="item.id" :value="item.id">
                    {{ item.name }} · {{ item.shape }}
                  </option>
                </AppSelect>
              </label>
              <NuxtLink :to="`/teams/${home}/formations`">Crear o editar formación</NuxtLink>
            </div>
            <div class="create-formation-field">
              <label
                >{{ selectedAway?.name }} · formación inicial
                <AppSelect
                  :model-value="createFormationChoice.away"
                  @update:model-value="selectCreateFormation('away', String($event))"
                >
                  <option v-for="shape in formationShapes" :key="shape" :value="`builtin:${shape}`">
                    {{ shape }} · base
                  </option>
                  <option v-for="item in formations[away] ?? []" :key="item.id" :value="item.id">
                    {{ item.name }} · {{ item.shape }}
                  </option>
                </AppSelect>
              </label>
              <NuxtLink :to="`/teams/${away}/formations`">Crear o editar formación</NuxtLink>
            </div>
            <div class="step-actions">
              <button type="button" class="secondary" @click="creationStep = 1">Volver</button>
              <button type="button" @click="continueCreation">Revisar</button>
            </div>
          </template>
          <template v-else>
            <p class="step-copy">Revisa la configuración antes de crear el encuentro.</p>
            <dl class="creation-review">
              <div>
                <dt>Partido</dt>
                <dd>{{ selectedHome?.name }} – {{ selectedAway?.name }}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{{ formattedCreationDate }}</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>{{ createFormationShape.home }}</dd>
              </div>
              <div>
                <dt>Visitante</dt>
                <dd>{{ createFormationShape.away }}</dd>
              </div>
            </dl>
            <div class="step-actions">
              <button type="button" class="secondary" @click="creationStep = 2">Volver</button>
              <button>Crear partido</button>
            </div>
          </template>
        </form>
      </ManagementPanel>
      <ManagementPanel v-if="props.mode === 'manage'" title="Seleccionar partido"
        ><div class="management-panel-heading">
          <p>Elige un encuentro existente para abrir su consola.</p>
          <NuxtLink to="/matches/create">Crear partido nuevo</NuxtLink>
        </div>
        <label
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
      <template v-if="props.mode === 'manage' && match && state"
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
                  <option v-for="shape in formationShapes" :key="shape" :value="`builtin:${shape}`">
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
            <FormationEditor
              v-model="formationLayout[which]"
              :players="formationPlayers(which)"
              :formation="formationShape[which]"
              compact
            />
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
              <option v-for="shape in formationShapes" :key="shape" :value="`builtin:${shape}`">
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
            <FormationEditor
              v-model="formationLayout[which]"
              :players="formationPlayers(which)"
              :formation="formationShape[which]"
              compact
            />
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
          ><div class="live-control-heading">
            <div>
              <span class="live-indicator" :class="{ paused: isBreak }"></span>
              <strong>{{ matchState(match) }}</strong>
            </div>
            <span v-if="hasActiveClock">Periodo en curso</span>
            <span v-else-if="isBreak">Reloj detenido</span>
          </div>
          <div v-if="hasActiveClock" class="added-time-control">
            <label
              >Tiempo añadido
              <input v-model.number="addedMinutes" type="number" min="0" max="30" />
            </label>
            <button
              class="secondary"
              @click="
                run(() => ops.setAddedTime(selected, addedMinutes), 'Tiempo añadido actualizado.')
              "
            >
              Guardar descuento
            </button>
          </div>
          <div class="period-actions">
            <button
              v-if="match.status === 'scheduled'"
              @click="run(() => ops.period(selected, 'next'), 'Primer tiempo iniciado.')"
            >
              Comenzar primer tiempo
            </button>
            <button
              v-else-if="match.current_period === 'first_half' && hasActiveClock"
              @click="run(() => ops.period(selected, 'next'), 'Primer tiempo finalizado.')"
            >
              Terminar primer tiempo
            </button>
            <button
              v-else-if="match.current_period === 'halftime'"
              @click="run(() => ops.period(selected, 'next'), 'Segundo tiempo iniciado.')"
            >
              Empezar segundo tiempo
            </button>
            <button
              v-else-if="match.current_period === 'second_half' && hasActiveClock"
              @click="run(() => ops.period(selected, 'next'), 'Tiempo reglamentario finalizado.')"
            >
              Terminar segundo tiempo
            </button>
            <template v-else-if="canChooseOutcome">
              <button @click="run(() => ops.period(selected, 'finish'), 'Partido finalizado.')">
                Finalizar partido
              </button>
              <button
                v-if="match.home_team.score === match.away_team.score"
                class="secondary"
                @click="run(() => ops.period(selected, 'extra'), 'Primer tiempo extra iniciado.')"
              >
                Comenzar tiempo extra
              </button>
              <button
                v-if="match.home_team.score === match.away_team.score"
                class="secondary"
                @click="run(() => ops.shootout(selected), 'Tanda de penales iniciada.')"
              >
                Ir a penales
              </button>
            </template>
            <button
              v-else-if="match.current_period === 'extra_time_first_half' && hasActiveClock"
              @click="run(() => ops.period(selected, 'next'), 'Primer tiempo extra finalizado.')"
            >
              Terminar primer tiempo extra
            </button>
            <button
              v-else-if="match.current_period === 'extra_time_halftime'"
              @click="run(() => ops.period(selected, 'next'), 'Segundo tiempo extra iniciado.')"
            >
              Empezar segundo tiempo extra
            </button>
            <button
              v-else-if="match.current_period === 'extra_time_second_half'"
              @click="run(() => ops.period(selected, 'finish'), 'Partido finalizado.')"
            >
              Terminar partido
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
            ><button :disabled="!hasActiveClock">Registrar evento</button>
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
        <ManagementPanel
          v-if="match.status === 'live' && !match.shootout"
          title="Estadísticas en vivo"
        >
          <p>Registra las acciones que alimentan el acta y las estadísticas del encuentro.</p>
          <form
            @submit.prevent="
              run(
                () =>
                  ops.statistic(selected, side, statisticKind, minute, {
                    player: statisticPlayer,
                    outcome: statisticOutcome,
                    goalkeeper,
                    reason: varReason,
                    decision: varDecision,
                  }),
                'Acción registrada.',
              )
            "
          >
            <label
              >Equipo<AppSelect v-model="side"
                ><option value="home">{{ match.home_team.name }}</option>
                <option value="away">{{ match.away_team.name }}</option></AppSelect
              ></label
            >
            <label
              >Acción<AppSelect v-model="statisticKind"
                ><option value="shot">Tiro</option>
                <option value="penalty_attempt">Penal fallado</option>
                <option value="foul">Falta</option>
                <option value="corner">Tiro de esquina</option>
                <option value="offside">Fuera de juego</option>
                <option value="injury">Lesión</option>
                <option value="var">Revisión VAR</option></AppSelect
              ></label
            >
            <label v-if="statisticKind !== 'var'"
              >Jugador<AppSelect v-model="statisticPlayer" required
                ><option value="">Selecciona jugador</option>
                <option v-for="candidate in candidates" :key="candidate.id" :value="candidate.id">
                  {{ candidate.name }}
                </option></AppSelect
              ></label
            >
            <label v-if="statisticKind === 'shot'"
              >Resultado<AppSelect v-model="statisticOutcome"
                ><option value="off_target">Fuera</option>
                <option value="saved">Atajado</option>
                <option value="blocked">Bloqueado</option>
                <option value="woodwork">Al poste</option></AppSelect
              ></label
            >
            <label v-else-if="statisticKind === 'penalty_attempt'"
              >Resultado<AppSelect v-model="statisticOutcome"
                ><option value="missed">Fuera</option>
                <option value="saved">Atajado</option>
                <option value="hit_post">Al poste</option></AppSelect
              ></label
            >
            <label v-if="statisticKind === 'shot' && statisticOutcome === 'saved'"
              >Arquero<AppSelect v-model="goalkeeper" required
                ><option value="">Selecciona arquero rival</option>
                <option
                  v-for="candidate in opponentPlayers"
                  :key="candidate.id"
                  :value="candidate.id"
                >
                  {{ candidate.name }}
                </option></AppSelect
              ></label
            >
            <template v-if="statisticKind === 'var'">
              <label
                >Motivo<AppSelect v-model="varReason"
                  ><option value="goal">Gol</option>
                  <option value="penalty">Penal</option>
                  <option value="direct_red_card">Tarjeta roja directa</option>
                  <option value="mistaken_identity">Identidad equivocada</option></AppSelect
                ></label
              >
              <label
                >Decisión<AppSelect v-model="varDecision"
                  ><option value="confirmed">Confirmada</option>
                  <option value="overturned">Revocada</option>
                  <option value="changed">Modificada</option></AppSelect
                ></label
              >
            </template>
            <label
              >Minuto<input v-model.number="minute" type="number" min="0" max="150" required
            /></label>
            <button :disabled="!hasActiveClock">Registrar acción</button>
          </form>
          <form
            class="possession-control"
            @submit.prevent="
              run(() => ops.possession(selected, homePossession), 'Posesión actualizada.')
            "
          >
            <label
              >Posesión de {{ match.home_team.name }}
              <input v-model.number="homePossession" type="number" min="0" max="100" required />
            </label>
            <p>{{ homePossession }}% – {{ 100 - homePossession }}%</p>
            <button :disabled="!hasActiveClock">Actualizar posesión</button>
          </form>
        </ManagementPanel>
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
          ><button
            v-else-if="match.shootout.status === 'decided'"
            @click="run(() => ops.finishShootout(selected), 'Tanda y partido finalizados.')"
          >
            Confirmar resultado y finalizar partido
          </button></ManagementPanel
        >
      </template>
    </div>
    <OperatedMatchReport
      v-if="props.mode === 'manage' && match && state"
      :match-id="match.id"
      class="report"
    />
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
.columns.creation-layout {
  grid-template-columns: minmax(0, 720px);
  justify-content: center;
}
.management-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}
.management-panel-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.management-panel-heading a {
  flex: none;
  color: var(--accent);
  font-weight: 700;
  font-size: 12px;
}
form {
  display: grid;
  gap: 16px;
}
.creation-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
}
.creation-steps button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-bottom: 2px solid var(--border);
  color: var(--muted);
  font-size: 11px;
  text-align: left;
}
.creation-steps button span {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--border);
  border-radius: 50%;
  font-size: 10px;
}
.creation-steps button.active,
.creation-steps button.complete {
  border-color: var(--accent);
  color: var(--text-color);
}
.creation-steps button.active span,
.creation-steps button.complete span {
  border-color: var(--accent);
  color: var(--accent);
}
.step-copy {
  margin: 0 0 4px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}
.step-actions .secondary {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-color);
}
.creation-review {
  display: grid;
  gap: 0;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.creation-review div {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--border);
}
.creation-review div:last-child {
  border-bottom: 0;
}
.creation-review dt {
  color: var(--muted);
  font-size: 11px;
}
.creation-review dd {
  margin: 0;
  font-weight: 600;
}
.create-formation-field {
  display: grid;
  gap: 8px;
  margin-top: -6px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 88%, var(--accent));
}
.create-formation-field a {
  width: max-content;
  color: var(--accent);
  font-size: 11px;
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
.live-control-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 92%, var(--accent));
}
.live-control-heading div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.live-control-heading > span {
  color: var(--muted);
  font-size: 11px;
}
.live-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
}
.live-indicator.paused {
  background: var(--muted);
  box-shadow: none;
}
.added-time-control {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) auto;
  align-items: end;
  gap: 12px;
  margin-top: 16px;
}
.period-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.period-actions .secondary,
.added-time-control .secondary {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-color);
}
.possession-control {
  grid-template-columns: minmax(180px, 1fr) auto auto;
  align-items: end;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.possession-control p {
  margin: 0 0 12px;
  color: var(--accent);
  font-weight: 700;
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
  .added-time-control {
    grid-template-columns: 1fr;
  }
  .possession-control {
    grid-template-columns: 1fr;
  }
}
</style>
