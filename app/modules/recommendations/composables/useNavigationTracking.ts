import { useRepositories } from "~/core/api/repository-context";
import type { RecommendationKind } from "~/modules/recommendations/domain/recommendation-repository";

function routeContent(path: string) {
  const match = path.match(/^\/(teams|players|news|matches|tournaments)\/([^/]+)$/);
  if (!match) return null;
  const kinds: Record<string, RecommendationKind> = {
    teams: "team",
    players: "player",
    news: "news",
    matches: "match",
    tournaments: "tournament",
  };
  return { kind: kinds[match[1]!]!, identifier: decodeURIComponent(match[2]!) };
}

export function useNavigationTracking() {
  const route = useRoute();
  const repository = useRepositories().recommendations;
  let timer: ReturnType<typeof setInterval> | undefined;
  let navigationId = "";
  let contentId = "";
  let contentKind: RecommendationKind | null = null;
  let activeSeconds = 0;
  let lastActivity = 0;
  let lastTick = 0;
  const events = ["pointerdown", "keydown", "scroll", "pointermove"] as const;
  const activity = () => {
    lastActivity = Date.now();
  };
  const visibility = () => {
    if (document.hidden) void send(true);
  };

  async function begin() {
    const content = routeContent(route.path);
    navigationId = crypto.randomUUID();
    contentId = "";
    contentKind = content?.kind ?? null;
    activeSeconds = 0;
    lastActivity = lastTick = Date.now();
    if (!content) return;
    try {
      contentId = await repository.visit(content.kind, content.identifier, navigationId);
    } catch {
      contentId = "";
    }
  }

  async function send(beacon = false) {
    if (!contentKind || !contentId || activeSeconds <= 0) return;
    await repository
      .heartbeat(
        {
          navigation_id: navigationId,
          content_kind: contentKind,
          content_id: contentId,
          active_seconds: Math.min(120, Math.round(activeSeconds)),
        },
        beacon,
      )
      .catch(() => undefined);
  }

  function tick() {
    const now = Date.now();
    const elapsed = Math.min(15, Math.max(0, (now - lastTick) / 1000));
    lastTick = now;
    if (
      document.visibilityState !== "visible" ||
      !document.hasFocus() ||
      now - lastActivity > 30_000
    )
      return;
    activeSeconds = Math.min(120, activeSeconds + elapsed);
    void send();
  }

  watch(
    () => route.path,
    () => {
      void send(true);
      void begin();
    },
  );
  onMounted(() => {
    void begin();
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    document.addEventListener("visibilitychange", visibility);
    timer = setInterval(tick, 15_000);
  });
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
    void send(true);
    events.forEach((event) => window.removeEventListener(event, activity));
    document.removeEventListener("visibilitychange", visibility);
  });
}
