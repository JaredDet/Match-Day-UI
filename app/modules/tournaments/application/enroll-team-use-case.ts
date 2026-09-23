import type { TournamentRepository } from "~/modules/tournaments/domain/tournament-repository";

export class EnrollTeamUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}
  execute(seasonId: string, teamId: string) {
    return this.tournaments.enroll(seasonId, teamId);
  }
}
