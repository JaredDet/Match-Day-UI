<script setup lang="ts">
import { useRepositories } from "~/core/api/repository-context";

import { positionNames } from "~/modules/teams/data/position-names";
import { resultNames } from "~/modules/teams/data/teamProfiles";
const route = useRoute(),
  repository = useRepositories().teams;
const { data: player } = await useAsyncData(`player-detail-${route.params.id}`, () =>
  repository.getPlayer(String(route.params.id), true),
);
if (!player.value) throw createError({ statusCode: 404, statusMessage: "Jugador no encontrado" });
const metrics = computed(() =>
  player.value
    ? [
        ["Participaciones", player.value.statistics.appearances],
        ["Goles", player.value.statistics.goals],
        ["Amarillas", player.value.statistics.yellow_cards],
        ["Rojas", player.value.statistics.red_cards],
      ]
    : [],
);
useHead(() => ({ title: `${player.value?.name ?? "Jugador"} · Matchday` }));
</script>
<template>
  <main v-if="player" class="competition-page">
    <NuxtLink :to="`/teams/${player.team.id}`" class="section-back"
      >← {{ player.team.name }}</NuxtLink
    >
    <div class="entity-heading">
      <span class="player-number">{{ player.preferred_shirt_number ?? "–" }}</span>
      <div>
        <span class="section-kicker">{{
          player.preferred_position
            ? positionNames[player.preferred_position]
            : "Posición sin definir"
        }}</span>
        <h1>{{ player.name }}<span>.</span></h1>
        <NuxtLink :to="`/teams/${player.team.id}`">{{ player.team.name }}</NuxtLink
        ><span v-if="player.is_captain" class="captain-tag">Capitán</span>
      </div>
    </div>
    <p class="demo-caption">Dorsal y posición preferidos</p>
    <dl class="profile-stats">
      <div v-for="metric in metrics" :key="String(metric[0])">
        <dt>{{ metric[0] }}</dt>
        <dd>{{ metric[1] }}</dd>
      </div>
    </dl>
    <h2 class="profile-section-title">Participaciones recientes</h2>
    <div class="profile-results">
      <article v-for="match in player.recent_matches" :key="match.match_id" class="player-match">
        <NuxtLink :to="`/matches/${match.match_id}`" class="text-action"
          >{{
            new Date(match.scheduled_at).toLocaleDateString("es-CL", {
              timeZone: "America/Santiago",
              day: "numeric",
              month: "long",
            })
          }}
          · Ver partido ↗</NuxtLink
        >
        <div>
          <NuxtLink :to="`/teams/${match.opponent.id}`">vs. {{ match.opponent.name }}</NuxtLink
          ><span :class="['result-pill', match.result]">{{ resultNames[match.result] }}</span>
        </div>
        <p>
          {{ match.goals }} goles · {{ match.yellow_cards }} amarillas · {{ match.red_cards }} rojas
        </p>
      </article>
      <p v-if="!player.recent_matches.length" class="section-empty">
        Todavía no hay participaciones recientes.
      </p>
    </div>
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page,
html[data-theme="light"] .entity-heading,
html[data-theme="light"] .player-match,
html[data-theme="light"] .profile-stats > div {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .section-back,
html[data-theme="light"] .entity-heading h1,
html[data-theme="light"] .entity-heading p,
html[data-theme="light"] .profile-section-title,
html[data-theme="light"] .section-kicker {
  color: var(--text-color) !important;
}
html[data-theme="light"] .section-empty,
html[data-theme="light"] .demo-caption {
  color: var(--muted) !important;
}
main,
.section-back,
.entity-heading,
.entity-heading h1,
.entity-heading p,
.profile-section-title,
.section-kicker,
.player-match {
  color: var(--text-color);
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
}
h1 {
  font-size: 42px;
  font-weight: 600;
  letter-spacing: -1.8px;
  margin: 10px 0;
}
h1 > span {
  color: var(--accent);
}
h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (min-width: 1450px) {
  main {
    max-width: 1360px;
  }
}
@media (max-width: 1050px) {
  main {
    padding: 0 30px;
  }
}
@media (max-width: 700px) {
  main {
    padding: 0 18px;
  }
  h1 {
    font-size: 34px;
    margin: 8px 0;
  }
  h2 {
    font-size: 19px;
  }
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.section-back {
  display: inline-block;
  font-size: 12px;
  color: var(--ui-muted, #a0aa9d);
  margin-bottom: 32px;
}
.section-back:hover {
  color: var(--accent);
}
.entity-heading {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 28px;
  padding: 18px 20px 18px 18px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--ui-border, rgba(255, 255, 255, 0.06));
  background: var(--ui-surface, rgba(15, 18, 22, 0.96));
}
.entity-heading h1 {
  font-size: clamp(28px, 4vw, 44px);
  margin: 8px 0;
}
.entity-heading h1 > span {
  color: var(--accent);
}
.entity-heading p {
  color: var(--ui-muted, #929b93);
  font-size: 12px;
}
.section-kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ui-success, #b9d499);
  text-transform: uppercase;
}
.demo-caption {
  font-size: 10px;
  color: var(--ui-muted, #899187);
  margin-bottom: 28px;
}
.text-action {
  font-size: 12px;
  color: var(--accent);
}
.section-empty {
  padding: 32px;
  border: 1px solid var(--ui-border, #30382b);
  border-radius: 8px;
  background: var(--ui-surface, #191e18);
  color: var(--ui-muted, #96a38e);
  font-size: 12px;
}
.section-empty h2 {
  font-size: 18px;
  color: var(--ui-text, #e2e9dc);
  margin-bottom: 12px;
}
@media (max-width: 700px) {
  .entity-heading {
    gap: 16px;
    flex-wrap: wrap;
  }
  .section-back {
    margin-bottom: 24px;
  }
}
@media (max-width: 700px) {
  .entity-heading {
    row-gap: 24px;
  }
}
.profile-stats {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0 32px;
}
.profile-stats > div {
  border: 1px solid var(--ui-border, #35402f);
  border-radius: 8px;
  padding: 22px;
  background: var(--ui-surface, #1c2219);
}
.profile-stats dt {
  font-size: 11px;
  color: var(--ui-muted, #a1ae97);
}
.profile-stats dd {
  font-size: 30px;
  color: var(--ui-success, #c4e6a4);
  margin: 12px 0 0;
}
.result-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 5px;
  background: var(--ui-surface, #30362b);
  color: var(--ui-text, #c9d2c1);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.profile-section-title {
  font-size: 20px;
  margin: 30px 0 18px;
}
.profile-results {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}
.captain-tag {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  color: var(--ui-text, #dfe4de);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  border: 1px solid var(--ui-border, #4a504b);
  border-radius: 999px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.08));
  color: var(--ui-success, #c8dca8);
  margin-left: 10px;
}
.player-number {
  width: 80px;
  height: 90px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ui-border, #a9c588);
  border-radius: 10px;
  background: var(--ui-surface, #2b3822);
  font-size: 34px;
  color: var(--ui-success, #d0e7bb);
}
.player-match {
  padding: 24px;
  border: 1px solid var(--ui-border, #36432d);
  background: var(--ui-surface, #1c2219);
  border-radius: 8px;
}
.player-match > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 20px 0;
  font-size: 15px;
}
.player-match p {
  font-size: 12px;
  color: var(--ui-muted, #a7b39d);
}
@media (max-width: 1000px) {
  .profile-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .profile-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .profile-stats > div {
    padding: 18px;
  }
}

.result-pill.win {
  background: var(--ui-surface, #2f4425);
  color: var(--ui-success, #bde897);
}
.result-pill.loss {
  background: var(--ui-surface, #442c29);
  color: var(--ui-danger, #edb5ad);
}
html[data-theme="light"] .result-pill.win {
  background: #dff1c4;
  color: #224c1b;
}
html[data-theme="light"] .result-pill.loss {
  background: #f8d8d0;
  color: #7b3127;
}
html[data-theme="light"] .result-pill.draw {
  background: #ebebeb;
  color: #3b3b3b;
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
  .player-match {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .player-match:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
</style>
