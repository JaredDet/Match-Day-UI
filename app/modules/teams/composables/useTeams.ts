import { useRepositories } from "~/core/api/repository-context";

export function useTeams() {
  const repository = useRepositories().teams;
  const query = useAsyncData("teams", () => repository.list(), { default: () => [] });
  return {
    teams: query.data,
    pending: query.pending,
    error: query.error,
    refresh: query.refresh,
    teamById: (id: string) => query.data.value.find((team) => team.id === id),
  };
}

export function usePlayers() {
  const repository = useRepositories().teams;
  const query = useAsyncData("players", () => repository.listPlayers(), { default: () => [] });
  return {
    players: query.data,
    pending: query.pending,
    error: query.error,
    refresh: query.refresh,
  };
}
