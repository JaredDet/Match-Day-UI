<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import RecommendationCard from "~/modules/recommendations/components/RecommendationCard.vue";
import { useRecommendations } from "~/modules/recommendations/composables/useRecommendations";

const { sections, personalized, clearHistory } = useRecommendations();
const cleared = ref(false);
const groups = computed(() => [
  { title: "Descubre algo nuevo", items: sections.value.discovery },
  { title: "Noticias para ti", items: sections.value.news },
  { title: "Partidos que podrían interesarte", items: sections.value.matches },
  { title: "Torneos para explorar", items: sections.value.tournaments },
]);
useHead({ title: "Para ti · Matchday" });
</script>

<template>
  <main class="recommendations-page">
    <PageHeading
      title="Para ti"
      kicker="TU ACTUALIDAD DEPORTIVA"
      description="Recomendaciones según tu navegación y una selección para descubrir algo nuevo."
    />
    <div class="history-note">
      <p>
        {{
          personalized
            ? "Estas sugerencias tienen en cuenta tus visitas recientes y el tiempo de navegación activa."
            : "Empieza a explorar equipos, jugadores, noticias y torneos. Las sugerencias se ajustarán automáticamente."
        }}
      </p>
      <p>
        La actividad se asocia a una cookie anónima durante un máximo de 30 días. No necesitas una
        cuenta.
      </p>
      <button
        @click="
          clearHistory().then(() => {
            cleared = true;
          })
        "
      >
        Borrar historial de recomendaciones
      </button>
      <p v-if="cleared" role="status">
        Historial borrado. Las nuevas visitas volverán a ajustar las sugerencias.
      </p>
    </div>
    <section v-for="group in groups" :key="group.title" class="recommendation-section">
      <h2>{{ group.title }}</h2>
      <div class="cards">
        <RecommendationCard v-for="item in group.items" :key="item.key" :item="item" />
      </div>
      <p v-if="!group.items.length" class="empty">
        Todavía no hay contenido disponible en esta sección.
      </p>
    </section>
  </main>
</template>

<style scoped>
.recommendations-page {
  max-width: 1280px;
  margin: auto;
  padding: 30px 24px 60px;
  color: var(--text-color);
}
.history-note {
  display: grid;
  gap: 12px;
  padding: 20px;
  margin: 24px 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel-bg);
  color: var(--muted);
  line-height: 1.6;
}
button {
  width: fit-content;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.recommendation-section {
  margin-top: 32px;
}
h2 {
  font-size: 25px;
  margin-bottom: 20px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 20px;
}
.empty {
  color: var(--muted);
}
@media (max-width: 600px) {
  .recommendations-page {
    padding: 24px 18px 40px;
  }
}
</style>
