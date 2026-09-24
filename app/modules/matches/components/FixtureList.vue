<script setup lang="ts">
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";

import { time, matchState, type Match } from "~/modules/matches/utils/matches";
defineProps<{ matches: Match[] }>();
</script>
<template>
  <div class="fixture-list">
    <NuxtLink
      v-for="match in matches"
      :key="match.id"
      :to="`/matches/${match.id}`"
      class="fixture-row"
      ><span class="fixture-meta"
        >{{ matchState(match)
        }}<small>{{
          new Date(match.scheduled_at).toLocaleDateString("es-CL", {
            day: "numeric",
            month: "short",
          })
        }}</small></span
      ><span class="fixture-side"
        ><TeamBadge :name="match.home_team.name" :src="match.home_team.crest" />{{
          match.home_team.name
        }}</span
      ><strong class="fixture-result"
        >{{
          match.status === "scheduled"
            ? time(match.scheduled_at)
            : `${match.home_team.score} – ${match.away_team.score}`
        }}<small v-if="match.home_team.penalty_score != null"
          >Pen. {{ match.home_team.penalty_score }}–{{ match.away_team.penalty_score }}</small
        ></strong
      ><span class="fixture-side away"
        >{{ match.away_team.name
        }}<TeamBadge :name="match.away_team.name" :src="match.away_team.crest" /></span
      ><span aria-hidden="true">↗</span></NuxtLink
    >
    <p v-if="!matches.length" class="section-empty">
      No hay partidos disponibles para este equipo.
    </p>
  </div>
</template>

<style scoped>
html[data-theme="light"] .section-empty {
  color: var(--muted) !important;
}
.section-empty {
  padding: 32px;
  border: 1px solid var(--ui-border, #30382b);
  border-radius: 8px;
  background: var(--ui-surface, #191e18);
  color: var(--ui-muted, #96a38e);
  font-size: 12px;
}

.fixture-list {
  display: grid;
  gap: 10px;
}
.fixture-row {
  display: grid;
  grid-template-columns: 100px 1fr 110px 1fr 18px;
  align-items: center;
  gap: 16px;
  background: var(--ui-surface, #1d201f);
  border: 1px solid var(--ui-border, #343a34);
  border-radius: 8px;
  padding: 20px;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.fixture-row:hover {
  background: var(--ui-hover, #242b22);
  border-color: var(--ui-border, #86a263);
}
.fixture-meta {
  font-size: 10px;
  color: var(--ui-success, #b9d499);
}
.fixture-meta small,
.fixture-result small {
  display: block;
  font-size: 10px;
  color: var(--ui-muted, #90998e);
  margin-top: 6px;
}
.fixture-side {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}
.fixture-side.away {
  justify-content: flex-end;
  text-align: right;
}
.fixture-result {
  text-align: center;
  font-size: 20px;
}
.section-empty {
  padding: 30px;
  color: var(--ui-muted, #a1aaa0);
}
@media (max-width: 650px) {
  .fixture-row {
    grid-template-columns: 1fr 90px 1fr;
    gap: 10px;
    padding: 16px 12px;
  }
  .fixture-meta {
    grid-column: 1/-1;
  }
  .fixture-meta small {
    display: inline;
    margin-left: 10px;
  }
  .fixture-side {
    flex-direction: column;
    text-align: center;
    font-size: 10px;
  }
  .fixture-side.away {
    flex-direction: column-reverse;
    text-align: center;
  }
  .fixture-row > span:last-child {
    display: none;
  }
  .fixture-result {
    font-size: 17px;
  }
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
@media (prefers-reduced-motion: no-preference) {
  .fixture-row {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .fixture-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
</style>
