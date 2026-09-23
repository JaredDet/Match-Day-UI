import type { TeamRegistrationDraft } from "~/modules/teams/types/registration"

export function useTeamRegistrationDraft() {
  return useState<TeamRegistrationDraft | null>("demo-team-registration", () => null)
}
