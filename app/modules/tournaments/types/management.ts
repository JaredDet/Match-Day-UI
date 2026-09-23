export interface DemoGroup {
  id: string;
  name: string;
  teams: string[];
  manualOrder: string[];
}
export interface DemoPhase {
  id: string;
  season: string;
  name: string;
  kind: "groups" | "knockout" | "third_place";
  status: "scheduled" | "active" | "finished";
  generated: boolean;
  qualifying: number;
  matchdays: number;
  groups: DemoGroup[];
  fixtures: { id?: string; match: string; group?: string; matchday: number }[];
  source?: string;
  scheduled_at?: string;
  interval?: number;
}
