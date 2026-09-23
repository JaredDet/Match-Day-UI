export type Side = "home" | "away";
export type EventKind =
  "goal" | "penalty_goal" | "own_goal" | "yellow_card" | "red_card" | "substitution";
export interface MatchEvent {
  id: string;
  kind: EventKind;
  side: Side;
  player: string;
  replacement?: string;
  minute: number;
  cancelled: boolean;
}
export interface MatchOperation {
  lineups: Record<Side, string[]>;
  events: MatchEvent[];
}
export const eventLabels: Record<EventKind, string> = {
  goal: "Gol",
  penalty_goal: "Gol de penal",
  own_goal: "Autogol",
  yellow_card: "Tarjeta amarilla",
  red_card: "Tarjeta roja",
  substitution: "Sustitución",
};
