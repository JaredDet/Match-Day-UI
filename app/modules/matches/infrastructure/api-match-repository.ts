import type { HttpClient } from "~/core/api/http-client";
import type { MatchRepository } from "~/modules/matches/domain/match-repository";
import type { Match } from "~/modules/matches/utils/matches";

function navigationHeaders() {
  return { "X-Navigation-Intent": "detail-view", "X-Navigation-Id": crypto.randomUUID() };
}

export class ApiMatchRepository implements MatchRepository {
  constructor(private readonly http: HttpClient) {}
  list(
    filters: {
      status?: Match["status"];
      team?: string;
      scheduledFrom?: string;
      scheduledTo?: string;
    } = {},
  ) {
    return this.http.request<Match[]>("matches/", {
      query: {
        status: filters.status,
        team: filters.team,
        scheduled_from: filters.scheduledFrom,
        scheduled_to: filters.scheduledTo,
      },
    });
  }
  async get(id: string, trackNavigation = false) {
    const detail = await this.http.request<any>(`matches/${id}/`, {
      headers: trackNavigation && import.meta.client ? navigationHeaders() : undefined,
    });
    const goals = (side: "home" | "away") =>
      (detail.events ?? [])
        .filter((event: any) => event.type === "goal" && event.team_side === side)
        .map((event: any) => ({
          player_name: event.player_name ?? "",
          assist_player_name: event.assist_player_name ?? undefined,
          goal_type: event.goal_type ?? "regular",
          minute: event.minute ?? 0,
          added_minute: event.added_minute || undefined,
        }));
    const team = (side: "home" | "away") => ({
      ...detail[`${side}_team`],
      score: detail[`${side}_team`].goals,
      goals: goals(side),
      positions: (detail[`${side}_team`].lineup ?? [])
        .filter((player: any) => player.role === "starter")
        .map((player: any) => ({
          number: player.shirt_number,
          x: player.position_x,
          y: player.position_y,
        })),
    });
    return {
      ...detail,
      home_team: team("home"),
      away_team: team("away"),
      shootout: detail.penalty_shootout
        ? {
            status: detail.penalty_shootout.status,
            nextSide:
              detail.penalty_shootout.next_team_side === "home"
                ? 0
                : detail.penalty_shootout.next_team_side === "away"
                  ? 1
                  : null,
            kicks: (detail.events ?? [])
              .filter((event: any) => event.type === "penalty_shootout_kick")
              .map((event: any) => ({
                side: event.team_side === "home" ? 0 : 1,
                player: event.player_name ?? "",
                outcome: event.outcome,
                sequence: event.sequence_number ?? 0,
              })),
            participants: (detail.penalty_shootout.participants ?? []).map((participant: any) => ({
              playerId: participant.player_id,
              name: participant.player_name,
              side: participant.team_side === "home" ? 0 : 1,
              eligible: participant.is_eligible,
            })),
          }
        : undefined,
    } as Match;
  }
  async create(
    homeTeamId: string,
    awayTeamId: string,
    scheduledAt: string,
    formations?: { home: string; away: string },
  ) {
    const result = await this.http.request<{ id: string }>("matches/", {
      method: "POST",
      body: {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: scheduledAt,
        home_formation: formations?.home,
        away_formation: formations?.away,
      },
    });
    return result.id;
  }
  command<T = void>(id: string, path: string, method: "POST" | "PATCH" | "PUT", body?: unknown) {
    return this.http.request<T>(`matches/${id}/${path.replace(/^\//, "")}`, { method, body });
  }
}
