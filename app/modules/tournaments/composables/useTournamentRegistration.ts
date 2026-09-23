import { useRepositories } from "~/core/api/repository-context";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { EnrollTeamUseCase } from "~/modules/tournaments/application/enroll-team-use-case";
import { useTournaments } from "~/modules/tournaments/composables/useTournaments";

export function useTournamentRegistration() {
  const repository = useRepositories().tournaments;
  const enrollTeam = new EnrollTeamUseCase(repository);
  const catalog = useTournaments();
  const { teams } = useTeams();
  const route = useRoute();
  const seasonId = ref(String(route.query.season ?? catalog.seasons.value[0]?.id ?? ""));
  const teamId = ref("");
  const message = ref("");
  const error = ref("");
  const tournament = computed(() => {
    const season = catalog.seasons.value.find((item) => item.id === seasonId.value);
    return (
      catalog.tournaments.value.find((item) => item.id === season?.tournament) ??
      catalog.tournaments.value[0]
    );
  });
  const enrolled = computed(
    () => catalog.seasons.value.find((item) => item.id === seasonId.value)?.teams ?? [],
  );
  const available = computed(() => teams.value.filter((team) => !enrolled.value.includes(team.id)));
  const phases = useAsyncData("registration-phases", () => repository.listPhases(), {
    default: () => [],
  });
  const locked = computed(() =>
    phases.data.value.some((phase) => phase.season === seasonId.value && phase.generated),
  );
  watch(seasonId, () => {
    teamId.value = "";
    message.value = "";
    error.value = "";
  });
  async function register() {
    error.value = "";
    message.value = "";
    try {
      await enrollTeam.execute(seasonId.value, teamId.value);
      const teamName = teams.value.find((team) => team.id === teamId.value)?.name;
      await catalog.refreshSeasons();
      message.value = `${teamName} se inscribió correctamente.`;
      teamId.value = "";
    } catch (exception) {
      error.value = (exception as Error).message;
      throw exception;
    }
  }
  return {
    tournament,
    seasons: catalog.seasons,
    seasonId,
    teamId,
    enrolled,
    locked,
    available,
    message,
    error,
    register,
  };
}
