import { teams, squad } from "~/modules/teams/data/teams";;
import type { Match } from "~/modules/matches/utils/matches";
import type {
  TeamDetail,
  TeamSummary,
  PlayerDetail,
  Position,
  Result,
} from "~/modules/teams/types/teams";
export const positionNames: Record<Position, string> = {
  goalkeeper: "Portero",
  right_back: "Lateral derecho",
  center_back: "Defensa central",
  left_back: "Lateral izquierdo",
  sweeper: "Líbero",
  right_wing_back: "Carrilero derecho",
  left_wing_back: "Carrilero izquierdo",
  defensive_midfielder: "Mediocentro defensivo",
  central_midfielder: "Mediocentro",
  attacking_midfielder: "Mediapunta",
  right_midfielder: "Volante derecho",
  left_midfielder: "Volante izquierdo",
  right_winger: "Extremo derecho",
  left_winger: "Extremo izquierdo",
  second_striker: "Segundo delantero",
  center_forward: "Delantero centro",
};
export const resultNames: Record<Result, string> = {
  win: "Victoria",
  draw: "Empate",
  loss: "Derrota",
};
export function createTeamProfiles(matches: Match[], catalog = teams, rosters: Record<string, import("~/modules/teams/types/teams").TeamPlayer[]> = {}) {
  const details: TeamDetail[] = catalog.map((team) => {
    const finished = matches
      .filter(
        (m) =>
          m.status === "finished" &&
          [m.home_team.id, m.away_team.id].includes(team.id),
      )
      .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
    const recent_matches = finished.map((m) => {
      const own = m.home_team.id === team.id ? m.home_team : m.away_team;
      const opponent = m.home_team.id === team.id ? m.away_team : m.home_team;
      const result: Result =
        own.penalty_score != null && opponent.penalty_score != null
          ? own.penalty_score > opponent.penalty_score
            ? "win"
            : "loss"
          : own.score > opponent.score
            ? "win"
            : own.score < opponent.score
              ? "loss"
              : "draw";
      return {
        match_id: m.id,
        opponent_name: opponent.name,
        scheduled_at: m.scheduled_at,
        goals_for: own.score,
        goals_against: opponent.score,
        ...(own.penalty_score != null && opponent.penalty_score != null
          ? {
              penalty_score_for: own.penalty_score,
              penalty_score_against: opponent.penalty_score,
            }
          : {}),
        result,
      };
    });
    const positions: Position[] = [
      "goalkeeper",
      "goalkeeper",
      "right_back",
      "center_back",
      "center_back",
      "left_back",
      "center_back",
      "defensive_midfielder",
      "central_midfielder",
      "attacking_midfielder",
      "central_midfielder",
      "right_midfielder",
      "right_winger",
      "center_forward",
      "left_winger",
    ];
    return {
      id: team.id,
      name: team.name,
      head_coach_name: team.id === "7" ? null : team.coach,
      statistics: {
        matches_played: finished.length,
        wins: recent_matches.filter((m) => m.result === "win").length,
        draws: recent_matches.filter((m) => m.result === "draw").length,
        losses: recent_matches.filter((m) => m.result === "loss").length,
        goals_for: recent_matches.reduce((n, m) => n + m.goals_for, 0),
        goals_against: recent_matches.reduce((n, m) => n + m.goals_against, 0),
      },
      players: rosters[team.id] ?? (
        team.id === "7"
          ? []
          : squad
              .flatMap((section) => section.players)
              .map((player, index) => ({
                id: `${team.id}-${index}`,
                name: player.split("|")[1]!,
                preferred_shirt_number:
                  index === 14 ? null : Number(player.split("|")[0]),
                preferred_position: index === 14 ? null : positions[index]!,
                is_captain: index === 3,
              }))),
      recent_matches,
    };
  });
  const summaries: TeamSummary[] = details.map((team) => {
    const next = matches
      .filter(
        (m) =>
          m.status === "scheduled" &&
          [m.home_team.id, m.away_team.id].includes(team.id),
      )
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
    const last = team.recent_matches[0];
    return {
      id: team.id,
      name: team.name,
      last_match: last
        ? {
            match_id: last.match_id,
            opponent_name: last.opponent_name,
            goals_for: last.goals_for,
            goals_against: last.goals_against,
            ...(last.penalty_score_for != null &&
            last.penalty_score_against != null
              ? {
                  penalty_score_for: last.penalty_score_for,
                  penalty_score_against: last.penalty_score_against,
                }
              : {}),
            result: last.result,
          }
        : null,
      next_match: next
        ? {
            match_id: next.id,
            opponent_name:
              next.home_team.id === team.id
                ? next.away_team.name
                : next.home_team.name,
            scheduled_at: next.scheduled_at,
          }
        : null,
    };
  });
  const players: PlayerDetail[] = details.flatMap((team) =>
    team.players.map((player) => {
      const recent_matches = team.recent_matches.map((recent) => {
        const match = matches.find((m) => m.id === recent.match_id)!;
        const own =
          match.home_team.id === team.id ? match.home_team : match.away_team;
        const opponent =
          match.home_team.id === team.id ? match.away_team : match.home_team;
        return {
          match_id: recent.match_id,
          scheduled_at: recent.scheduled_at,
          opponent: { id: opponent.id, name: opponent.name },
          result: recent.result,
          goals: own.goals.filter(
            (g) => g.player_name === player.name && g.goal_type !== "own_goal",
          ).length,
          yellow_cards: 0,
          red_cards: 0,
        };
      });
      return {
        ...player,
        team: { id: team.id, name: team.name },
        statistics: {
          appearances: recent_matches.length,
          goals: recent_matches.reduce((n, m) => n + m.goals, 0),
          yellow_cards: 0,
          red_cards: 0,
        },
        recent_matches,
      };
    }),
  );
  return { details, summaries, players };
}
