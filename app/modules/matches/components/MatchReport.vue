<script setup lang="ts">
import PlayerEvents from "~/modules/matches/components/PlayerEvents.vue";
import ShootoutSummary from "~/modules/matches/components/ShootoutSummary.vue";
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue";

import type { Shootout } from "~/modules/matches/utils/shootout";
import {
  ArrowPathIcon,
  ArrowsUpDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  FlagIcon,
  ExclamationCircleIcon,
  PlusIcon,
  VideoCameraIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import type { ReportEvent } from "~/modules/matches/types/report";
type Team = {
  name: string;
  goals: { goal_type: string; minute: number; added_minute?: number }[];
  penalty_score?: number;
};
const props = defineProps<{
  view: "chronology" | "statistics";
  match: {
    shootout?: Shootout;
    status: string;
    current_minute?: number | null;
    current_period?: string | null;
    home_team: Team;
    away_team: Team;
  };
  events: ReportEvent[];
}>();
const newestFirst = ref(true);
const teams = computed(() => [props.match.home_team, props.match.away_team]);
const hasShootout = computed(() => props.match.home_team.penalty_score != null);
const timeline = computed(() => {
  if (props.match.status === "scheduled") return [];
  const events: (ReportEvent & { order: number })[] = props.events.map((event) => ({
    ...event,
    order:
      event.kind === "shootout" ? 12100 + event.sequence! : event.minute * 100 + (event.added || 0),
  }));
  const phase = (id: string, label: string, minute: number, order: number, description?: string) =>
    events.push({
      id,
      kind: "phase",
      label,
      minute,
      order,
      side: -1,
      description,
    });
  phase("start", "Inicio del partido", 0, -1);
  if ((props.match.current_minute ?? 0) >= 45 || props.match.status === "finished") {
    const score = teams.value
      .map((team) => team.goals.filter((goal) => goal.minute <= 45).length)
      .join(" – ");
    phase("halftime", "Medio tiempo", 45, 4599, score);
  }
  if ((props.match.current_minute ?? 0) > 45 || props.match.status === "finished")
    phase("second-half", "Inicio del segundo tiempo", 46, 4600);
  if ((props.match.current_minute ?? 0) > 90 || props.match.status === "finished")
    phase("extra-time", "Inicio de la prórroga", 90, 9099);
  if ((props.match.current_minute ?? 0) > 105 || props.match.status === "finished")
    phase("extra-second", "Segundo tiempo de prórroga", 105, 10599);
  if (hasShootout.value) phase("shootout-start", "Inicio de la tanda de penales", 120, 12099);
  if (props.match.status === "finished") {
    const winner =
      (props.match.home_team.penalty_score ?? 0) > (props.match.away_team.penalty_score ?? 0)
        ? props.match.home_team
        : props.match.away_team;
    phase(
      "end",
      "Final del partido",
      120,
      13000,
      hasShootout.value ? `${winner.name} gana por penales` : "Partido finalizado",
    );
  }
  return events.sort((a, b) => (newestFirst.value ? b.order - a.order : a.order - b.order));
});
const rows = computed(() => {
  const count = (side: number, kind: string) =>
    props.events.filter((event) => event.side === side && event.kind === kind).length;
  const fieldGoals = (side: number) =>
    teams.value[side]!.goals.filter((goal) => goal.goal_type !== "own_goal").length;
  const onTarget = (side: number) =>
    props.events.filter(
      (event) =>
        event.side === side &&
        ((event.kind === "shot" && event.label === "Tiro al arco") || event.kind === "penalty"),
    ).length + fieldGoals(side);
  const shots = (side: number) => count(side, "shot") + count(side, "penalty") + fieldGoals(side);
  return [
    { label: "Posesión", values: [54, 46], percent: true },
    { label: "Tiros totales", values: [shots(0), shots(1)] },
    { label: "Tiros al arco", values: [onTarget(0), onTarget(1)] },
    {
      label: "Atajadas",
      values: [onTarget(1) - fieldGoals(1), onTarget(0) - fieldGoals(0)],
    },
    {
      label: "Faltas",
      lowerWins: true,
      values: [count(0, "foul"), count(1, "foul")],
    },
    {
      label: "Tiros de esquina",
      values: [count(0, "corner"), count(1, "corner")],
    },
    {
      label: "Fueras de juego",
      lowerWins: true,
      values: [count(0, "offside"), count(1, "offside")],
    },
    {
      label: "Tarjetas amarillas",
      lowerWins: true,
      values: [count(0, "yellow"), count(1, "yellow")],
    },
    {
      label: "Tarjetas rojas",
      lowerWins: true,
      values: [count(0, "red"), count(1, "red")],
    },
  ];
});
function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}
function winsStatistic(row: { values: number[]; lowerWins?: boolean }, side: number) {
  const own = row.values[side]!,
    other = row.values[1 - side]!;
  return row.lowerWins ? own < other : own > other;
}
function eventIcon(kind: string, outcome?: string) {
  return (
    (
      {
        substitution: ArrowPathIcon,
        var: VideoCameraIcon,
        injury: PlusIcon,
        foul: ExclamationCircleIcon,
        corner: FlagIcon,
        offside: FlagIcon,
        shot: ArrowUpRightIcon,
        penalty: XCircleIcon,
        shootout: outcome === "scored" ? CheckCircleIcon : XCircleIcon,
      } as Record<string, typeof ClockIcon>
    )[kind] || ClockIcon
  );
}
</script>

