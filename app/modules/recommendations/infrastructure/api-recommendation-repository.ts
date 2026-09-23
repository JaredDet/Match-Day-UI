import type { HttpClient } from "~/core/api/http-client";
import type {
  HeartbeatInput,
  RecommendationRepository,
  RecommendationResponse,
} from "~/modules/recommendations/domain/recommendation-repository";

export class ApiRecommendationRepository implements RecommendationRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly apiBase: string,
  ) {}
  get() {
    return this.http.request<RecommendationResponse>("recommendations/");
  }
  async visit(kind: HeartbeatInput["content_kind"], identifier: string, navigationId: string) {
    const paths = {
      team: "teams",
      player: "players",
      news: "news",
      match: "matches",
      tournament: "tournaments",
    } as const;
    const response = await this.http.request<{ id: string }>(`${paths[kind]}/${identifier}/`, {
      headers: { "X-Navigation-Intent": "detail-view", "X-Navigation-Id": navigationId },
    });
    return response.id;
  }
  async heartbeat(input: HeartbeatInput, beacon = false) {
    if (beacon && import.meta.client && navigator.sendBeacon) {
      const csrf = document.cookie
        .split(";")
        .map((value) => value.trim())
        .find((value) => value.startsWith("csrftoken="))
        ?.split("=")[1];
      const body = new FormData();
      Object.entries(input).forEach(([key, value]) => body.append(key, String(value)));
      if (csrf) body.append("csrfmiddlewaretoken", decodeURIComponent(csrf));
      navigator.sendBeacon(
        `${this.apiBase.replace(/\/$/, "")}/recommendations/activity/heartbeat/`,
        body,
      );
      return;
    }
    await this.http.ensureCsrf();
    await this.http.request<void>("recommendations/activity/heartbeat/", {
      method: "POST",
      body: input,
    });
  }
  async clear() {
    await this.http.ensureCsrf();
    await this.http.request<void>("recommendations/history/", { method: "DELETE" });
  }
}
