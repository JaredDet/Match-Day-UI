import type {
  PlayerDetail,
  PlayerSummary,
  TeamDetail,
  TeamPlayer,
  TeamSummary,
} from "~/modules/teams/types/teams";
import type { TeamRegistrationDraft } from "~/modules/teams/types/registration";

export interface TeamRepository {
  list(search?: string): Promise<TeamSummary[]>;
  get(id: string, trackNavigation?: boolean): Promise<TeamDetail>;
  listPlayers(filters?: { team?: string; search?: string }): Promise<PlayerSummary[]>;
  getPlayer(id: string, trackNavigation?: boolean): Promise<PlayerDetail>;
  create(draft: TeamRegistrationDraft): Promise<string>;
  update(
    id: string,
    data: Pick<TeamDetail, "name"> & { head_coach_name: string } & Partial<
        Pick<TeamDetail, "crest" | "city" | "stadium_name" | "founded_year">
      >,
  ): Promise<void>;
  addPlayer(teamId: string, player: Omit<TeamPlayer, "id" | "is_captain">): Promise<string>;
  updatePlayer(
    teamId: string,
    playerId: string,
    player: Omit<TeamPlayer, "id" | "is_captain">,
  ): Promise<void>;
  setCaptain(teamId: string, playerId: string): Promise<void>;
}
