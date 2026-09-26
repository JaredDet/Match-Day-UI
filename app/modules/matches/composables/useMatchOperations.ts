import { useRepositories } from "~/core/api/repository-context";
import { useMatches } from "~/modules/matches/composables/useMatches";
import type {
  EventKind,
  MatchEvent,
  MatchOperation,
  Side,
} from "~/modules/matches/types/operations";
import type { Match, Period } from "~/modules/matches/utils/matches";
import type { TeamPlayer } from "~/modules/teams/types/teams";
import type { FormationPosition } from "~/modules/matches/data/formations";
import type { TeamFormation } from "~/modules/teams/types/formations";

type ApiMatch = Match & {
  events?: Array<Record<string, unknown>>;
  home_team: Match["home_team"] & { lineup?: Array<Record<string, unknown>> };
  away_team: Match["away_team"] & { lineup?: Array<Record<string, unknown>> };
};

export function useMatchOperations() {
  const repositories = useRepositories(),
    catalog = useMatches();
  const details = useState<Record<string, ApiMatch>>("managed-match-details", () => ({}));
  const rosters = useState<Record<string, TeamPlayer[]>>("managed-team-rosters", () => ({}));
  const formations = useState<Record<string, TeamFormation[]>>(
    "managed-team-formations",
    () => ({}),
  );
  const matches = computed(() =>
    catalog.matches.value.map((item) => details.value[item.id] ?? item),
  );
  const operations = computed<Record<string, MatchOperation>>(() =>
    Object.fromEntries(
      Object.entries(details.value).map(([id, match]) => {
        const lineup = (side: Side) =>
          (match[`${side}_team`].lineup ?? [])
            .filter((player) => player.role === "starter")
            .map((player) => String(player.player_id));
        const events: MatchEvent[] = (match.events ?? []).flatMap((event) => {
          const type = String(event.type ?? "");
          const kind: EventKind | null =
            type === "goal"
              ? event.goal_type === "penalty"
                ? "penalty_goal"
                : event.goal_type === "own_goal"
                  ? "own_goal"
                  : "goal"
              : type === "yellow_card"
                ? "yellow_card"
                : type === "red_card"
                  ? "red_card"
                  : type === "substitution"
                    ? "substitution"
                    : null;
          return kind
            ? [
                {
                  id: String(event.id),
                  kind,
                  side: event.team_side as Side,
                  player: String(event.player_id ?? event.player_out_id),
                  replacement: event.player_in_id ? String(event.player_in_id) : undefined,
                  minute: Number(event.minute ?? 0),
                  cancelled: false,
                },
              ]
            : [];
        });
        return [id, { lineups: { home: lineup("home"), away: lineup("away") }, events }];
      }),
    ),
  );
  const roster = (teamId: string) => rosters.value[teamId] ?? [];
  async function loadTeamFormations(teamId: string) {
    if (!teamId || formations.value[teamId]) return;
    formations.value[teamId] = await repositories.teams.listFormations(teamId);
  }
  async function refresh(id?: string) {
    await catalog.refresh();
    if (id) details.value[id] = (await repositories.matches.get(id)) as ApiMatch;
  }
  async function prepare(id: string) {
    const match = (await repositories.matches.get(id)) as ApiMatch;
    details.value[id] = match;
    await Promise.all(
      (["home", "away"] as Side[]).map(async (side) => {
        const teamId = match[`${side}_team`].id;
        const [team, teamFormations] = await Promise.all([
          repositories.teams.get(teamId),
          repositories.teams.listFormations(teamId),
        ]);
        rosters.value[teamId] = team.players;
        formations.value[teamId] = teamFormations;
      }),
    );
    return operations.value[id]!;
  }
  async function create(
    home: string,
    away: string,
    date: string,
    selectedFormations?: { home: string; away: string },
  ) {
    if (!home || !away || home === away) throw new Error("Selecciona dos equipos distintos.");
    if (!Number.isFinite(Date.parse(date))) throw new Error("Selecciona una fecha válida.");
    const id = await repositories.matches.create(
      home,
      away,
      new Date(date).toISOString(),
      selectedFormations,
    );
    await refresh(id);
    return id;
  }
  async function lineup(
    id: string,
    side: Side,
    players: string[],
    shape: string,
    positions: FormationPosition[],
  ) {
    if (players.length !== 11 || new Set(players).size !== 11)
      throw new Error("Selecciona once titulares distintos.");
    const all = roster(details.value[id]![`${side}_team`].id);
    const shirt = (player: TeamPlayer, index: number) => player.preferred_shirt_number ?? index + 1;
    await repositories.matches.command(id, `lineups/${side}/`, "PUT", {
      formation: shape,
      players: players.map((playerId, index) => ({
        player_id: playerId,
        shirt_number: shirt(
          all.find((player) => player.id === playerId)!,
          index,
        ),
        position_x: positions[index]?.x,
        position_y: positions[index]?.y,
      })),
      substitutes: all
        .filter((player) => !players.includes(player.id))
        .map((player, index) => ({
          player_id: player.id,
          shirt_number: shirt(player, players.length + index),
        })),
    });
    await refresh(id);
  }
  async function changeFormation(
    id: string,
    side: Side,
    shape: string,
    positions: FormationPosition[],
  ) {
    const active = (details.value[id]?.[`${side}_team`].lineup ?? []).filter(
      (player) => player.is_on_field && !player.is_sent_off,
    );
    await repositories.matches.command(id, `lineups/${side}/formation/`, "PATCH", {
      formation: shape,
      positions: active.map((player, index) => ({
        player_id: player.player_id,
        position_x: positions[index]?.x,
        position_y: positions[index]?.y,
      })),
    });
    await refresh(id);
  }
  function activePlayers(id: string, side: Side) {
    return (details.value[id]?.[`${side}_team`].lineup ?? [])
      .filter((player) => player.is_on_field && !player.is_sent_off)
      .map((player) => String(player.player_id));
  }
  async function period(id: string, action: "next" | "extra" | "finish", _minute?: number) {
    const match = details.value[id] ?? ((await repositories.matches.get(id)) as ApiMatch);
    if (action === "finish") await repositories.matches.command(id, "finish/", "POST");
    else if (action === "extra")
      await repositories.matches.command(id, "periods/start/", "POST", {
        period: "extra_time_first_half",
      });
    else if (match.status === "scheduled") await repositories.matches.command(id, "start/", "POST");
    else if (match.clock.status === "running")
      await repositories.matches.command(id, "periods/end/", "POST", {
        expected_period: match.current_period,
      });
    else {
      const next: Partial<Record<Period, Period>> = {
        first_half: "second_half",
        halftime: "second_half",
        extra_time_first_half: "extra_time_second_half",
        extra_time_halftime: "extra_time_second_half",
      };
      const nextPeriod = next[match.current_period!];
      if (!nextPeriod) throw new Error("Finaliza el partido o inicia la prórroga.");
      await repositories.matches.command(id, "periods/start/", "POST", { period: nextPeriod });
    }
    await refresh(id);
  }
  async function setAddedTime(id: string, minutes: number) {
    const match = details.value[id] ?? ((await repositories.matches.get(id)) as ApiMatch);
    if (!match.current_period) throw new Error("El partido no tiene un periodo activo.");
    await repositories.matches.command(id, "periods/added-time/", "PATCH", {
      expected_period: match.current_period,
      minutes,
    });
    await refresh(id);
  }
  async function event(
    id: string,
    _side: Side,
    kind: EventKind,
    player: string,
    minute: number,
    replacement?: string,
  ) {
    if (["goal", "penalty_goal", "own_goal"].includes(kind))
      await repositories.matches.command(id, "goals/", "POST", {
        player_id: player,
        goal_type:
          kind === "penalty_goal" ? "penalty" : kind === "own_goal" ? "own_goal" : "regular",
        minute,
      });
    else if (["yellow_card", "red_card"].includes(kind))
      await repositories.matches.command(id, "cards/", "POST", {
        player_id: player,
        card_type: kind === "yellow_card" ? "yellow" : "red",
        minute,
      });
    else
      await repositories.matches.command(id, "substitutions/", "POST", {
        player_out_id: player,
        player_in_id: replacement,
        reason: "tactical",
        minute,
      });
    await refresh(id);
  }
  async function statistic(
    id: string,
    side: Side,
    kind: "foul" | "corner" | "offside" | "injury" | "shot" | "penalty_attempt" | "var",
    minute: number,
    options: {
      player?: string;
      outcome?: string;
      goalkeeper?: string;
      reason?: string;
      decision?: string;
    } = {},
  ) {
    const paths = {
      foul: "fouls/",
      corner: "corners/",
      offside: "offsides/",
      injury: "injuries/",
      shot: "shots/",
      penalty_attempt: "penalty-attempts/",
      var: "var-reviews/",
    } as const;
    const payload =
      kind === "var"
        ? { team_side: side, reason: options.reason, decision: options.decision, minute }
        : {
            player_id: options.player,
            minute,
            ...(kind === "shot"
              ? {
                  outcome: options.outcome,
                  goalkeeper_id: options.outcome === "saved" ? options.goalkeeper : undefined,
                }
              : {}),
            ...(kind === "penalty_attempt" ? { outcome: options.outcome } : {}),
          };
    await repositories.matches.command(id, paths[kind], "POST", payload);
    await refresh(id);
  }
  async function possession(id: string, homePercentage: number) {
    await repositories.matches.command(id, "possession/", "PATCH", {
      home_percentage: homePercentage,
    });
    await refresh(id);
  }
  async function cancel(id: string, eventId: string) {
    const item = operations.value[id]?.events.find((event) => event.id === eventId);
    if (!item) throw new Error("Evento no encontrado.");
    const path = ["goal", "penalty_goal", "own_goal"].includes(item.kind)
      ? `goals/${eventId}/disallow/`
      : `cards/${eventId}/rescind/`;
    await repositories.matches.command(id, path, "POST");
    await refresh(id);
  }
  async function shootout(id: string) {
    await repositories.matches.command(id, "penalty-shootout/start/", "POST", {
      starting_team_side: "home",
    });
    await refresh(id);
  }
  async function kick(id: string, player: string, scored: boolean) {
    await repositories.matches.command(id, "penalty-shootout/kicks/", "POST", {
      player_id: player,
      outcome: scored ? "scored" : "missed",
    });
    await refresh(id);
  }
  async function finishShootout(id: string) {
    await repositories.matches.command(id, "penalty-shootout/finish/", "POST");
    await refresh(id);
  }
  return {
    matches,
    operations,
    roster,
    formations,
    loadTeamFormations,
    create,
    prepare,
    lineup,
    changeFormation,
    activePlayers,
    period,
    setAddedTime,
    event,
    statistic,
    possession,
    cancel,
    shootout,
    kick,
    finishShootout,
  };
}
