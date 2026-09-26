import { useRepositories } from "~/core/api/repository-context";
import type { RecommendationItemDto } from "~/modules/recommendations/domain/recommendation-repository";
import type { Recommendation } from "~/modules/recommendations/types/recommendations";

const reasonLabels: Record<RecommendationItemDto["reason"], string> = {
  similar_visitors: "Visitantes con gustos similares también exploraron este contenido",
  team_interest: "Relacionado directamente con los equipos que más consultas",
  tournament_interest: "Relacionado con los torneos que visitas con frecuencia",
  recent_content: "Contenido reciente para mantenerte al día",
  live_match: "Partido en vivo ahora",
  discovery: "Una opción nueva para descubrir",
};

function adapt(item: RecommendationItemDto): Recommendation {
  const collection = {
    match: "matches",
    news: "news",
    tournament: "tournaments",
    team: "teams",
    player: "players",
  }[item.kind];
  return {
    key: `${item.kind}:${item.id}`,
    kind: item.kind,
    title: item.title,
    path: `/${collection}/${item.id}`,
    description: item.preview,
    image: item.image,
    teams: item.team_ids ?? [],
    tournaments: [],
    score: item.score,
    affinity: item.reason === "team_interest" ? 1 : 0,
    reason: reasonLabels[item.reason],
    preferredTeam: item.reason === "team_interest",
  };
}

export function useRecommendations() {
  const repository = useRepositories().recommendations;
  const clearedAt = useState("recommendation-cleared-at", () => 0);
  const query = useAsyncData("recommendations", () => repository.get());
  const sections = computed(() => ({
    news: (query.data.value?.news ?? []).map(adapt),
    matches: (query.data.value?.matches ?? []).map(adapt),
    tournaments: (query.data.value?.tournaments ?? []).map(adapt),
    discovery: (query.data.value?.discovery ?? []).map(adapt),
  }));
  async function clearHistory() {
    await repository.clear();
    clearedAt.value = Date.now();
    await query.refresh();
  }
  return {
    sections,
    personalized: computed(() => query.data.value?.personalized ?? false),
    generatedAt: computed(() => query.data.value?.generated_at ?? null),
    expiresAt: computed(() => query.data.value?.expires_at ?? null),
    pending: query.pending,
    error: query.error,
    clearedAt,
    clearHistory,
    refresh: query.refresh,
  };
}
