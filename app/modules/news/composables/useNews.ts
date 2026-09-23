import { useRepositories } from "~/core/api/repository-context";

export function useNews(status?: "DRAFT" | "SCHEDULED" | "PUBLISHED") {
  const repository = useRepositories().news;
  const key = status ? `news-${status.toLowerCase()}` : "news-all";
  const query = useAsyncData(key, () => repository.list(status ? { status } : undefined), {
    default: () => [],
  });
  return {
    items: query.data,
    pending: query.pending,
    error: query.error,
    refresh: query.refresh,
  };
}
