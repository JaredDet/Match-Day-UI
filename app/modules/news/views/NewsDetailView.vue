<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";

import { newsDate } from "~/modules/news/data/news";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { useRepositories } from "~/core/api/repository-context";
import { newsPreview } from "~/modules/news/utils/preview";
import NewsParagraph from "~/modules/news/components/NewsParagraph.vue";
const { teamById } = useTeams();
const route = useRoute();
const repository = useRepositories().news;
const { data: item } = await useAsyncData(`news-detail-${route.params.id}`, () =>
  repository.get(String(route.params.id)),
);
if (!item.value)
  throw createError({
    statusCode: 404,
    statusMessage: "Noticia no encontrada",
  });
useSeoMeta(() => ({
  title: `${item.value?.title} · Matchday`,
  description: item.value ? newsPreview(item.value.content.children) : undefined,
  ogTitle: item.value?.title,
  ogDescription: item.value ? newsPreview(item.value.content.children) : undefined,
  ogImage: item.value?.cover_image ?? undefined,
  ogType: "article",
  twitterTitle: item.value?.title,
  twitterDescription: item.value ? newsPreview(item.value.content.children) : undefined,
  twitterImage: item.value?.cover_image ?? undefined,
}));
</script>
<template>
  <main v-if="item" class="competition-page">
    <AppBreadcrumbs
      :items="[
        { label: 'Inicio', to: '/' },
        { label: 'Noticias', to: '/news' },
        { label: item.title },
      ]"
    /><PageHeading
      :title="item.title"
      kicker="NOTICIAS"
      back-to="/news"
      back-label="Todas las noticias"
      ><ShareButton :title="item.title" :text="newsPreview(item.content.children)"
    /></PageHeading>
    <article class="story-content">
      <div class="story-meta">
        <time v-if="item.published_at" :datetime="item.published_at">{{
          newsDate(item.published_at)
        }}</time
        ><NuxtLink v-if="item.team_id" :to="`/teams/${item.team_id}`">{{
          teamById(item.team_id)?.name
        }}</NuxtLink
        ><span>{{ item.content.children.length }} min de lectura</span>
      </div>
      <figure>
        <AppImage :src="item.cover_image" :alt="`Portada de ${item.title}`" eager />
        <figcaption>Actualidad de la Copa Matchday</figcaption>
      </figure>
      <div class="story-body">
        <NewsParagraph
          v-for="(paragraph, index) in item.content.children"
          :key="index"
          :text="paragraph"
        />
      </div>
    </article>
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
main,
.info-panel {
  color: var(--text-color);
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
.info-panel {
  padding: 28px;
  border: 1px solid var(--ui-border, #303030);
  border-radius: 10px;
  background: var(--ui-surface, #1c1c1c);
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
.story-content {
  max-width: 940px;
  margin: auto;
  display: grid;
  gap: 28px;
}
.story-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 12px;
}
.story-meta > * + *:before {
  content: "·";
  margin-right: 12px;
  color: var(--muted);
}
.story-meta a {
  color: var(--accent);
}
figure {
  margin: 0;
}
figure img {
  display: block;
  width: 100%;
  max-height: 520px;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 16px;
}
figcaption {
  padding-top: 9px;
  color: var(--muted);
  font-size: 11px;
}
.story-body {
  max-width: 760px;
  margin: auto;
  padding: 8px 0 30px;
  font-size: 18px;
  line-height: 1.9;
}
.story-body :deep(p) {
  margin: 0 0 24px;
  color: var(--text-color);
}
.story-body :deep(p:first-child) {
  font-size: 21px;
  line-height: 1.75;
}
.story-body :deep(strong) {
  color: var(--text-color);
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
figure :deep(.app-image) {
  width: 100%;
  max-height: 520px;
  aspect-ratio: 16/9;
  border-radius: 16px;
}
</style>
