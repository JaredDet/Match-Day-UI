// Prototype contract: y is a percentage of the displayed pitch, top (0) to bottom (100).
// Coordinates belong to individual players, keyed by shirt number; neither side mirrors y.
const numbers = [1, 2, 4, 5, 3, 6, 8, 10, 7, 9, 11];
const profiles: Record<string, number[]> = {
  "4-3-3": [50, 15, 39, 61, 85, 29, 50, 71, 18, 50, 82],
  "3-5-2": [50, 28, 50, 72, 12, 34, 50, 66, 88, 36, 64],
  "4-2-3-1": [50, 16, 39, 61, 84, 37, 63, 18, 50, 82, 50],
  "4-4-2": [50, 16, 39, 61, 84, 18, 40, 60, 82, 36, 64],
  "4-1-4-1": [50, 15, 39, 61, 85, 50, 16, 39, 61, 84, 50],
  "3-4-3": [50, 28, 50, 72, 15, 39, 61, 85, 20, 50, 80],
  "3-4-2-1": [50, 28, 50, 72, 15, 39, 61, 85, 35, 65, 50],
  "5-3-2-closed": [50, 18, 36, 50, 64, 82, 34, 50, 66, 40, 60],
  "5-3-2-open": [50, 12, 32, 50, 68, 88, 22, 50, 78, 28, 72],
};
export function demoPositions(formation: string, variant?: "open" | "closed") {
  const profile =
    profiles[formation === "5-3-2" ? `${formation}-${variant || "closed"}` : formation];
  if (!profile) throw new Error(`Missing demo formation: ${formation}`);
  return numbers.map((number, index) => ({ number, y: profile[index]! }));
}

export type FormationPosition = { slot: number; x: number; y: number };

export function formationPositions(formation: string): FormationPosition[] {
  const lines = [1, ...formation.split("-").map(Number)];
  return lines.flatMap((count, line) =>
    Array.from({ length: count }, (_, index) => ({
      slot: lines.slice(0, line).reduce((total, value) => total + value, 0) + index + 1,
      x: 6 + Math.round((line * 38) / Math.max(lines.length - 1, 1)),
      y: Math.round(((index + 1) * 100) / (count + 1)),
    })),
  );
}
