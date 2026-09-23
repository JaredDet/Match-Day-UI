<script setup lang="ts">
import { useTeamRegistrationDraft } from "~/modules/teams/composables/useTeamRegistrationDraft";

import PageHeading from "~/components/PageHeading.vue";
import EmptyState from "~/components/EmptyState.vue";

const draft = useTeamRegistrationDraft();
useHead({ title: "Equipo registrado · Matchday" });
</script>
<template>
  <main class="competition-page">
    <PageHeading title="Equipo registrado" back-to="/teams" back-label="Todos los equipos" />
    <div v-if="draft" class="info-panel editorial-card">
      <span class="section-kicker">REGISTRO COMPLETADO</span>
      <h2>{{ draft.name }}</h2>
      <p>
        {{ draft.head_coach_name || "Sin director técnico asignado" }} ·
        {{ draft.players.length }} jugadores
      </p>
      <p>
        El equipo ya aparece en el catálogo y está disponible para inscribirlo en una temporada.
      </p>
      <NuxtLink class="text-action" to="/tournaments/register">Inscribir en un torneo</NuxtLink
      ><NuxtLink class="text-action" to="/teams">Volver a los equipos ·</NuxtLink>
    </div>
    <EmptyState v-else title="No hay un registro para mostrar"
      ><NuxtLink class="primary-action" to="/teams/register">Crear equipo</NuxtLink></EmptyState
    >
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

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  border: 1px solid var(--ui-border, rgba(189, 237, 117, 0.2));
  color: var(--accent);
  font-weight: 600;
}
html[data-theme="light"] .primary-action:hover:not(:disabled) {
  background: #d5e7c7;
  color: #244b16;
}
html[data-theme="light"] .primary-action:disabled {
  background: #e9eee6;
  color: #596452;
  border-color: #c5cec0;
  cursor: not-allowed;
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
</style>
