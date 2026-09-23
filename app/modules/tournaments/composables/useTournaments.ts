import { useRepositories } from "~/core/api/repository-context";

export function useTournaments() {
  const repository = useRepositories().tournaments;
  const tournaments = useAsyncData("tournaments", () => repository.list(), { default: () => [] });
  const seasons = useAsyncData("tournament-seasons", () => repository.listSeasons(), {
    default: () => [],
  });
  return {
    tournaments: tournaments.data,
    seasons: seasons.data,
    pending: computed(() => tournaments.pending.value || seasons.pending.value),
    refreshTournaments: tournaments.refresh,
    refreshSeasons: seasons.refresh,
  };
}
