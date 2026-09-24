<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";

import { useTournaments } from "~/modules/tournaments/composables/useTournaments";
const { tournaments } = useTournaments();
useHead({ title: "Torneos · Matchday" });
</script>
<template>
  <main class="competition-page">
    <PageHeading
      title="Torneos"
      kicker="COMPETICIONES"
      description="Explora las temporadas, los equipos y el camino a la final."
      ><ActionLink to="/tournaments/manage">Gestionar torneos</ActionLink></PageHeading
    >
    <div class="demo-grid">
      <article
        v-for="(tournament, index) in tournaments"
        :key="tournament.id"
        class="info-panel editorial-card"
      >
        <div class="tournament-meta">
          <span>0{{ index + 1 }}</span>
          <strong>{{ tournament.category }}</strong>
        </div>
        <span class="section-kicker">{{ tournament.country }} · {{ tournament.category }}</span>
        <h2>
          <NuxtLink :to="`/tournaments/${tournament.slug}`">{{ tournament.name }}</NuxtLink>
        </h2>
        <p>Grupos de hasta {{ tournament.max_teams_per_group }} equipos · Eliminación directa</p>
        <ActionLink :to="`/tournaments/${tournament.slug}`">Ver temporadas</ActionLink>
      </article>
    </div>
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page,
html[data-theme="light"] .info-panel {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .section-kicker {
  color: var(--text-color) !important;
}
main,
.info-panel,
.section-kicker {
  color: var(--text-color);
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
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
  h2 {
    font-size: 19px;
  }
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.section-kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ui-success, #b9d499);
  text-transform: uppercase;
}
.info-panel h2 {
  font-size: 19px;
  font-weight: 500;
}
.info-panel {
  padding: 28px;
  border: 1px solid var(--ui-border, #303030);
  border-radius: 10px;
  background: var(--ui-surface, #1c1c1c);
}
.text-action {
  font-size: 12px;
  color: var(--accent);
}
.info-panel {
  transition:
    border-color 0.24s,
    background-color 0.24s;
}
@media (max-width: 700px) {
  .info-panel {
    padding: 22px;
  }
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 20px;
}
.editorial-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}
.editorial-card h2 {
  font-size: 24px;
  line-height: 1.2;
}
.editorial-card p {
  line-height: 1.8;
  color: var(--muted);
}
.editorial-card .text-action {
  margin-top: auto;
}
@media (max-width: 700px) {
  .editorial-card {
    padding: 20px;
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
  .editorial-card {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .editorial-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
.tournament-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.tournament-meta > span {
  font: 700 28px "Barlow Condensed";
  color: var(--accent);
}
.tournament-meta strong {
  font-size: 10px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.editorial-card {
  overflow: hidden;
}
.editorial-card :deep(.action-link) {
  margin-top: auto;
}
</style>
