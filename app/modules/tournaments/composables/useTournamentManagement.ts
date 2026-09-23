import { useRepositories } from "~/core/api/repository-context";
import { useMatches } from "~/modules/matches/composables/useMatches";
import type { DemoPhase } from "~/modules/tournaments/types/management";

export function useTournamentManagement() {
  const repository = useRepositories().tournaments;
  const matchRepository = useRepositories().matches;
  const tournamentQuery = useAsyncData("tournaments", () => repository.list(), {
    default: () => [],
  });
  const seasonQuery = useAsyncData("tournament-seasons", () => repository.listSeasons(), {
    default: () => [],
  });
  const phaseQuery = useAsyncData("tournament-phases", () => repository.listPhases(), {
    default: () => [],
  });
  const groupQuery = useAsyncData("tournament-groups", () => repository.listGroups(), {
    default: () => [],
  });
  const entryQuery = useAsyncData("tournament-group-entries", () => repository.listEntries(), {
    default: () => [],
  });
  const fixtureQuery = useAsyncData("tournament-fixtures", () => repository.listFixtures(), {
    default: () => [],
  });
  const { matches, refresh: refreshMatches } = useMatches();
  const standingsCache = useState<Record<string, any[]>>("tournament-standings", () => ({}));

  const registrations = computed(() =>
    Object.fromEntries(seasonQuery.data.value.map((season) => [season.id, season.teams])),
  );
  const phases = computed<DemoPhase[]>(() =>
    phaseQuery.data.value.map((phase) => ({
      id: phase.id,
      season: phase.season,
      name: phase.name,
      kind: phase.kind,
      status: phase.status,
      generated: phase.generated,
      qualifying: phase.qualifying_teams,
      matchdays: phase.matchdays,
      source: phase.source_phase ?? undefined,
      scheduled_at: phase.scheduled_at ?? undefined,
      groups: groupQuery.data.value
        .filter((group) => group.phase === phase.id)
        .map((group) => ({
          id: group.id,
          name: group.name,
          teams: entryQuery.data.value
            .filter((entry) => entry.group === group.id)
            .map((entry) => entry.team),
          manualOrder: group.tie_break_order,
        })),
      fixtures: fixtureQuery.data.value
        .filter((fixture) => fixture.phase === phase.id)
        .map((fixture) => ({
          id: fixture.id,
          match: fixture.match,
          group: fixture.group ?? undefined,
          matchday: fixture.matchday,
        })),
    })),
  );

  async function refreshStructure() {
    await Promise.all([
      phaseQuery.refresh(),
      groupQuery.refresh(),
      entryQuery.refresh(),
      fixtureQuery.refresh(),
      seasonQuery.refresh(),
      refreshMatches(),
    ]);
  }
  const locked = (season: string) =>
    phases.value.some((phase) => phase.season === season && phase.generated);
  async function createTournament(name: string, cap = 4) {
    const id = await repository.create({
      name,
      country: "Chile",
      category: "Torneo",
      logo: null,
      max_teams_per_group: cap,
    });
    await tournamentQuery.refresh();
    return id;
  }
  async function createSeason(tournament: string, name: string) {
    const id = await repository.createSeason(tournament, name);
    await seasonQuery.refresh();
    return id;
  }
  async function enroll(season: string, team: string) {
    await repository.enroll(season, team);
    await seasonQuery.refresh();
  }
  async function withdraw(season: string, team: string) {
    await repository.withdraw(season, team);
    await seasonQuery.refresh();
  }
  async function createPhase(season: string, name: string, qualifying: number, matchdays: number) {
    const order = phases.value.filter((phase) => phase.season === season).length;
    const id = await repository.createPhase({
      season,
      name,
      kind: "groups",
      order,
      qualifying_teams: qualifying,
      matchdays,
    });
    await phaseQuery.refresh();
    return id;
  }
  async function addGroup(phase: string, name: string) {
    await repository.createGroup(phase, name);
    await groupQuery.refresh();
  }
  async function assign(_phase: string, group: string, team: string) {
    await repository.addEntry(group, team);
    await entryQuery.refresh();
  }
  async function removeTeam(_phase: string, group: string, team: string) {
    const entry = entryQuery.data.value.find((item) => item.group === group && item.team === team);
    if (!entry) throw new Error("Inscripción de grupo no encontrada.");
    await repository.deleteEntry(entry.id);
    await entryQuery.refresh();
  }
  async function removeGroup(_phase: string, group: string) {
    await repository.deleteGroup(group);
    await groupQuery.refresh();
  }
  async function removePhase(phase: string) {
    await repository.deletePhase(phase);
    await phaseQuery.refresh();
  }
  async function fixture(phase: string, group: string, match: string, matchday: number) {
    await repository.createFixture({
      phase,
      group,
      match,
      position: fixtureQuery.data.value.filter((item) => item.phase === phase).length,
      matchday,
    });
    await fixtureQuery.refresh();
  }
  async function unfixture(_phase: string, match: string) {
    const fixture = fixtureQuery.data.value.find((item) => item.match === match);
    if (!fixture) throw new Error("Fixture no encontrado.");
    await repository.deleteFixture(fixture.id);
    await fixtureQuery.refresh();
  }
  function standings(phase: string, group: string) {
    const season = phases.value.find((item) => item.id === phase)?.season;
    const data = season ? (standingsCache.value[season] ?? []) : [];
    const rows = data.find((item: any) => item.id === group)?.rows ?? [];
    return rows.map((row: any) => ({
      ...row,
      wins: row.w,
      draws: row.d,
      losses: row.l,
      tied: !!row.tie_break_required,
    }));
  }
  async function loadStandings(season: string) {
    standingsCache.value[season] = await repository.standings(season);
  }
  async function finishGroups(phase: string) {
    await repository.updatePhaseStatus(phase, "finished");
    await phaseQuery.refresh();
    const season = phases.value.find((item) => item.id === phase)?.season;
    if (season) await loadStandings(season);
  }
  async function manualOrder(_phase: string, group: string, order: string[]) {
    await repository.setTieBreak(group, order);
    await groupQuery.refresh();
  }
  async function generate(
    season: string,
    entrants: string[],
    date: string,
    interval: number,
    third: boolean,
    source?: string,
  ) {
    await repository.generateBracket(season, {
      starts_at: new Date(date).toISOString(),
      ...(source ? { source_phase_id: source } : { team_ids: entrants }),
      round_interval_days: interval,
      third_place: third,
    });
    await refreshStructure();
  }
  async function advance(season: string) {
    await repository.advanceBracket(season);
    await refreshStructure();
    return 0;
  }
  async function createMatch(home: string, away: string, date: string) {
    const id = await matchRepository.create(home, away, new Date(date).toISOString());
    await refreshMatches();
    return id;
  }

  watch(
    () => seasonQuery.data.value.map((season) => season.id).join(","),
    () => {
      for (const season of seasonQuery.data.value)
        if (!standingsCache.value[season.id]) void loadStandings(season.id);
    },
    { immediate: true },
  );
  return {
    tournaments: tournamentQuery.data,
    seasons: seasonQuery.data,
    phases,
    registrations,
    matches,
    locked,
    createTournament,
    createSeason,
    enroll,
    withdraw,
    createPhase,
    addGroup,
    assign,
    removeTeam,
    removeGroup,
    removePhase,
    fixture,
    unfixture,
    standings,
    finishGroups,
    manualOrder,
    generate,
    advance,
    createMatch,
  };
}
