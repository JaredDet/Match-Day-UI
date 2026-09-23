<script setup lang="ts">
import MatchReport from "~/modules/matches/components/MatchReport.vue"
import PlayerEvents from "~/modules/matches/components/PlayerEvents.vue"

import type { Shootout } from "~/modules/matches/utils/shootout";
import type { ReportEvent } from "~/modules/matches/types/report";
type Goal = {
  player_name: string;
  goal_type: string;
  minute: number;
  added_minute?: number;
  assist_player_name?: string;
};
type Team = {
  id: string;
  name: string;
  formation: string | null;
  formation_variant?: "open" | "closed";
  positions: { number: number; y: number }[];
  goals: Goal[];
  penalty_score?: number;
};
const props = defineProps<{
  match: {
    shootout?: Shootout;
    id: string;
    status: string;
    current_minute?: number | null;
    current_period?: string | null;
    home_team: Team;
    away_team: Team;
  };
}>();
const squads = computed(() =>
  [props.match.home_team, props.match.away_team].map((team, side) => {
    const names =
      side === 0
        ? [
            "C. Herrera",
            "F. Soto",
            "R. Pérez",
            "N. Díaz",
            "S. Leiva",
            "P. Vidal",
            "A. Fuentes",
            "E. Morales",
            "M. Torres",
            "J. Rojas",
            "B. Castro",
            "G. Arias",
            "I. Reyes",
            "L. Pizarro",
            "V. Rivas",
          ]
        : [
            "G. Ríos",
            "T. Bravo",
            "A. Medina",
            "C. Salas",
            "M. Vera",
            "F. Muñoz",
            "E. Lagos",
            "D. Silva",
            "J. Peña",
            "H. Campos",
            "L. Núñez",
            "S. Tapia",
            "N. Araya",
            "B. Jara",
            "A. Ramos",
          ];
    const numbers = [1, 2, 4, 5, 3, 6, 8, 10, 7, 9, 11, 12, 14, 16, 18];
    const formation = team.formation || (side === 0 ? "4-3-3" : "4-2-3-1");
    const lines = [1, ...formation.split("-").map(Number)];
    let index = 0;
    const players = lines.flatMap((count, line) =>
      Array.from({ length: count }, () => {
        const i = index++;
        const x = 6 + line * (38 / (lines.length - 1));
        return {
          name: names[i]!,
          number: numbers[i]!,
          role:
            line === 0
              ? "Portero"
              : line === 1
                ? "Defensa"
                : line === lines.length - 1
                  ? "Delantero"
                  : "Mediocampista",
          captain: i === 2,
          x: side === 0 ? x : 100 - x,
          y: Math.max(
            8,
            Math.min(
              92,
              team.positions.find((position) => position.number === numbers[i])
                ?.y ?? 50,
            ),
          ),
        };
      }),
    );
    return {
      team,
      players,
      formation,
      side,
      coach: side === 0 ? "Ricardo Valdés" : "Martín Acuña",
      color: side === 0 ? "#282c30" : "#356d96",
      substitutes: names
        .slice(11)
        .map((name, i) => ({ name, number: numbers[i + 11] })),
    };
  }),
);
type PlayerEvent = {
  kind: string;
  label: string;
  minute: number;
  added?: number;
};
const minute = computed(() =>
  props.match.status === "scheduled"
    ? 0
    : props.match.status === "finished"
      ? 120
      : (props.match.current_minute ?? 0),
);
function substitution(side: number) {
  return {
    minute: side === 0 ? 62 : 70,
    out: side === 0 ? "E. Morales" : "J. Peña",
    incoming: side === 0 ? "L. Pizarro" : "B. Jara",
    number: 16,
  };
}
function eventsFor(team: Team, name: string, side: number): PlayerEvent[] {
  if (props.match.status === "scheduled") return [];
  const events: PlayerEvent[] = [];
  for (const goal of team.goals) {
    if (goal.player_name === name)
      events.push({
        kind: "goal",
        label:
          goal.goal_type === "own_goal"
            ? "Autogol"
            : goal.goal_type === "penalty"
              ? "Gol de penal"
              : "Gol",
        minute: goal.minute,
        added: goal.added_minute,
      });
    if (goal.assist_player_name === name)
      events.push({
        kind: "assist",
        label: "Asistencia",
        minute: goal.minute,
        added: goal.added_minute,
      });
  }
  if (name === (side === 0 ? "F. Soto" : "C. Salas"))
    events.push({
      kind: "yellow",
      label: "Tarjeta amarilla",
      minute: side === 0 ? 31 : 38,
    });
  if (side === 1 && name === "E. Lagos")
    events.push({ kind: "red", label: "Tarjeta roja", minute: 86 });
  const change = substitution(side);
  if (name === change.out) {
    if (side === 0)
      events.push({ kind: "injury", label: "Lesión", minute: 61 });
    events.push({
      kind: "out",
      label: `Sale por ${change.incoming}`,
      minute: change.minute,
    });
  }
  if (name === change.incoming)
    events.push({
      kind: "in",
      label: `Entra por ${change.out}`,
      minute: change.minute,
    });
  return events
    .filter((event) => event.minute <= minute.value)
    .sort((a, b) => a.minute - b.minute);
}

