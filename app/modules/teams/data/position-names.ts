import type { Position } from "~/modules/teams/types/teams";

export const positionNames: Record<Position, string> = {
  goalkeeper: "Portero",
  right_back: "Lateral derecho",
  center_back: "Defensa central",
  left_back: "Lateral izquierdo",
  sweeper: "Líbero",
  right_wing_back: "Carrilero derecho",
  left_wing_back: "Carrilero izquierdo",
  defensive_midfielder: "Mediocentro defensivo",
  central_midfielder: "Mediocentro",
  attacking_midfielder: "Mediapunta",
  right_midfielder: "Volante derecho",
  left_midfielder: "Volante izquierdo",
  right_winger: "Extremo derecho",
  left_winger: "Extremo izquierdo",
  second_striker: "Segundo delantero",
  center_forward: "Delantero centro",
};

export const positionCodes: Record<Position, string> = {
  goalkeeper: "POR",
  right_back: "LD",
  center_back: "DFC",
  left_back: "LI",
  sweeper: "LIB",
  right_wing_back: "CAD",
  left_wing_back: "CAI",
  defensive_midfielder: "MCD",
  central_midfielder: "MC",
  attacking_midfielder: "MP",
  right_midfielder: "MD",
  left_midfielder: "MI",
  right_winger: "ED",
  left_winger: "EI",
  second_striker: "SD",
  center_forward: "DC",
};
