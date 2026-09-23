export const tournaments = [
  {
    id: "demo-cup",
    slug: "copa-matchday",
    name: "Copa Matchday",
    country: "Chile",
    category: "Copa nacional",
    logo: null,
    max_teams_per_group: 4,
  },
];
export const seasons = [
  { id: "season-2027", name: "2027", tournament: "demo-cup", has_data: false },
  { id: "season-2026", name: "2026", tournament: "demo-cup", has_data: true },
  { id: "season-2025", name: "2025", tournament: "demo-cup", has_data: false },
];
export const phases = [
  {
    id: "groups",
    name: "Fase de grupos",
    kind: "groups",
    order: 0,
    status: "finished",
    qualifying_teams: 2,
    matchdays: 6,
    generated: false,
  },
  {
    id: "round-16",
    name: "Octavos de final",
    kind: "knockout",
    order: 1,
    status: "finished",
    generated: true,
  },
  {
    id: "round-8",
    name: "Cuartos de final",
    kind: "knockout",
    order: 2,
    status: "finished",
    generated: true,
  },
  {
    id: "round-4",
    name: "Semifinales",
    kind: "knockout",
    order: 3,
    status: "finished",
    generated: true,
  },
  {
    id: "round-2",
    name: "Final",
    kind: "knockout",
    order: 4,
    status: "scheduled",
    generated: true,
  },
  {
    id: "third",
    name: "Tercer puesto",
    kind: "third_place",
    order: 5,
    status: "scheduled",
    generated: true,
  },
];
