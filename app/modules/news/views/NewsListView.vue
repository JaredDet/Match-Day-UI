<script setup lang="ts">
import AppSelect from "~/components/AppSelect.vue";
import NewsCard from "~/modules/news/components/NewsCard.vue";
import PageHeading from "~/components/PageHeading.vue";
import EmptyState from "~/components/EmptyState.vue";

import { useNews } from "~/modules/news/composables/useNews";
const { items: publishedNews } = useNews("PUBLISHED");
import { useTeams } from "~/modules/teams/composables/useTeams";
const { teams } = useTeams();
const query = ref("");
const team = ref("all");
const visible = computed(() =>
  publishedNews.value.filter(
    (item) =>
      (team.value === "all" ||
        (team.value === "general" ? item.team_id === null : item.team_id === team.value)) &&
      `${item.title} ${item.preview}`
        .toLocaleLowerCase("es")
        .includes(query.value.trim().toLocaleLowerCase("es")),
  ),
);
const newsTeams = computed(() =>
  teams.value.filter((team) => publishedNews.value.some((item) => item.team_id === team.id)),
);
useHead({ title: "Noticias · Matchday" });
</script>
<template>
  <main class="competition-page">
    <PageHeading
      title="Noticias"
      kicker="ACTUALIDAD"
      description="Las novedades de los clubes y de la competición."
      ><NuxtLink class="primary-action" to="/news/manage"
        >Administrar noticias</NuxtLink
      ></PageHeading
    >
    <div class="demo-toolbar">
      <label
        >Buscar noticia<input
          v-model="query"
          type="search"
          placeholder="Título o contenido" /></label
      ><label
        >Equipo<AppSelect v-model="team"
          ><option value="all">Todas las publicaciones</option>
          <option value="general">Noticias generales</option>
          <option v-for="club in newsTeams" :key="club.id" :value="club.id">
            {{ club.name }}
          </option></AppSelect
        ></label
      ><span aria-live="polite">{{ visible.length }} publicaciones</span>
    </div>
    <TransitionGroup v-if="visible.length" name="news-list" tag="div" class="demo-grid"
      ><NewsCard v-for="item in visible" :key="item.id" :item="item" /></TransitionGroup
    ><EmptyState
      v-else
      title="Sin noticias para esta búsqueda"
      description="Prueba otro equipo o cambia el texto."
      ><button
        class="primary-action"
        @click="
          query = '';
          team = 'all';
        "
      >
        Limpiar filtros
      </button></EmptyState
    >
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
main {
  color: var(--text-color);
}
button:hover {
  color: var(--accent);
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
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
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.demo-toolbar {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 16px;
  margin: 24px 0;
}
.demo-toolbar label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}
.demo-toolbar input,
.demo-toolbar select {
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: inherit;
  font: inherit;
  max-width: 100%;
}
.demo-toolbar > span {
  padding: 12px 0;
  color: var(--muted);
  font-size: 13px;
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 20px;
}
@media (max-width: 700px) {
  .demo-toolbar label {
    width: 100%;
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
  .news-list-enter-active,
  .news-list-leave-active,
  .news-list-move {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .news-list-enter-from,
  .news-list-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
}
</style>
