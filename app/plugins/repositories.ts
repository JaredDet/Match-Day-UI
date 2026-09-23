import { createHttpClient } from "~/core/api/http-client";
import { ApiMatchRepository } from "~/modules/matches/infrastructure/api-match-repository";
import { ApiNewsRepository } from "~/modules/news/infrastructure/api-news-repository";
import { ApiRecommendationRepository } from "~/modules/recommendations/infrastructure/api-recommendation-repository";
import { ApiTeamRepository } from "~/modules/teams/infrastructure/api-team-repository";
import { ApiTournamentRepository } from "~/modules/tournaments/infrastructure/api-tournament-repository";

export default defineNuxtPlugin(() => {
  const apiBase = useRuntimeConfig().public.apiBase;
  const http = createHttpClient(apiBase);
  return {
    provide: {
      repositories: {
        matches: new ApiMatchRepository(http),
        news: new ApiNewsRepository(http),
        recommendations: new ApiRecommendationRepository(http, apiBase),
        teams: new ApiTeamRepository(http),
        tournaments: new ApiTournamentRepository(http),
      },
    },
  };
});