<template>
  <section v-if="match.status === 'scheduled'" class="report-empty">
    <AnimatedHeroIcon
      :icon="ClockIcon"
      motion="turn"
      class="report-icon clock-icon"
      aria-hidden="true"
    />
    <h3>El partido aún no comienza</h3>
    <p>
      {{
        view === "chronology"
          ? "Aquí aparecerán los eventos con sus minutos cuando empiece el encuentro."
          : "Las estadísticas estarán disponibles cuando comience el partido."
      }}
    </p>
  </section>
  <section
    v-else-if="view === 'statistics'"
    class="statistics-panel"
    aria-label="Estadísticas del partido"
  >
    <div class="statistics-heading">
      <span class="team-token home">{{ initials(match.home_team.name) }}</span>
      <h3>Estadísticas del equipo</h3>
      <span class="team-token away">{{ initials(match.away_team.name) }}</span>
    </div>
    <div class="statistics-teams">
      <span>{{ match.home_team.name }}</span
      ><span>{{ match.away_team.name }}</span>
    </div>
    <div v-for="row in rows" :key="row.label" class="stat-row">
      <div class="stat-values">
        <strong :class="{ leading: winsStatistic(row, 0) }"
          >{{ row.values[0] }}{{ row.percent ? "%" : "" }}</strong
        ><span>{{ row.label }}</span
        ><strong :class="{ leading: winsStatistic(row, 1) }"
          >{{ row.values[1] }}{{ row.percent ? "%" : "" }}</strong
        >
      </div>
    </div>
    <p class="report-note">
      Estadísticas de demostración · No incluyen los lanzamientos de la tanda.
    </p>
  </section>
  <section v-else class="chronology-panel" aria-label="Cronología del partido">
    <div class="chronology-toolbar">
      <span>{{ events.length }} eventos · Demo</span
      ><button @click="newestFirst = !newestFirst">
        {{ newestFirst ? "Más recientes primero" : "Desde el inicio" }}
        <AnimatedHeroIcon
          :icon="ArrowsUpDownIcon"
          motion="arrow"
          class="report-icon"
          aria-hidden="true"
        />
      </button>
    </div>
    <ShootoutSummary
      v-if="match.shootout"
      :shootout="match.shootout"
      :home="match.home_team.name"
      :away="match.away_team.name"
    />
    <ol class="timeline">
      <li v-for="event in timeline" :key="event.id" :class="{ milestone: event.kind === 'phase' }">
        <div v-if="event.kind === 'phase'" class="phase">
          <div class="phase-icon-wrap">
            <AnimatedHeroIcon
              :icon="ClockIcon"
              motion="turn"
              class="report-icon clock-icon"
              aria-hidden="true"
            />
          </div>
          <div class="phase-content">
            <h4>
              <span class="phase-line" aria-hidden="true"></span>
              <span class="phase-label">{{ event.label }}</span>
              <span class="phase-line" aria-hidden="true"></span>
            </h4>
            <span>{{ event.minute }}′</span>
            <p v-if="event.description">{{ event.description }}</p>
          </div>
        </div>
        <article
          v-else
          class="event-card"
          :class="{
            'goal-event': event.kind === 'goal',
            'home-event': event.side === 0,
            'away-event': event.side === 1,
          }"
        >
          <header>
            <span class="event-heading"
              ><PlayerEvents
                v-if="['goal', 'yellow', 'red'].includes(event.kind)"
                :events="[
                  {
                    kind: event.kind,
                    label: event.label,
                    minute: event.minute,
                    added: event.added,
                  },
                ]"
              /><AnimatedHeroIcon
                :icon="eventIcon(event.kind, event.outcome)"
                motion="turn"
                v-else
                class="report-icon timeline-icon"
                :class="event.kind"
                aria-hidden="true"
              />{{ event.label }}</span
            ><time>{{
              event.kind === "shootout"
                ? `Lanzamiento ${event.sequence}`
                : `${event.minute}${event.added ? "+" + event.added : ""}′`
            }}</time>
          </header>
          <div v-if="event.score" class="event-score">
            <span>{{ match.home_team.name }}</span
            ><strong>{{ event.score }}</strong
            ><span>{{ match.away_team.name }}</span>
          </div>
          <div class="event-content">
            <template v-if="event.kind === 'substitution'"
              ><div class="event-player">
                <div>
                  <small class="incoming"
                    ><AnimatedHeroIcon
                      :icon="ArrowRightIcon"
                      motion="arrow"
                      class="report-icon"
                      aria-hidden="true"
                    />
                    ENTRA</small
                  >
                  <h4>{{ event.incoming }}</h4>
                  <p>{{ teams[event.side]!.name }}</p>
                </div>
                <span class="player-token incoming-token">{{ initials(event.incoming!) }}</span>
              </div>
              <div class="event-player">
                <div>
                  <small class="outgoing"
                    ><AnimatedHeroIcon
                      :icon="ArrowLeftIcon"
                      motion="arrow"
                      class="report-icon"
                      aria-hidden="true"
                    />
                    SALE</small
                  >
                  <h4>{{ event.player }}</h4>
                  <p>{{ teams[event.side]!.name }}</p>
                </div>
                <span class="player-token outgoing-token">{{ initials(event.player!) }}</span>
              </div></template
            >
            <div v-else class="event-player">
              <div>
                <h4>{{ event.player || teams[event.side]!.name }}</h4>
                <p v-if="event.player">{{ teams[event.side]!.name }}</p>
                <p
                  v-if="event.description && event.kind !== 'substitution'"
                  class="event-description"
                >
                  {{ event.description }}
                </p>
              </div>
              <span v-if="event.player" class="player-token">{{ initials(event.player) }}</span>
            </div>
            <div v-if="event.kind === 'goal' && event.assistPlayer" class="goal-assistance">
              <span>Asistencia</span><strong>{{ event.assistPlayer }}</strong>
            </div>
            <div v-if="event.goalkeeper" class="goal-assistance">
              <span>Atajada</span><strong>{{ event.goalkeeper }}</strong>
            </div>
            <p v-if="event.description && event.kind === 'substitution'" class="event-description">
              {{ event.description }}
            </p>
          </div>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
