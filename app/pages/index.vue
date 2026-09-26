<script setup lang="ts">
import MatchListView from "~/modules/matches/views/MatchListView.vue";
import RecommendationRail from "~/modules/recommendations/components/RecommendationRail.vue";
import FeaturedMatchCarousel from "~/modules/matches/components/FeaturedMatchCarousel.vue";
import { useMatches } from "~/modules/matches/composables/useMatches";
const route = useRoute();
const showingFavorites = computed(() => route.query.view === "favorites");
const favorites = useState<string[]>("matchday-favorites", () => []);
const { matches } = useMatches();
const favoriteTeamIds = computed(() => {
  const saved = new Set(favorites.value);
  return [
    ...new Set(
      matches.value
        .filter((match) => saved.has(match.id))
        .flatMap((match) => [match.home_team.id, match.away_team.id]),
    ),
  ];
});
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
  <RecommendationRail
    v-else
    title="De tus favoritos y equipos más vistos"
    :kinds="['news', 'match']"
    :team-ids="favoriteTeamIds"
    :limit="3"
    affinity-only
    compact
  />
</template>
