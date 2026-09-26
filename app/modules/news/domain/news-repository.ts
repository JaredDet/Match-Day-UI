import type { DemoNews } from "~/modules/news/data/news";

export interface NewsListItem extends Omit<DemoNews, "content"> {
  preview: string;
}

export interface SaveNewsInput {
  title: string;
  preview: string;
  team_id: string | null;
  cover_image: string | null;
  content: { children: string[] };
}

export interface NewsRepository {
  list(filters?: { status?: DemoNews["status"]; teamId?: string }): Promise<NewsListItem[]>;
  get(id: string, trackNavigation?: boolean): Promise<DemoNews>;
  create(input: SaveNewsInput): Promise<string>;
  update(id: string, input: SaveNewsInput): Promise<void>;
  publish(id: string): Promise<void>;
  schedule(id: string, scheduledAt: string): Promise<void>;
  unschedule(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
