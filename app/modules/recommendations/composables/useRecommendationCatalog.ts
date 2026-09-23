import { useDemoNews } from "~/modules/news/composables/useDemoNews";
import { useTeamProfiles } from "~/modules/teams/composables/useTeamProfiles";
import { useTournamentManagement } from "~/modules/tournaments/composables/useTournamentManagement";
import type { ContentCandidate } from "~/modules/recommendations/types/recommendations";

export function useRecommendationCatalog() {
  const { publishedNews } = useDemoNews();
  const profiles = useTeamProfiles();
  const { tournaments, seasons, registrations, phases, matches } = useTournamentManagement();
  return computed<ContentCandidate[]>(() => {
    const teamTournaments = (id: string) => [
      ...new Set(
        seasons.value
          .filter((s) => registrations.value[s.id]?.includes(id))
          .map((s) => s.tournament),
      ),
    ];
    const matchTournaments = (id: string) => [
      ...new Set(
        phases.value
          .filter((p) => p.fixtures.some((f) => f.match === id))
          .flatMap((p) => seasons.value.find((s) => s.id === p.season)?.tournament ?? []),
      ),
    ];
    return [
      ...profiles.value.details.map((team) => ({
        key: `team:${team.id}`,
        kind: "team" as const,
        title: team.name,
        path: `/teams/${team.id}`,
        description: "Plantilla, noticias y resultados del equipo.",
        teams: [team.id],
        tournaments: teamTournaments(team.id),
      })),
      ...profiles.value.players.map((player) => ({
        key: `player:${player.id}`,
        kind: "player" as const,
        title: player.name,
        path: `/players/${player.id}`,
        description: player.team.name,
        teams: [player.team.id],
        tournaments: teamTournaments(player.team.id),
      })),
      ...publishedNews.value.map((item) => ({
        key: `news:${item.id}`,
        kind: "news" as const,
        title: item.title,
        path: `/news/${item.id}`,
        description: item.preview,
        image: item.cover_image,
        teams: item.team_id ? [item.team_id] : [],
        tournaments: item.team_id ? teamTournaments(item.team_id) : [],
        date: item.published_at ?? undefined,
      })),
      ...matches.value.map((match) => ({
        key: `match:${match.id}`,
        kind: "match" as const,
        title: `${match.home_team.name} – ${match.away_team.name}`,
        path: `/matches/${match.id}`,
        description:
          match.status === "finished"
            ? "Finalizado"
            : match.status === "live"
              ? "En juego"
              : "Próximo partido",
        homeTeam: match.home_team.name,
        awayTeam: match.away_team.name,
        homeScore: match.home_team.score,
        awayScore: match.away_team.score,
        teams: [match.home_team.id, match.away_team.id],
        tournaments: matchTournaments(match.id),
        date: match.scheduled_at,
        live: match.status === "live",
      })),
      ...tournaments.value.map((tournament) => ({
        key: `tournament:${tournament.id}`,
        kind: "tournament" as const,
        title: tournament.name,
        path: `/tournaments/${tournament.slug}`,
        description: "Temporadas, equipos y clasificación.",
        teams: [],
        tournaments: [tournament.id],
      })),
    ];
  });
}
