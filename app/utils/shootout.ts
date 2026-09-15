export type ShootoutKick = { side: 0 | 1; player: string; outcome: 'scored' | 'missed'; sequence: number }
export type Shootout = { status: 'in_progress' | 'finished'; nextSide: 0 | 1 | null; kicks: ShootoutKick[] }
export function shootoutRows(shootout: Shootout) {
  const sides = [0, 1].map(side => shootout.kicks.filter(kick => kick.side === side).sort((a, b) => a.sequence - b.sequence))
  const nextCount = shootout.nextSide === null ? 0 : sides[shootout.nextSide]!.length + 1
  const rounds = Math.max(5, ...sides.map(side => side.length), shootout.status === 'in_progress' ? nextCount : 0)
  return sides.map((kicks, side) => ({
    score: kicks.filter(kick => kick.outcome === 'scored').length,
    cells: Array.from({ length: rounds }, (_, index) => ({
      kick: kicks[index],
      state: kicks[index]?.outcome ?? (shootout.status === 'finished' ? 'unused' : 'pending'),
      next: shootout.status === 'in_progress' && shootout.nextSide === side && index === kicks.length,
    })),
  }))
}
export function demoShootout(finished: boolean): Shootout {
  const shots: [0 | 1, string, 'scored' | 'missed'][] = [
    [0, 'M. Torres', 'scored'], [1, 'D. Silva', 'scored'],
    [0, 'J. Rojas', 'scored'], [1, 'L. Núñez', 'missed'],
    [0, 'P. Vidal', 'scored'], [1, 'F. Muñoz', 'scored'],
  ]
  if (finished) shots.push([0, 'B. Castro', 'missed'], [1, 'H. Campos', 'scored'], [0, 'A. Fuentes', 'scored'], [1, 'M. Vera', 'missed'])
  return { status: finished ? 'finished' : 'in_progress', nextSide: finished ? null : 0, kicks: shots.map(([side, player, outcome], index) => ({ side, player, outcome, sequence: index + 1 })) }
}
