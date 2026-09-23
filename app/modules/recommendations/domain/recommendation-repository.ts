export type RecommendationKind = "team" | "player" | "news" | "match" | "tournament";

export interface RecommendationItemDto {
  kind: RecommendationKind;
  id: string;
  title: string;
  endpoint: string;
  preview: string;
  score: number;
  reason:
    | "similar_visitors"
    | "team_interest"
    | "tournament_interest"
    | "recent_content"
    | "live_match"
    | "discovery";
}

export interface RecommendationResponse {
  personalized: boolean;
  generated_at: string | null;
  expires_at: string | null;
  news: RecommendationItemDto[];
  matches: RecommendationItemDto[];
  tournaments: RecommendationItemDto[];
  discovery: RecommendationItemDto[];
}

export interface HeartbeatInput {
  navigation_id: string;
  content_kind: RecommendationKind;
  content_id: string;
  active_seconds: number;
}

export interface RecommendationRepository {
  get(): Promise<RecommendationResponse>;
  visit(kind: RecommendationKind, identifier: string, navigationId: string): Promise<string>;
  heartbeat(input: HeartbeatInput, beacon?: boolean): Promise<void>;
  clear(): Promise<void>;
}
