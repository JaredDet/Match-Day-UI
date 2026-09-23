import type { MatchRepository } from "~/modules/matches/domain/match-repository";
import type { NewsRepository } from "~/modules/news/domain/news-repository";
import type { RecommendationRepository } from "~/modules/recommendations/domain/recommendation-repository";
import type { TeamRepository } from "~/modules/teams/domain/team-repository";
import type { TournamentRepository } from "~/modules/tournaments/domain/tournament-repository";

export interface Repositories {
  matches: MatchRepository;
  news: NewsRepository;
  recommendations: RecommendationRepository;
  teams: TeamRepository;
  tournaments: TournamentRepository;
}

export function useRepositories() {
  return useNuxtApp().$repositories;
}

declare module "#app" {
  interface NuxtApp {
    $repositories: Repositories;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $repositories: Repositories;
  }
}
