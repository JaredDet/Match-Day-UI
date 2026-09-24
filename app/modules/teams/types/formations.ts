import type { FormationPosition } from "~/modules/matches/data/formations";

export type FormationShape = "4-3-3" | "4-4-2" | "4-2-3-1" | "4-1-4-1" | "3-5-2" | "3-4-3";

export interface TeamFormation {
  id: string;
  team_id: string;
  name: string;
  shape: FormationShape;
  positions: FormationPosition[];
  is_default: boolean;
}

export type TeamFormationDraft = Omit<TeamFormation, "id" | "team_id">;
