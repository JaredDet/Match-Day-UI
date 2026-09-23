import { useDemoTeams } from "~/modules/teams/composables/useDemoTeams";
import { useDemoMatches } from "~/modules/matches/composables/useDemoMatches";
import { createTeamProfiles } from "~/modules/teams/data/teamProfiles";
export function useTeamProfiles() {
  const { teams, rosters } = useDemoTeams();
  const { matches } = useDemoMatches();
  return computed(() => createTeamProfiles(matches.value, teams.value, rosters.value));
}