const detailTabs = [
  { id: "chronology", label: "Cronología" },
  { id: "lineups", label: "Alineaciones" },
  { id: "statistics", label: "Estadísticas" },
] as const;
const activeTab = ref("lineups");
watch(
  () => props.match.id,
  () => {
    activeTab.value = "lineups";
  },
);
function navigateTab(event: KeyboardEvent, index: number) {
  const delta =
    event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (!delta && event.key !== "Home" && event.key !== "End") return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? 2
        : (index + delta + 3) % 3;
  activeTab.value = detailTabs[next]!.id;
  const buttons = (
    event.currentTarget as HTMLElement
  ).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  buttons?.[next]?.focus();
}
const reportEvents = computed<ReportEvent[]>(() => {
  if (props.match.status === "scheduled") return [];
  const items: ReportEvent[] = [];
  for (const squad of squads.value) {
    for (const player of [...squad.players, ...squad.substitutes]) {
      for (const event of eventsFor(squad.team, player.name, squad.side)) {
        if (["goal", "assist", "in"].includes(event.kind)) continue;
        items.push({
          id: `${squad.side}-${player.number}-${event.kind}`,
          kind: event.kind === "out" ? "substitution" : event.kind,
          label: event.kind === "out" ? "Cambio" : event.label,
          minute: event.minute,
          added: event.added,
          side: squad.side,
          player: player.name,
          incoming:
            event.kind === "out"
              ? substitution(squad.side).incoming
              : undefined,
          description:
            event.kind === "out" && squad.side === 0
              ? "Cambio por lesión"
              : undefined,
        });
      }
    }
    squad.team.goals.forEach((goal, index) =>
      items.push({
        id: `goal-${squad.side}-${index}`,
        kind: "goal",
        label:
          goal.goal_type === "own_goal"
            ? "Autogol"
            : goal.goal_type === "penalty"
              ? "Gol de penal"
              : "¡Gol!",
        minute: goal.minute,
        added: goal.added_minute,
        side: squad.side,
        player: goal.player_name,
        assistPlayer:
          goal.goal_type === "own_goal" ? undefined : goal.assist_player_name,
        description:
          goal.goal_type === "own_goal"
            ? "Gol a favor por autogol rival"
            : undefined,
      }),
    );
  }
  const extra: ReportEvent[] = [
    {
      id: "shot-1",
      kind: "shot",
      label: "Tiro al arco",
      minute: 8,
      side: 0,
      player: "M. Torres",
      goalkeeper: "G. Ríos",
    },
    {
      id: "corner-1",
      kind: "corner",
      label: "Tiro de esquina",
      minute: 9,
      side: 0,
      player: "P. Vidal",
    },
    {
      id: "foul-1",
      kind: "foul",
      label: "Falta",
      minute: 14,
      side: 1,
      player: "T. Bravo",
    },
    {
      id: "offside-1",
      kind: "offside",
      label: "Fuera de juego",
      minute: 27,
      side: 0,
      player: "J. Rojas",
    },
    {
      id: "shot-2",
      kind: "shot",
      label: "Tiro desviado",
      minute: 35,
      side: 1,
      player: "L. Núñez",
    },
    {
      id: "var-1",
      kind: "var",
      label: "Revisión del VAR",
      minute: 44,
      side: 0,
      description: "Posible penal · Decisión: no se concede penal",
    },
    {
      id: "corner-2",
      kind: "corner",
      label: "Tiro de esquina",
      minute: 54,
      side: 1,
      player: "F. Muñoz",
    },
    {
      id: "penalty-1",
      kind: "penalty",
      label: "Penal atajado",
      minute: 58,
      side: 1,
      player: "D. Silva",
      goalkeeper: "C. Herrera",
    },
    {
      id: "foul-2",
      kind: "foul",
      label: "Falta",
      minute: 77,
      side: 0,
      player: "A. Fuentes",
    },
  ];
  items.push(...extra.filter((event) => event.minute <= minute.value));
  items.sort((a, b) => a.minute - b.minute || (a.added || 0) - (b.added || 0));
  const score = [0, 0];
  for (const event of items)
    if (event.kind === "goal") {
      score[event.side] = score[event.side]! + 1;
      event.score = score.join(" – ");
    }
  if (props.match.shootout) {
    const penalties = [0, 0];
    props.match.shootout.kicks.forEach(
      ({ side, player, outcome, sequence }) => {
        if (outcome === "scored") penalties[side] = penalties[side]! + 1;
        items.push({
          id: `kick-${sequence}`,
          kind: "shootout",
          label: outcome === "scored" ? "Penal convertido" : "Penal fallado",
          minute: 120,
          side,
          player,
          sequence,
          outcome,
          score: penalties.join(" – "),
        });
      },
    );
  }
  return items;
});
</script>

