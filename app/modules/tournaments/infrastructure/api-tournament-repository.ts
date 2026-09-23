import type { HttpClient } from "~/core/api/http-client";
import type {
  FixtureDto,
  GroupDto,
  GroupEntryDto,
  PhaseDto,
  SeasonDto,
  TournamentDto,
  TournamentRepository,
} from "~/modules/tournaments/domain/tournament-repository";

function navigationHeaders() {
  return { "X-Navigation-Intent": "detail-view", "X-Navigation-Id": crypto.randomUUID() };
}

function dataUrlFile(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const bytes = Uint8Array.from(atob(match[2]!), (character) => character.charCodeAt(0));
  return new File([bytes], "logo", { type: match[1] });
}

export class ApiTournamentRepository implements TournamentRepository {
  constructor(private readonly http: HttpClient) {}
  list() {
    return this.http.request<TournamentDto[]>("tournaments/");
  }
  get(slug: string, trackNavigation = false) {
    return this.http.request<TournamentDto>(`tournaments/${slug}/`, {
      headers: trackNavigation && import.meta.client ? navigationHeaders() : undefined,
    });
  }
  async create(input: Omit<TournamentDto, "id" | "slug"> & { slug?: string }) {
    const slug =
      input.slug ??
      input.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const logo = import.meta.client && input.logo ? dataUrlFile(input.logo) : null;
    let body: FormData | Record<string, unknown> = { ...input, slug };
    if (logo) {
      body = new FormData();
      body.append("slug", slug);
      body.append("name", input.name);
      body.append("country", input.country);
      body.append("category", input.category);
      body.append("max_teams_per_group", String(input.max_teams_per_group));
      body.append("logo", logo);
    }
    const result = await this.http.request<{ id: string }>("tournaments/", {
      method: "POST",
      body,
    });
    return result.id;
  }
  listSeasons(tournament?: string) {
    return this.http.request<SeasonDto[]>("tournament-seasons/", { query: { tournament } });
  }
  async createSeason(tournament: string, name: string) {
    const result = await this.http.request<{ id: string }>("tournament-seasons/", {
      method: "POST",
      body: { tournament, name },
    });
    return result.id;
  }
  enroll(season: string, team: string) {
    return this.http.request<void>(`tournament-seasons/${season}/teams/`, {
      method: "POST",
      body: { team_id: team },
    });
  }
  withdraw(season: string, team: string) {
    return this.http.request<void>(`tournament-seasons/${season}/teams/${team}/`, {
      method: "DELETE",
    });
  }
  listPhases(season?: string) {
    return this.http.request<PhaseDto[]>("tournament-phases/", { query: { season } });
  }
  async createPhase(input: {
    season: string;
    name: string;
    kind: PhaseDto["kind"];
    order: number;
    qualifying_teams: number;
    matchdays: number;
  }) {
    const result = await this.http.request<{ id: string }>("tournament-phases/", {
      method: "POST",
      body: input,
    });
    return result.id;
  }
  updatePhaseStatus(id: string, status: PhaseDto["status"]) {
    return this.http.request<void>(`tournament-phases/${id}/status/`, {
      method: "PUT",
      body: { status },
    });
  }
  deletePhase(id: string) {
    return this.http.request<void>(`tournament-phases/${id}/`, { method: "DELETE" });
  }
  listGroups(phase?: string) {
    return this.http.request<GroupDto[]>("tournament-groups/", { query: { phase } });
  }
  async createGroup(phase: string, name: string) {
    const result = await this.http.request<{ id: string }>("tournament-groups/", {
      method: "POST",
      body: { phase, name },
    });
    return result.id;
  }
  deleteGroup(id: string) {
    return this.http.request<void>(`tournament-groups/${id}/`, { method: "DELETE" });
  }
  setTieBreak(id: string, teamIds: string[]) {
    return this.http.request<void>(`tournament-groups/${id}/tie-break/`, {
      method: "PUT",
      body: { team_ids: teamIds },
    });
  }
  listEntries(group?: string) {
    return this.http.request<GroupEntryDto[]>("tournament-group-entries/", { query: { group } });
  }
  async addEntry(group: string, team: string) {
    const result = await this.http.request<{ id: string }>("tournament-group-entries/", {
      method: "POST",
      body: { group, team },
    });
    return result.id;
  }
  deleteEntry(id: string) {
    return this.http.request<void>(`tournament-group-entries/${id}/`, { method: "DELETE" });
  }
  listFixtures(phase?: string) {
    return this.http.request<FixtureDto[]>("tournament-fixtures/", { query: { phase } });
  }
  async createFixture(input: {
    phase: string;
    group: string | null;
    match: string;
    position: number;
    matchday: number;
  }) {
    const result = await this.http.request<{ id: string }>("tournament-fixtures/", {
      method: "POST",
      body: input,
    });
    return result.id;
  }
  deleteFixture(id: string) {
    return this.http.request<void>(`tournament-fixtures/${id}/`, { method: "DELETE" });
  }
  standings(season: string) {
    return this.http.request<unknown[]>(`tournament-seasons/${season}/groups/`);
  }
  bracket(season: string) {
    return this.http.request<unknown>(`tournament-seasons/${season}/bracket/`);
  }
  seasonMatches(season: string) {
    return this.http.request<unknown[]>(`tournament-seasons/${season}/matches/`);
  }
  generateBracket(season: string, input: unknown) {
    return this.http.request<void>(`tournament-seasons/${season}/generate-bracket/`, {
      method: "POST",
      body: input,
    });
  }
  advanceBracket(season: string) {
    return this.http.request<void>(`tournament-seasons/${season}/advance-bracket/`, {
      method: "POST",
    });
  }
}
