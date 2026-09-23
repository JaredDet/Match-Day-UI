import { groups } from "~/modules/tournaments/data/competition";

export function useDemoRegistrations() {
  return useState<Record<string, string[]>>('demo-season-teams', () => ({
    'season-2026': groups.flatMap(group => group.rows.map(row => row.id)),
    'season-2025': [],
  }))
}
