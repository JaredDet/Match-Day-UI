import { demoShootout } from '../utils/shootout'
import { demoPositions } from './formations'
import type { Match, Goal, Period } from '../utils/matches'
export function createDemoMatches(today: string): Match[] {
  const names = ['Atlético Santiago', 'Deportivo Norte', 'Unión del Sur', 'Sporting Central']
  return Array.from({ length: 6 }, (_, i): Match => {
    const status = i < 3 ? 'live' : i === 5 ? 'finished' : 'scheduled'
    const period: Period | null = i === 0 ? 'second_half' : i === 1 ? 'halftime' : i === 2 ? 'extra_time_second_half' : i === 5 ? 'extra_time_second_half' : null
    const minute = [90, 45, 120, null, null, 120][i] ?? null
    const homeGoals: Goal[] = status === 'scheduled' ? [] : [
      { player_name: 'M. Torres', assist_player_name: 'P. Vidal', goal_type: 'regular', minute: 23 },
      ...(i === 1 ? [] : [{ player_name: 'J. Rojas', goal_type: 'penalty' as const, minute: 45, added_minute: 2 }]),
    ]
    const awayGoals: Goal[] = status === 'scheduled' ? [] : [
      { player_name: 'D. Silva', assist_player_name: 'F. Muñoz', goal_type: 'regular', minute: 18 },
      ...(i === 2 || i === 5 ? [{ player_name: 'R. Pérez', goal_type: 'own_goal' as const, minute: 83 }] : []),
    ]
    const homeFormation = ['4-3-3', '3-5-2', '4-2-3-1', '4-4-2', '3-4-3', '5-3-2'][i]!
    const awayFormation = ['4-2-3-1', '4-4-2', '5-3-2', '4-1-4-1', '3-4-2-1', '5-3-2'][i]!
    return {
      id: `demo-${i}`, status, shootout: i === 2 || i === 5 ? demoShootout(i === 5) : undefined, scheduled_at: `${today}T${[16, 17, 15, 20, 21, 12][i]}:00:00-03:00`,
      current_period: period, current_minute: minute, current_added_minute: i === 0 ? 3 : 0,
      clock: { period, status: status === 'scheduled' ? 'not_started' : i === 1 || i === 2 || i === 5 ? 'closed' : i === 0 ? 'regulation_time_reached' : 'running', minute, second: i === 0 ? 24 : 0, added_minute: i === 0 ? 3 : 0, announced_added_minutes: i === 0 ? 5 : 0 },
      home_team: { id: String(i % 4), name: names[i % 4]!, team_side: 'home', score: homeGoals.length, formation: homeFormation, formation_variant: homeFormation === '5-3-2' ? 'closed' : undefined, positions: demoPositions(homeFormation, 'closed'), goals: homeGoals, ...(i === 5 ? { penalty_score: 4 } : i === 2 ? { penalty_score: 3 } : {}) },
      away_team: { id: String((i + 1) % 4), name: names[(i + 1) % 4]!, team_side: 'away', score: awayGoals.length, formation: awayFormation, formation_variant: awayFormation === '5-3-2' ? 'open' : undefined, positions: demoPositions(awayFormation, 'open'), goals: awayGoals, ...(i === 5 ? { penalty_score: 3 } : i === 2 ? { penalty_score: 2 } : {}) },
    }
  })
}
