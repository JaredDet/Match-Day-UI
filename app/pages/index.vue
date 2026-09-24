<script setup lang="ts">
import MatchListView from "~/modules/matches/views/MatchListView.vue";
import RecommendationRail from "~/modules/recommendations/components/RecommendationRail.vue";
import FeaturedMatchCarousel from "~/modules/matches/components/FeaturedMatchCarousel.vue";
const route = useRoute();
const showingFavorites = computed(() => route.query.view === "favorites");
</script>

<template>
  <FeaturedMatchCarousel v-if="!showingFavorites" />
  <MatchListView />
  <RecommendationRail
    v-if="!showingFavorites"
    title="Partidos y noticias para seguir la jornada"
    :kinds="['match', 'news']"
    :limit="4"
  />
</template>
