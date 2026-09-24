import type { Shootout } from "~/modules/matches/utils/shootout";
export type Goal = {
  player_name: string;
  assist_player_name?: string;
  goal_type: "regular" | "penalty" | "own_goal";
  minute: number;
  added_minute?: number;
};
export type Period =
  | "first_half"
  | "halftime"
  | "second_half"
  | "extra_time_first_half"
  | "extra_time_halftime"
  | "extra_time_second_half";
export type Team = {
  id: string;
  name: string;
  crest?: string | null;
  team_side: "home" | "away";
  score: number;
  formation: string | null;
  formation_variant?: "open" | "closed";
  positions: { number: number; x: number; y: number }[];
  penalty_score?: number;
  goals: Goal[];
};
export type Match = {
  shootout?: Shootout;
  id: string;
  status: "scheduled" | "live" | "finished";
  scheduled_at: string;
  current_period: Period | null;
  current_minute: number | null;
  current_added_minute: number;
  clock: {
    period: Period | null;
    status: "not_started" | "running" | "regulation_time_reached" | "deadline_reached" | "closed";
    minute: number | null;
    second: number;
    added_minute: number;
    announced_added_minutes: number;
  };
  home_team: Team;
  away_team: Team;
};
const periodNames: Record<Period, string> = {
  first_half: "1.er tiempo",
  halftime: "Descanso",
  second_half: "2.º tiempo",
  extra_time_first_half: "Prórroga · 1.er tiempo",
  extra_time_halftime: "Descanso de prórroga",
  extra_time_second_half: "Prórroga · 2.º tiempo",
};
export function periodLabel(match: Match) {
  return match.current_period ? periodNames[match.current_period] : "Por comenzar";
}
export function matchState(match: Match) {
  if (match.status === "scheduled") return "Por jugar";
  if (match.status === "finished") return "Finalizado";
  if (match.home_team.penalty_score != null && match.away_team.penalty_score != null)
    return "Tanda de penales";
  if (match.current_period === "halftime" || match.current_period === "extra_time_halftime")
    return periodLabel(match);
  return `${match.current_minute ?? "—"}${match.current_added_minute ? "+" + match.current_added_minute : ""}′ · ${periodLabel(match)}`;
}
export function goalMinute(goal: Goal) {
  return `${goal.minute}${goal.added_minute ? "+" + goal.added_minute : ""}′`;
}

export function time(value: string) {
  return new Date(value).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}
export function goalLabel(goal: Goal) {
  return `${goal.player_name}${goal.goal_type === "penalty" ? " (P)" : goal.goal_type === "own_goal" ? " (AG)" : ""}`;
}
