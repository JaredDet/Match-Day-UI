import type { TeamRepository } from "~/modules/teams/domain/team-repository";
import type { TeamRegistrationDraft } from "~/modules/teams/types/registration";

export class RegisterTeamUseCase {
  constructor(private readonly teams: TeamRepository) {}
  execute(draft: TeamRegistrationDraft) {
    return this.teams.create(draft);
  }
}
