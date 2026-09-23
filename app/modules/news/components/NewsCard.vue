<script setup lang="ts">
import { newsDate } from "~/modules/news/data/news";
import { useDemoTeams } from "~/modules/teams/composables/useDemoTeams";
import type { NewsPreview } from "~/modules/news/composables/useDemoNews";

const { teamById } = useDemoTeams();
defineProps<{ item: NewsPreview }>();
</script>

<template>
  <article class="news-card">
    <NuxtLink :to="`/news/${item.id}`" class="media">
      <AppImage :src="item.cover_image" :alt="`Portada: ${item.title}`" />
    </NuxtLink>
    <div class="content">
      <span class="kicker">{{
        item.team_id ? teamById(item.team_id)?.name : "Noticias generales"
      }}</span>
      <h2>
        <NuxtLink :to="`/news/${item.id}`">{{ item.title }}</NuxtLink>
      </h2>
      <p>{{ item.preview }}</p>
      <time v-if="item.published_at" :datetime="item.published_at">{{
        newsDate(item.published_at)
      }}</time>
      <ActionLink :to="`/news/${item.id}`">Leer noticia</ActionLink>
    </div>
  </article>
</template>

<style scoped>
.news-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--panel-bg);
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}
.news-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
  box-shadow: 0 16px 34px var(--shadow);
}
.media {
  display: block;
  width: 100%;
  min-width: 0;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--panel-strong);
}
.media :deep(.app-image),
.media :deep(img) {
  width: 100%;
  height: 100%;
}
.media :deep(img) {
  transition: transform 0.35s ease;
}
.news-card:hover :deep(img) {
  transform: scale(1.025);
}
.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
}
.kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--accent);
  text-transform: uppercase;
}
h2 {
  font-size: 23px;
  line-height: 1.2;
}
p {
  line-height: 1.65;
  color: var(--muted);
}
time {
  font-size: 12px;
  color: var(--muted);
}
.content :deep(.action-link) {
  margin-top: auto;
}
</style>
