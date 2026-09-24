import type { TeamRepository } from "~/modules/teams/domain/team-repository";
import type { TeamFormationDraft } from "~/modules/teams/types/formations";

export class ManageTeamFormationsUseCase {
  constructor(private readonly teams: TeamRepository) {}
  list(teamId: string) {
    return this.teams.listFormations(teamId);
  }
  save(teamId: string, draft: TeamFormationDraft, formationId?: string) {
    return formationId
      ? this.teams.updateFormation(teamId, formationId, draft)
      : this.teams.createFormation(teamId, draft);
  }
  remove(teamId: string, formationId: string) {
    return this.teams.deleteFormation(teamId, formationId);
  }
}
