<script setup lang="ts">
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";

import { teamById } from "~/modules/teams/data/teams";
import { type CupTie } from "~/modules/tournaments/data/competition";
defineProps<{ tie: CupTie }>();
</script>
<template>
  <article class="cup-tie">
    <small>{{ tie.homeScore === null ? "Fecha por confirmar" : "Finalizado" }}</small>
    <div class="cup-team-group">
      <div
        class="cup-team"
        :class="{
          winner: tie.homeScore !== null && tie.homeScore! > tie.awayScore!,
        }"
      >
        <NuxtLink :to="`/teams/${tie.home}`"
          ><TeamBadge :name="teamById(tie.home).name" /><span>{{
            teamById(tie.home).name
          }}</span></NuxtLink
        ><strong>{{ tie.homeScore ?? "–" }}</strong>
      </div>
      <span class="cup-divider" aria-hidden="true" />
      <div
        class="cup-team"
        :class="{
          winner: tie.homeScore !== null && tie.awayScore! > tie.homeScore!,
        }"
      >
        <NuxtLink :to="`/teams/${tie.away}`"
          ><TeamBadge :name="teamById(tie.away).name" /><span>{{
            teamById(tie.away).name
          }}</span></NuxtLink
        ><strong>{{ tie.awayScore ?? "–" }}</strong>
      </div>
    </div>
  </article>
</template>

<style scoped>
.tie {
  position: relative;
  border: 1px solid var(--ui-border, #3c4735);
  border-radius: 8px;
  background: var(--ui-surface, #1e231d);
  padding: 14px 18px;
}

.cup-tie {
  padding: 16px 20px;
  border: 1px solid var(--bracket-border);
  border-radius: 8px;
  background: var(--bracket-panel);
}
.cup-tie > small {
  display: block;
  color: var(--bracket-muted);
  font-size: 10px;
  margin-bottom: 8px;
}
.cup-team-group {
  display: flex;
  flex-direction: column;
}
.cup-team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 44px;
  font-size: 12px;
}
.cup-team + .cup-team {
  margin-top: 8px;
}
.cup-divider {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--ui-border, rgba(255, 255, 255, 0.08));
  margin: 4px 0;
}
.cup-team a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.cup-team a:hover {
  text-decoration: underline;
}
.cup-team a span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cup-team strong {
  font-size: 18px;
}
.winner {
  color: var(--accent);
}
.cup-tie {
  transition:
    background-color 0.24s,
    border-color 0.24s,
    box-shadow 0.24s;
}
.cup-tie:hover,
.cup-tie:focus-within {
  background: var(--bracket-panel-strong);
  border-color: var(--bracket-border);
  box-shadow: 0 4px 14px var(--ui-shadow, rgba(0, 0, 0, 0.14));
}
.cup-team a {
  transition: color 0.2s;
}
.cup-team a:hover {
  color: var(--bracket-text);
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
  .cup-tie {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .cup-tie:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
</style>
