<script setup lang="ts">
import type { Recommendation } from "~/modules/recommendations/types/recommendations";
defineProps<{ item: Recommendation }>();
const labels = {
  news: "Noticia",
  match: "Partido",
  tournament: "Torneo",
  team: "Equipo",
  player: "Jugador",
};
const initials = (name?: string) =>
  name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3) ?? "";
</script>

<template>
  <article class="recommendation-card">
    <NuxtLink :to="item.path" class="visual" tabindex="-1" aria-hidden="true">
      <AppImage v-if="item.image" :src="item.image" :alt="`Imagen de ${item.title}`" />
      <div v-else-if="item.kind === 'match'" class="match-visual">
        <span>{{ initials(item.homeTeam) }}</span>
        <strong>{{ item.homeScore }}<i>–</i>{{ item.awayScore }}</strong>
        <span>{{ initials(item.awayTeam) }}</span>
      </div>
      <span v-else class="fallback-mark">M</span>
      <b>{{ labels[item.kind] }}</b>
    </NuxtLink>
    <div class="card-copy">
      <span v-if="item.preferredTeam" class="affinity">DE TUS EQUIPOS</span>
      <span class="kind">{{ labels[item.kind] }}</span>
      <h3>
        <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
      </h3>
      <p>{{ item.description }}</p>
      <p class="reason">{{ item.reason }}</p>
      <ActionLink :to="item.path">{{
        item.kind === "match" ? "Ver partido" : item.kind === "news" ? "Leer noticia" : "Explorar"
      }}</ActionLink>
    </div>
  </article>
</template>

<style scoped>
.recommendation-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  color: var(--text-color);
}
.visual {
  position: relative;
  display: block;
  min-height: 170px;
  overflow: hidden;
  background: radial-gradient(circle at 25% 15%, #46642e, #172017 58%, #0c100e);
}
.visual:after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, #080b0caa, transparent 60%);
}
.visual :deep(.app-image) {
  position: absolute;
  width: 100%;
  height: 100%;
}
.visual :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.visual > b {
  position: absolute;
  z-index: 2;
  left: 18px;
  bottom: 15px;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #d7ff84;
}
.match-visual {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  place-items: center;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, #1a2a1b, #11161c 58%, #202c18);
}
.match-visual:after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, transparent 0 48px, #ffffff07 49px 50px);
}
.match-visual span {
  z-index: 1;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 2px solid #ffffffc0;
  border-radius: 50%;
  background: #6a8c50;
  color: #fff;
  font-weight: 800;
}
.match-visual strong {
  z-index: 1;
  font-size: 34px;
}
.match-visual i {
  padding: 0 7px;
  color: #aab2a7;
  font-style: normal;
}
.fallback-mark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 76px;
  font-weight: 800;
  color: #ffffff18;
}
.card-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
}
.affinity {
  width: max-content;
  padding: 5px 8px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: var(--ui-success-soft);
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
}
.kind {
  font-size: 12px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 1px;
}
h3 {
  font-size: 22px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
p {
  line-height: 1.6;
  color: var(--muted);
}
.reason {
  font-size: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
:global(html[data-theme="light"]) .visual {
  background: radial-gradient(circle at 25% 15%, #e9f2df, #dbe8d5 62%, #cdddc9);
}
:global(html[data-theme="light"]) .visual:after {
  background: linear-gradient(0deg, #e5efe0aa, transparent 62%);
}
:global(html[data-theme="light"]) .visual > b {
  color: #315b24;
}
:global(html[data-theme="light"]) .match-visual {
  background: linear-gradient(135deg, #edf5e8, #dfeadc 58%, #d2e1cd);
}
:global(html[data-theme="light"]) .match-visual:after {
  background: repeating-linear-gradient(90deg, transparent 0 48px, #29442c0a 49px 50px);
}
:global(html[data-theme="light"]) .match-visual strong {
  color: #18301e;
}
:global(html[data-theme="light"]) .match-visual i {
  color: #667667;
}
:global(html[data-theme="light"]) .fallback-mark {
  color: #315b2414;
}
@media (prefers-reduced-motion: no-preference) {
  .recommendation-card {
    transition:
      transform 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .recommendation-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: 0 14px 34px var(--shadow);
  }
  .recommendation-card:hover .visual :deep(img) {
    transform: scale(1.045);
  }
}
</style>
