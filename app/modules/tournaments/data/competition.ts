import { teams } from '~/modules/teams/data/teams'

export const groups = [
  { name: 'A', rows: [ { id: '0', w: 4, d: 1, l: 1, gf: 10, ga: 4 }, { id: '2', w: 3, d: 2, l: 1, gf: 8, ga: 5 }, { id: '4', w: 2, d: 1, l: 3, gf: 6, ga: 8 }, { id: '6', w: 0, d: 2, l: 4, gf: 3, ga: 10 } ] },
  { name: 'B', rows: [ { id: '3', w: 4, d: 1, l: 1, gf: 11, ga: 5 }, { id: '1', w: 3, d: 1, l: 2, gf: 9, ga: 6 }, { id: '5', w: 2, d: 2, l: 2, gf: 7, ga: 8 }, { id: '7', w: 1, d: 0, l: 5, gf: 4, ga: 12 } ] },
]
for (let i = 2; i < 8; i++) {
  const stats = [[4,1,1,10,4],[3,2,1,8,5],[2,1,3,6,8],[0,2,4,3,10]]
  groups.push({ name: String.fromCharCode(65+i), rows: stats.map((row, j) => ({ id: String(i*4+j), w: row[0]!, d: row[1]!, l: row[2]!, gf: row[3]!, ga: row[4]! })) })
}
export type CupTie = { id: string; home: string; away: string; homeScore: number | null; awayScore: number | null; penalties?: [number, number] }
export function createBracket(size: number) {
  const entrants = size === 16 ? [0, 1].flatMap(rank => groups.map(group => group.rows[rank]!.id)) : teams.slice(0,size).map(team => team.id)
  const rounds: { name: string; ties: CupTie[] }[] = []
  let remaining = entrants.flatMap((_, index) => index < entrants.length / 2 ? [entrants[index]!, entrants[entrants.length - 1 - index]!] : [])
  let semifinalLosers: string[] = []
  while (remaining.length >= 2) {
    const count = remaining.length
    const ties: CupTie[] = []
    const winners: string[] = []
    for (let i=0; i<count; i+=2) {
      const home=remaining[i]!, away=remaining[i+1]!
      const homeWins = i % 4 === 0
      ties.push({ id: `${count}-${i}`, home, away, homeScore: count===2 ? null : homeWins ? 2 : 1, awayScore: count===2 ? null : homeWins ? 1 : 2 })
      winners.push(homeWins ? home : away)
      if (count===4) semifinalLosers.push(homeWins ? away : home)
    }
    rounds.push({ name: ({64:'32vos de final',32:'16vos de final',16:'Octavos de final',8:'Cuartos de final',4:'Semifinales',2:'Final'} as Record<number,string>)[count]!, ties })
    remaining=winners
  }
  return { rounds, third: { id: 'third', home: semifinalLosers[0]!, away: semifinalLosers[1]!, homeScore: null, awayScore: null } as CupTie }
}