<template>
  <section class="field-section" aria-labelledby="field-title">
    <div class="detail-section-heading">
      <h3 id="field-title">Así se paran en la cancha</h3>
      <span>{{
        match.status === "scheduled"
          ? "Alineaciones probables · Demo"
          : "Once inicial · Demo"
      }}</span>
    </div>
    <div class="field-legend">
      <span v-for="squad in squads" :key="squad.team.id"
        ><i :style="{ background: squad.color }" />{{ squad.team.name }}
        <strong
          >{{ squad.formation
          }}{{
            squad.team.formation_variant === "closed"
              ? " · Cerrado"
              : squad.team.formation_variant === "open"
                ? " · Abierto"
                : ""
          }}</strong
        ></span
      >
    </div>
    <div
      class="pitch-scroll"
      tabindex="0"
      role="region"
      aria-label="Cancha con las alineaciones. En móvil puedes desplazarla horizontalmente."
    >
      <div class="football-field">
        <svg
          class="grass-texture"
          width="100%"
          height="100%"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="pitch-mowing"
              width="20%"
              height="33.333%"
              patternUnits="objectBoundingBox"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
            >
              <path
                d="M0 0h100v100H0zM100 100h100v100H100z"
                fill="#1d482b"
                opacity=".12"
              />
              <path
                d="M100 0h100v100H100zM0 100h100v100H0z"
                fill="#9bb487"
                opacity=".08"
              />
            </pattern>
            <filter
              id="pitch-grass-grain"
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".85"
                numOctaves="3"
                seed="17"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="2.6" intercept="-.8" />
                <feFuncG type="linear" slope="2.6" intercept="-.8" />
                <feFuncB type="linear" slope="2.6" intercept="-.8" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitch-mowing)" />
          <rect
            width="100%"
            height="100%"
            filter="url(#pitch-grass-grain)"
            opacity=".12"
          />
        </svg>
        <svg
          class="field-lines"
          viewBox="0 0 1000 580"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g fill="none" stroke="#e2eddd" stroke-width="2" opacity=".7">
            <rect x="30" y="30" width="940" height="520" />
            <path
              d="M500 30v520M30 165h140v250H30m940-250H830v250h140M30 230h55v120H30m940-120h-55v120h55"
            />
            <circle cx="500" cy="290" r="70" />
            <path d="M170 235a70 70 0 0 1 0 110m660-110a70 70 0 0 0 0 110" />
          </g>
          <g fill="#e2eddd">
            <circle cx="500" cy="290" r="3" />
            <circle cx="130" cy="290" r="3" />
            <circle cx="870" cy="290" r="3" />
          </g>
        </svg>
        <div v-for="squad in squads" :key="squad.team.id">
          <div
            v-for="player in squad.players"
            :key="player.number"
            class="field-player"
            :style="{
              left: player.x + '%',
              top: player.y + '%',
              '--shirt': squad.color,
            }"
          >
            <span class="shirt"
              >{{ player.number
              }}<small
                v-if="player.captain"
                class="captain"
                aria-label="Capitán"
                >C</small
              ><span class="pitch-player-events"
                ><PlayerEvents
                  :events="
                    eventsFor(squad.team, player.name, squad.side).filter(
                      (event) => ['goal', 'yellow', 'red'].includes(event.kind),
                    )
                  " /></span></span
            ><span class="player-name">{{ player.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <p class="field-hint">
      Once inicial · C: capitán · ⚽: gol · 🟨 / 🟥: tarjetas
      <span>Desliza la cancha para ver ambos equipos en móvil.</span>
    </p>
  </section>
  <div class="detail-tabs" role="tablist" aria-label="Información del partido">
    <button
      v-for="(tab, index) in detailTabs"
      :id="`detail-tab-${tab.id}`"
      :key="tab.id"
      role="tab"
      :aria-selected="activeTab === tab.id"
      :aria-controls="`detail-panel-${tab.id}`"
      :tabindex="activeTab === tab.id ? 0 : -1"
      @click="activeTab = tab.id"
      @keydown="navigateTab($event, index)"
    >
      {{ tab.label }}
    </button>
  </div>
  <div
    v-show="activeTab === 'lineups'"
    id="detail-panel-lineups"
    role="tabpanel"
    aria-labelledby="detail-tab-lineups"
    tabindex="0"
  >
    <section aria-labelledby="lineups-title" class="lineups-section">
      <div class="detail-section-heading">
        <h3 id="lineups-title">Alineaciones</h3>
        <span>{{
          match.status === "scheduled"
            ? "Propuesta visual, no confirmada"
            : "Titulares y suplentes"
        }}</span>
      </div>
      <div class="squad-grid">
        <section
          v-for="squad in squads"
          :key="squad.team.id"
          class="squad-panel"
        >
          <header>
            <h4>{{ squad.team.name }}</h4>
            <span
              >{{ squad.formation
              }}{{
                squad.team.formation_variant === "closed"
                  ? " · Cerrado"
                  : squad.team.formation_variant === "open"
                    ? " · Abierto"
                    : ""
              }}</span
            >
          </header>
          <p class="coach">DT · {{ squad.coach }}</p>
          <h5>TITULARES</h5>
          <ul>
            <li v-for="player in squad.players" :key="player.number">
              <span class="lineup-number">{{ player.number }}</span
              ><span class="lineup-player"
                >{{ player.name }} <small v-if="player.captain">C</small
                ><PlayerEvents
                  :events="eventsFor(squad.team, player.name, squad.side)"
                  detailed /></span
              ><span class="player-role">{{ player.role }}</span>
            </li>
          </ul>
          <h5>SUPLENTES</h5>
          <ul>
            <li v-for="player in squad.substitutes" :key="player.number">
              <span class="lineup-number">{{ player.number }}</span
              ><span class="lineup-player"
                >{{ player.name
                }}<PlayerEvents
                  :events="eventsFor(squad.team, player.name, squad.side)"
                  detailed
              /></span>
            </li>
          </ul>
        </section>
      </div>
    </section>
    <section class="venue-section" aria-labelledby="venue-title">
      <div class="detail-section-heading">
        <h3 id="venue-title">Información del encuentro</h3>
      </div>
      <dl class="venue-grid">
        <div>
          <dt>Estadio</dt>
          <dd>Estadio del Parque</dd>
        </div>
        <div>
          <dt>Ciudad</dt>
          <dd>Santiago, Chile</dd>
        </div>
        <div>
          <dt>Árbitro principal</dt>
          <dd>Andrés Molina</dd>
        </div>
        <div>
          <dt>Árbitros asistentes</dt>
          <dd>Felipe Rojas · Diego Vera</dd>
        </div>
        <div>
          <dt>Cuarto árbitro</dt>
          <dd>Camilo Fuentes</dd>
        </div>
        <div>
          <dt>Datos del prototipo</dt>
          <dd>Jugadores, cuerpo técnico y recinto ficticios</dd>
        </div>
      </dl>
    </section>
  </div>
  <div
    v-show="activeTab === 'chronology'"
    id="detail-panel-chronology"
    role="tabpanel"
    aria-labelledby="detail-tab-chronology"
    tabindex="0"
  >
    <MatchReport view="chronology" :match="match" :events="reportEvents" />
  </div>
  <div
    v-show="activeTab === 'statistics'"
    id="detail-panel-statistics"
    role="tabpanel"
    aria-labelledby="detail-tab-statistics"
    tabindex="0"
  >
    <MatchReport view="statistics" :match="match" :events="reportEvents" />
  </div>
</template>

<style scoped>

button:hover {
  color: var(--accent);
}




.detail-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 17px;
}
.detail-section-heading h3 {
  font-size: 15px;
  font-weight: 500;
  color: var(--ui-text, #e3e3e3);
}
.detail-section-heading > span {
  font-size: 10px;
  color: var(--ui-muted, #999);
}
.field-legend {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: var(--ui-surface, #202020);
  border: 1px solid var(--ui-border, #333);
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
}
.field-legend > span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.field-legend i {
  width: 10px;
  height: 10px;
  border: 1px solid #ddd;
  border-radius: 50%;
}
.field-legend strong {
  color: var(--ui-muted, #a4a4a4);
  font-weight: 400;
  margin-left: 8px;
}
.pitch-scroll {
  overflow-x: auto;
  border: 1px solid var(--ui-border, #354d30);
  border-radius: 0 0 6px 6px;
}
.football-field {
  position: relative;
  aspect-ratio: 1000/580;
  min-width: 680px;
  background-image: repeating-linear-gradient(90deg, #477d0e 40px 80px);
  background-repeat: repeat;
  background-size: 160px 100%;
  opacity: 0.94;
}
.field-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.field-player {
  position: absolute;
  transform: translate(-50%, -40%);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  width: 95px;
}
.shirt {
  position: relative;
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  border-radius: 50%;
  border: 2px solid #eee;
  background: var(--shirt);
  color: #fff;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 24px;
  box-shadow: 0 2px 3px #0003;
}
.player-name {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px #000;
  white-space: nowrap;
}
.captain {
  position: absolute;
  left: -8px;
  top: -4px;
  background: #e8db92;
  border: 1px solid #fff;
  color: #252525;
  border-radius: 3px;
  font:
    700 9px "DM Sans",
    sans-serif;
  padding: 1px 3px;
}
.player-goals {
  position: absolute;
  right: -12px;
  bottom: -5px;
  font-size: 16px;
  line-height: 1;
}
.player-goals b {
  font:
    700 10px "DM Sans",
    sans-serif;
  background: #fff;
  color: #222;
  padding: 1px 2px;
  border-radius: 3px;
}
.field-hint {
  font-size: 10px;
  color: var(--ui-muted, #999);
  margin-top: 10px;
}
.field-hint span {
  display: none;
}
.squad-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.squad-panel {
  border: 1px solid var(--ui-border, #333);
  border-radius: 6px;
  background: var(--ui-surface, #1b1b1b);
  overflow: hidden;
}
.squad-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 18px 6px;
}
.squad-panel h4 {
  font-size: 13px;
  font-weight: 500;
}
.squad-panel header > span {
  font-size: 11px;
  color: var(--ui-muted, #b5b5b5);
}
.coach {
  padding: 0 18px 14px;
  font-size: 11px;
  color: var(--ui-muted, #aaa);
}
.squad-panel h5 {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: var(--ui-muted, #909090);
  font-weight: 500;
  padding: 12px 18px;
  margin: 0;
  background: var(--ui-surface, #ffffff03);
  border-top: 1px solid var(--ui-border, #303030);
  border-bottom: 1px solid var(--ui-border, #303030);
}
.squad-panel ul {
  margin: 0;
  padding: 0 18px;
  list-style: none;
}
.squad-panel li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 37px;
  border-bottom: 1px solid var(--ui-border, #ffffff06);
  font-size: 11px;
}
.squad-panel li:last-child {
  border: 0;
}
.lineup-number {
  color: var(--ui-muted, #999);
  font-variant-numeric: tabular-nums;
  width: 20px;
  text-align: center;
}
.player-role {
  margin-left: auto;
  color: var(--ui-muted, #858585);
  font-size: 10px;
}
.squad-panel li small {
  font-size: 8px;
  border: 1px solid var(--ui-border, #666);
  padding: 1px 3px;
  margin-left: 4px;
  color: var(--ui-success, #cfc79c);
}
.venue-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  background: var(--ui-surface, #1b1b1b);
  border: 1px solid var(--ui-border, #333);
  border-radius: 6px;
  margin: 0;
  padding: 22px;
}
.venue-grid dt {
  color: var(--ui-muted, #909090);
  font-size: 10px;
  margin-bottom: 7px;
}
.venue-grid dd {
  margin: 0;
  color: var(--ui-text, #ddd);
  font-size: 12px;
  line-height: 1.7;
}
.venue-section {
  padding-bottom: 10px;
}
@media (max-width: 700px) {
  .detail-section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
  .field-legend {
    padding: 12px 10px;
  }
  .field-legend > span {
    font-size: 9px;
    flex-wrap: wrap;
    gap: 5px;
  }
  .field-legend strong {
    margin-left: 0;
  }
  .squad-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .venue-grid {
    grid-template-columns: 1fr 1fr;
    padding: 17px;
    gap: 20px;
  }
  .field-hint span {
    display: block;
  }
  .shirt {
    width: 29px;
    height: 29px;
    font-size: 19px;
  }
  .player-name {
    font-size: 9px;
  }
  .field-player {
    width: 78px;
  }
  .player-goals {
    font-size: 13px;
  }
}

.field-player {
  gap: 3px;
}
.squad-panel li {
  padding: 8px 0;
  align-items: flex-start;
}
.lineup-player {
  flex: 1;
  min-width: 0;
}
.player-role {
  padding-top: 2px;
  white-space: nowrap;
}
.field-hint {
  line-height: 1.9;
}
.football-field {
  isolation: isolate;
}
.grass-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.field-lines {
  z-index: 1;
  pointer-events: none;
}
.field-player {
  z-index: 2;
}

.pitch-player-events {
  position: absolute;
  right: -10px;
  bottom: -3px;
  line-height: 1;
  display: flex;
  justify-content: flex-end;
  max-width: 55px;
}
.pitch-player-events :deep(.event-badges) {
  gap: 2px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.pitch-player-events :deep(.event-badge) {
  filter: drop-shadow(0 1px 1px #0009);
  min-height: 14px;
}
.pitch-player-events :deep(.card-icon) {
  width: 9px;
  height: 13px;
}
.pitch-player-events :deep(.event-ball) {
  width: 16px;
  height: 16px;
}
.player-name {
  margin-top: 2px;
}
.captain {
  background: #e0dcc1;
  color: #252525;
}

.football-field {
  background-color: #51863b;
  background-image: radial-gradient(
    ellipse at 45% 35%,
    #a5ce7026,
    transparent 75%
  );
}

.detail-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--ui-border, #555);
  margin-top: 25px;
  background: var(--ui-surface, #1c1c1c);
}
.detail-tabs button {
  padding: 17px 8px;
  color: var(--ui-muted, #a5a5a5);
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
}
.detail-tabs button[aria-selected="true"] {
  background: var(--ui-hover, #2b2e33);
  color: var(--ui-text, #fff);
  border-bottom-color: var(--ui-border, #e1e1e1);
}
.detail-tabs button:hover {
  color: var(--ui-text, white);
}
.detail-tabs button:focus-visible {
  outline: 2px solid var(--ui-border, #aaa);
  outline-offset: -4px;
}
[role="tabpanel"]:focus-visible {
  outline: 1px solid var(--ui-border, #777);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  button, a, input { transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  button:not(:disabled):active, .primary-action:active { transform: translateY(1px); }
  input:focus-visible { box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, .12)); }
}
</style>

