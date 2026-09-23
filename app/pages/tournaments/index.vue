<script setup lang="ts">
import TournamentListView from "~/modules/tournaments/views/TournamentListView.vue"
import RecommendationRail from '~/modules/recommendations/components/RecommendationRail.vue'
</script>

<template>
  <TournamentListView /><RecommendationRail title="Torneos y partidos para explorar" :kinds="['tournament', 'match']" />
</template>