button:hover {
  color: var(--accent);
}

.report-empty {
  text-align: center;
  padding: 65px 20px;
  color: var(--ui-muted, #aaa);
  min-height: 300px;
}
.report-empty > span {
  font-size: 30px;
}
.report-empty h3 {
  font-size: 16px;
  color: var(--ui-text, #ddd);
  font-weight: 500;
  margin: 14px 0;
}
.report-empty p {
  max-width: 380px;
  margin: auto;
  font-size: 12px;
}
.statistics-panel {
  max-width: 720px;
  margin: auto;
  padding: 30px 12px;
}
.statistics-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}
.statistics-heading h3 {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.team-token {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--ui-border, #ddd9);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}
.home {
  background: #373c42;
}
.away {
  background: #356d96;
}
.statistics-teams {
  display: flex;
  justify-content: space-between;
  margin: 16px 0 22px;
  font-size: 11px;
  color: var(--ui-muted, #aaa);
  gap: 25px;
}
.statistics-teams > span:last-child {
  text-align: right;
}
.stat-row {
  padding: 14px 0;
  border-bottom: 1px solid var(--ui-border, #ffffff08);
}
.stat-row:last-of-type {
  border-bottom: 0;
}
.stat-values {
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  gap: 15px;
  align-items: center;
  text-align: center;
  font-size: 12px;
}
.stat-values > strong {
  justify-self: start;
  font-weight: 500;
  color: var(--ui-muted, #a4a4a4);
  min-width: 30px;
  padding: 4px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
}
.stat-values > strong:last-child {
  justify-self: end;
}
.stat-values > span {
  color: var(--ui-text, #cecece);
}
.report-note {
  font-size: 10px;
  color: var(--ui-muted, #888);
  margin-top: 25px;
  text-align: center;
}
.chronology-panel {
  max-width: 650px;
  margin: auto;
  padding: 22px 12px;
}
.chronology-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--ui-muted, #888);
  font-size: 10px;
  margin-bottom: 20px;
}
.chronology-toolbar button {
  font-size: 10px;
  color: var(--ui-text, #bbb);
  padding: 8px 0;
}
.chronology-toolbar button > span {
  margin-left: 8px;
}
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.timeline > li {
  position: relative;
}
.event-card {
  border: 1px solid var(--ui-border, #44484c);
  border-radius: 7px;
  background: var(--ui-surface, #202123);
  overflow: hidden;
  border-left-width: 3px;
  border-left-color: var(--ui-border);
}
.event-card.home-event {
  border-left-color: var(--ui-success);
}
.event-card.away-event {
  border-left-color: var(--ui-info);
}
.event-card header {
  padding: 13px 16px;
  border-bottom: 1px solid var(--ui-border, #44484c);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}
.event-heading {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
}
.event-card time {
  font-size: 10px;
  color: var(--ui-text, #b3b8bf);
  white-space: nowrap;
}
.timeline-icon {
  font-size: 17px;
  color: var(--ui-text, #b6b9bc);
}
.timeline-icon.substitution {
  color: var(--ui-success, #85bb8d);
}
.event-content {
  padding: 17px;
}
.event-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}
.event-player + .event-player {
  margin-top: 17px;
}
.event-player h4 {
  font-weight: 500;
  font-size: 13px;
  color: var(--ui-text, #eee);
}
.event-player p {
  font-size: 10px;
  color: var(--ui-muted, #9c9c9c);
  margin-top: 3px;
}
.event-player small {
  display: block;
  font-size: 9px;
  margin-bottom: 6px;
}
.incoming {
  color: var(--ui-success, #8ac392);
}
.outgoing {
  color: var(--ui-danger, #e28a84);
}
.player-token {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  background: var(--ui-surface, #30363c);
  border: 1px solid var(--ui-border, #8c959e);
  border-radius: 50%;
  font-size: 10px;
  color: var(--ui-text, #dbe0e4);
}
.incoming-token {
  border-color: var(--ui-border, #8ac392);
}
.outgoing-token {
  border-color: var(--ui-border, #e28a84);
}
.event-description {
  font-size: 10px;
  color: var(--ui-muted, #aaa);
  margin-top: 7px;
}
.event-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 17px;
  background: var(--ui-surface, #ffffff08);
  padding: 10px;
  font-size: 10px;
  color: var(--ui-text, #cfd5d9);
}
.event-score > span {
  flex: 1;
  text-align: right;
}
.event-score > span:last-child {
  text-align: left;
}
.event-score > strong {
  white-space: nowrap;
  font-size: 14px;
}
.goal-event header {
  background: var(--ui-success-soft);
  border-color: var(--ui-border);
}
.goal-event.away-event header {
  background: var(--ui-info-soft);
}
.goal-event header time {
  color: var(--ui-text, #eee);
}
.phase {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  gap: 6px;
}
.phase-icon-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.phase-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  text-align: center;
  color: var(--ui-muted, #979b9f);
}
.phase h4 {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
  width: 100%;
  letter-spacing: 1px;
  margin: 0;
  line-height: 1.2;
  z-index: 1;
}
.phase-line {
  flex: 1;
  height: 1px;
  background: var(--ui-border, rgba(255, 255, 255, 0.18));
}
.phase-label {
  font-weight: 800;
  white-space: nowrap;
}
.phase > .phase-content > span {
  font-size: 10px;
  line-height: 1.2;
}
.phase p {
  font-size: 10px;
  margin: 0;
  line-height: 1.3;
}
.shootout-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--ui-border, #40453b);
  border-radius: 6px;
  background: var(--ui-surface, #20241e);
  padding: 17px;
  margin-bottom: 22px;
}
.shootout-summary > span {
  font-size: 11px;
  color: var(--ui-text, #bfc5b7);
}
.shootout-summary strong {
  font-size: 24px;
  font-weight: 500;
}
.shootout-summary p {
  font-size: 10px;
  color: var(--ui-muted, #b3b8ae);
}
@media (max-width: 700px) {
  .chronology-panel {
    padding: 18px 0;
  }
  .statistics-panel {
    padding: 24px 0;
  }
  .statistics-heading h3 {
    font-size: 10px;
  }
  .event-card header {
    padding: 12px;
  }
  .event-content {
    padding: 14px;
  }
  .event-heading {
    font-size: 9px;
  }
  .event-score {
    gap: 10px;
    font-size: 9px;
  }
  .stat-values {
    font-size: 11px;
    grid-template-columns: 40px 1fr 40px;
  }
  .chronology-toolbar {
    font-size: 9px;
  }
  .event-card time {
    font-size: 9px;
  }
}

.stat-values > strong.leading {
  background: var(--ui-success-soft, #22563e);
  color: var(--ui-success, #b8f3cf);
  font-weight: 600;
  border-radius: 12px;
  padding: 4px 8px;
}
.report-icon {
  display: inline-block;
  width: 17px;
  height: 17px;
  vertical-align: middle;
  flex-shrink: 0;
}
.clock-icon {
  width: 24px;
  height: 24px;
}
.report-empty > .clock-icon {
  width: 30px;
  height: 30px;
}
.chronology-toolbar .report-icon {
  margin-left: 6px;
  width: 14px;
  height: 14px;
}
.event-player small .report-icon {
  width: 12px;
  height: 12px;
}
.stat-values > strong {
  min-width: 36px;
}

.goal-assistance {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid var(--ui-border, #ffffff0a);
}
.goal-assistance > span {
  font-size: 10px;
  color: var(--ui-muted, #939b9c);
}
.goal-assistance > strong {
  font-size: 11px;
  font-weight: 500;
  color: var(--ui-text, #c9d4d0);
}
html[data-theme="light"] .home {
  background: #e1e7ec;
}
html[data-theme="light"] .away {
  background: #d5e8f6;
}
html[data-theme="light"] .goal-event.away-event header {
  background: var(--ui-info-soft);
  border-color: var(--ui-border);
}

@media (prefers-reduced-motion: no-preference) {
  button,
  a,
  input {
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }
  button:not(:disabled):active,
  .primary-action:active {
    transform: translateY(1px);
  }
  input:focus-visible {
    box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  }
}
</style>
