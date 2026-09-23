import type { HttpClient } from "~/core/api/http-client";
import type { DemoNews } from "~/modules/news/data/news";
import type {
  NewsListItem,
  NewsRepository,
  SaveNewsInput,
} from "~/modules/news/domain/news-repository";

function navigationHeaders() {
  return {
    "X-Navigation-Intent": "detail-view",
    "X-Navigation-Id": crypto.randomUUID(),
  };
}

function dataUrlFile(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const bytes = Uint8Array.from(atob(match[2]!), (character) => character.charCodeAt(0));
  return new File([bytes], "cover", { type: match[1] });
}

export class ApiNewsRepository implements NewsRepository {
  constructor(private readonly http: HttpClient) {}

  list(filters: { status?: DemoNews["status"]; teamId?: string } = {}) {
    return this.http.request<NewsListItem[]>("news/", {
      query: { status: filters.status, team_id: filters.teamId },
    });
  }

  get(id: string, trackNavigation = false) {
    return this.http.request<DemoNews>(`news/${id}/`, {
      headers: trackNavigation && import.meta.client ? navigationHeaders() : undefined,
    });
  }

  private payload(input: SaveNewsInput, includeTeam: boolean) {
    const file = import.meta.client && input.cover_image ? dataUrlFile(input.cover_image) : null;
    if (!file)
      return {
        title: input.title,
        ...(includeTeam ? { team_id: input.team_id } : {}),
        content: input.content,
        ...(input.cover_image === null ? { cover_image: null } : {}),
      };
    const body = new FormData();
    body.append("title", input.title);
    if (includeTeam && input.team_id) body.append("team_id", input.team_id);
    body.append("content", JSON.stringify(input.content));
    body.append("cover_image", file);
    return body;
  }

  async create(input: SaveNewsInput) {
    const result = await this.http.request<{ id: string }>("news/", {
      method: "POST",
      body: this.payload(input, true),
    });
    return result.id;
  }

  update(id: string, input: SaveNewsInput) {
    return this.http.request<void>(`news/${id}/`, {
      method: "PATCH",
      body: this.payload(input, false),
    });
  }

  publish(id: string) {
    return this.http.request<void>(`news/${id}/publish/`, { method: "POST" });
  }
  schedule(id: string, scheduledAt: string) {
    return this.http.request<void>(`news/${id}/schedule/`, {
      method: "POST",
      body: { scheduled_at: scheduledAt },
    });
  }
  unschedule(id: string) {
    return this.http.request<void>(`news/${id}/unschedule/`, {
      method: "POST",
    });
  }
  delete(id: string) {
    return this.http.request<void>(`news/${id}/`, { method: "DELETE" });
  }
}
