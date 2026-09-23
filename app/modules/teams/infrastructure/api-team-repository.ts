import type { HttpClient } from "~/core/api/http-client";
import type { TeamRepository } from "~/modules/teams/domain/team-repository";
import type {
  PlayerDetail,
  PlayerSummary,
  TeamDetail,
  TeamPlayer,
  TeamSummary,
} from "~/modules/teams/types/teams";
import type { TeamRegistrationDraft } from "~/modules/teams/types/registration";

const navigationHeaders = () => ({
  "X-Navigation-Intent": "detail-view",
  "X-Navigation-Id": crypto.randomUUID(),
});

function dataUrlFile(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const bytes = Uint8Array.from(atob(match[2]!), (character) => character.charCodeAt(0));
  return new File([bytes], "crest", { type: match[1] });
}

export class ApiTeamRepository implements TeamRepository {
  constructor(private readonly http: HttpClient) {}

  list(search?: string) {
    return this.http.request<TeamSummary[]>("teams/", { query: { search } });
  }

  get(id: string, trackNavigation = false) {
    return this.http.request<TeamDetail>(`teams/${id}/`, {
      headers: trackNavigation && import.meta.client ? navigationHeaders() : undefined,
    });
  }

  listPlayers(filters: { team?: string; search?: string } = {}) {
    return this.http.request<PlayerSummary[]>("players/", { query: filters });
  }

  getPlayer(id: string, trackNavigation = false) {
    return this.http.request<PlayerDetail>(`players/${id}/`, {
      headers: trackNavigation && import.meta.client ? navigationHeaders() : undefined,
    });
  }

  async create(draft: TeamRegistrationDraft) {
    const crest = import.meta.client && draft.crest ? dataUrlFile(draft.crest) : null;
    const body = crest ? new FormData() : undefined;
    if (body) {
      body.append("name", draft.name);
      body.append("head_coach_name", draft.head_coach_name);
      body.append("city", draft.city);
      body.append("stadium_name", draft.stadium_name);
      if (draft.founded_year !== null) body.append("founded_year", String(draft.founded_year));
      body.append("crest", crest);
    }
    const result = await this.http.request<{ id: string }>("teams/", {
      method: "POST",
      body: body ?? {
        name: draft.name,
        head_coach_name: draft.head_coach_name,
        city: draft.city,
        stadium_name: draft.stadium_name,
        founded_year: draft.founded_year,
      },
    });
    if (draft.players.length) {
      await this.http.request(`teams/${result.id}/squad/`, {
        method: "POST",
        body: { players: draft.players },
      });
    }
    return result.id;
  }

  update(
    id: string,
    data: Pick<TeamDetail, "name"> & { head_coach_name: string } & Partial<
        Pick<TeamDetail, "crest" | "city" | "stadium_name" | "founded_year">
      >,
  ) {
    const crest = import.meta.client && data.crest ? dataUrlFile(data.crest) : null;
    if (!crest) {
      const { crest: _currentCrest, ...fields } = data;
      return this.http.request<void>(`teams/${id}/`, { method: "PATCH", body: fields });
    }
    const body = new FormData();
    body.append("name", data.name);
    if (data.head_coach_name) body.append("head_coach_name", data.head_coach_name);
    if (data.city !== undefined && data.city !== null) body.append("city", data.city);
    if (data.stadium_name !== undefined && data.stadium_name !== null)
      body.append("stadium_name", data.stadium_name);
    if (data.founded_year !== undefined && data.founded_year !== null)
      body.append("founded_year", String(data.founded_year));
    body.append("crest", crest);
    return this.http.request<void>(`teams/${id}/`, { method: "PATCH", body });
  }

  async addPlayer(teamId: string, player: Omit<TeamPlayer, "id" | "is_captain">) {
    const result = await this.http.request<{ id: string }>(`teams/${teamId}/players/`, {
      method: "POST",
      body: player,
    });
    return result.id;
  }

  updatePlayer(teamId: string, playerId: string, player: Omit<TeamPlayer, "id" | "is_captain">) {
    return this.http.request<void>(`teams/${teamId}/players/${playerId}/`, {
      method: "PATCH",
      body: player,
    });
  }

  setCaptain(teamId: string, playerId: string) {
    return this.http.request<void>(`teams/${teamId}/captain/`, {
      method: "PUT",
      body: { player_id: playerId },
    });
  }
}
