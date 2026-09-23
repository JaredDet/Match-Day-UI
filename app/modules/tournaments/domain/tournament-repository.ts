export interface TournamentDto {
  id: string;
  slug: string;
  name: string;
  country: string;
  category: string;
  logo: string | null;
  max_teams_per_group: number;
}
export interface SeasonDto {
  id: string;
  tournament: string;
  name: string;
  teams: string[];
}
export interface PhaseDto {
  id: string;
  season: string;
  name: string;
  kind: "groups" | "knockout" | "third_place";
  order: number;
  status: "scheduled" | "active" | "finished";
  qualifying_teams: number;
  matchdays: number;
  generated: boolean;
  source_phase: string | null;
  scheduled_at: string | null;
  expected_matches: number | null;
}
export interface GroupDto {
  id: string;
  phase: string;
  name: string;
  tie_break_order: string[];
}
export interface GroupEntryDto {
  id: string;
  group: string;
  team: string;
}
export interface FixtureDto {
  id: string;
  phase: string;
  group: string | null;
  match: string;
  position: number;
  matchday: number;
}

export interface TournamentRepository {
  list(): Promise<TournamentDto[]>;
  get(slug: string, trackNavigation?: boolean): Promise<TournamentDto>;
  create(input: Omit<TournamentDto, "id" | "slug"> & { slug?: string }): Promise<string>;
  listSeasons(tournament?: string): Promise<SeasonDto[]>;
  createSeason(tournament: string, name: string): Promise<string>;
  enroll(season: string, team: string): Promise<void>;
  withdraw(season: string, team: string): Promise<void>;
  listPhases(season?: string): Promise<PhaseDto[]>;
  createPhase(input: {
    season: string;
    name: string;
    kind: PhaseDto["kind"];
    order: number;
    qualifying_teams: number;
    matchdays: number;
  }): Promise<string>;
  updatePhaseStatus(id: string, status: PhaseDto["status"]): Promise<void>;
  deletePhase(id: string): Promise<void>;
  listGroups(phase?: string): Promise<GroupDto[]>;
  createGroup(phase: string, name: string): Promise<string>;
  deleteGroup(id: string): Promise<void>;
  setTieBreak(id: string, teamIds: string[]): Promise<void>;
  listEntries(group?: string): Promise<GroupEntryDto[]>;
  addEntry(group: string, team: string): Promise<string>;
  deleteEntry(id: string): Promise<void>;
  listFixtures(phase?: string): Promise<FixtureDto[]>;
  createFixture(input: {
    phase: string;
    group: string | null;
    match: string;
    position: number;
    matchday: number;
  }): Promise<string>;
  deleteFixture(id: string): Promise<void>;
  standings(season: string): Promise<unknown[]>;
  bracket(season: string): Promise<unknown>;
  seasonMatches(season: string): Promise<unknown[]>;
  generateBracket(season: string, input: unknown): Promise<void>;
  advanceBracket(season: string): Promise<void>;
}
