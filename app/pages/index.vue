<script setup lang="ts">
import MatchListView from "~/modules/matches/views/MatchListView.vue";
import RecommendationRail from "~/modules/recommendations/components/RecommendationRail.vue";
import FeaturedMatchCarousel from "~/modules/matches/components/FeaturedMatchCarousel.vue";
</script>

<template>
  <FeaturedMatchCarousel />
  <MatchListView />
  <RecommendationRail
    title="Partidos y noticias para seguir la jornada"
    :kinds="['match', 'news']"
    :limit="4"
  />
</template>
