import type { Match } from '~/modules/matches/utils/matches'
import type { DemoGroup } from '~/modules/tournaments/types/management'
import type { MatchOperation } from '~/modules/matches/types/operations'
export function groupStandings(group: DemoGroup, matches: Match[], operations: Record<string, MatchOperation>) {
  const finished = matches.filter(m => m.status === 'finished')
  const rows = group.teams.map(id => {
    const row = { id, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0, discipline:0, headPoints:0, headDifference:0, headGoals:0, tied:false }
    for (const match of finished.filter(m => [m.home_team.id,m.away_team.id].includes(id))) {
      const side = match.home_team.id === id ? 'home' : 'away', own = match[`${side}_team`], other = side === 'home' ? match.away_team : match.home_team
      row.played++; row.gf += own.score; row.ga += other.score
      if (own.score > other.score) { row.wins++; row.points += 3 } else if (own.score === other.score) { row.draws++; row.points++ } else row.losses++
      row.discipline += (operations[match.id]?.events ?? []).filter(e => !e.cancelled && e.side === side).reduce((sum,e) => sum + (e.kind === 'yellow_card' ? 1 : e.kind === 'red_card' ? 3 : 0),0)
    }
    return row
  })
  const major = (r: typeof rows[number]) => `${r.points}:${r.gf-r.ga}:${r.gf}`
  for (const row of rows) {
    const peers = rows.filter(other => major(other) === major(row)).map(r => r.id)
    for (const m of finished.filter(m => peers.includes(m.home_team.id) && peers.includes(m.away_team.id) && [m.home_team.id,m.away_team.id].includes(row.id))) {
      const own = m.home_team.id === row.id ? m.home_team : m.away_team, other = m.home_team.id === row.id ? m.away_team : m.home_team
      row.headPoints += own.score > other.score ? 3 : own.score === other.score ? 1 : 0; row.headDifference += own.score-other.score; row.headGoals += own.score
    }
  }
  const compare = (a: typeof rows[number], b: typeof rows[number]) => b.points-a.points || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || b.headPoints-a.headPoints || b.headDifference-a.headDifference || b.headGoals-a.headGoals || b.wins-a.wins || a.discipline-b.discipline
  rows.sort((a,b) => compare(a,b) || (group.manualOrder.length === rows.length ? group.manualOrder.indexOf(a.id)-group.manualOrder.indexOf(b.id) : 0))
  rows.forEach(row => { row.tied = group.manualOrder.length !== rows.length && rows.some(other => other.id !== row.id && compare(row,other) === 0) })
  return rows
}
export function matchWinner(match?: Match) {
  if (!match || match.status !== 'finished') return null
  if (match.home_team.score !== match.away_team.score) return match.home_team.score > match.away_team.score ? match.home_team.id : match.away_team.id
  if (match.shootout?.status !== 'finished' || match.home_team.penalty_score === match.away_team.penalty_score) return null
  return (match.home_team.penalty_score ?? 0) > (match.away_team.penalty_score ?? 0) ? match.home_team.id : match.away_team.id
}
