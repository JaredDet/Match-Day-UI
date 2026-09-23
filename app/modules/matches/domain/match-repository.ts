import type { Match } from "~/modules/matches/utils/matches";

export interface MatchRepository {
  list(filters?: {
    status?: Match["status"];
    team?: string;
    scheduledFrom?: string;
    scheduledTo?: string;
  }): Promise<Match[]>;
  get(id: string, trackNavigation?: boolean): Promise<Match>;
  create(homeTeamId: string, awayTeamId: string, scheduledAt: string): Promise<string>;
  command<T = void>(
    id: string,
    path: string,
    method: "POST" | "PATCH" | "PUT",
    body?: unknown,
  ): Promise<T>;
}
