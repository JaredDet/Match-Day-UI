import { useRepositories } from "~/core/api/repository-context";

export function useMatches() {
  const repository = useRepositories().matches;
  const today = useState("today", () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" }),
  );
  const query = useAsyncData("matches", () => repository.list(), { default: () => [] });
  return {
    today,
    matches: query.data,
    pending: query.pending,
    error: query.error,
    refresh: query.refresh,
  };
}
