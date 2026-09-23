export type Result = "win" | "draw" | "loss";
export type Position =
  | "goalkeeper"
  | "right_back"
  | "center_back"
  | "left_back"
  | "sweeper"
  | "right_wing_back"
  | "left_wing_back"
  | "defensive_midfielder"
  | "central_midfielder"
  | "attacking_midfielder"
  | "right_midfielder"
  | "left_midfielder"
  | "right_winger"
  | "left_winger"
  | "second_striker"
  | "center_forward";
export interface TeamPlayer {
  id: string;
  name: string;
  preferred_position: Position | null;
  preferred_shirt_number: number | null;
  is_captain: boolean;
}
export interface TeamRecentMatch {
  match_id: string;
  opponent_name: string;
  scheduled_at: string;
  goals_for: number;
  goals_against: number;
  penalty_score_for?: number;
  penalty_score_against?: number;
  result: Result;
}
export interface TeamSummary {
  id: string;
  name: string;
  crest: string | null;
  city: string | null;
  stadium_name: string | null;
  founded_year: number | null;
  last_match: Omit<TeamRecentMatch, "scheduled_at"> | null;
  next_match: {
    match_id: string;
    opponent_name: string;
    scheduled_at: string;
  } | null;
}
export interface TeamDetail {
  id: string;
  name: string;
  head_coach_name: string | null;
  crest: string | null;
  city: string | null;
  stadium_name: string | null;
  founded_year: number | null;
  statistics: {
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
  };
  players: TeamPlayer[];
  recent_matches: TeamRecentMatch[];
}
export interface PlayerDetail extends TeamPlayer {
  team: { id: string; name: string };
  statistics: {
    appearances: number;
    goals: number;
    yellow_cards: number;
    red_cards: number;
  };
  recent_matches: {
    match_id: string;
    scheduled_at: string;
    opponent: { id: string; name: string };
    result: Result;
    goals: number;
    yellow_cards: number;
    red_cards: number;
  }[];
}
export interface PlayerSummary extends TeamPlayer {
  team: { id: string; name: string };
  appearances: number;
  goals: number;
}
