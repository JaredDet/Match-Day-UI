import { useDemoMatches } from '~/modules/matches/composables/useDemoMatches'
import { useDemoTeams } from '~/modules/teams/composables/useDemoTeams'
import { useTeamProfiles } from '~/modules/teams/composables/useTeamProfiles'
import type { Match, Period, Team } from '~/modules/matches/utils/matches'
import type { MatchOperation, Side, EventKind } from '~/modules/matches/types/operations'
export function useMatchOperations() {
  const { matches } = useDemoMatches(), { teamById } = useDemoTeams(), profiles = useTeamProfiles()
  const operations = useState<Record<string, MatchOperation>>('demo-match-operations', () => ({}))
  const get = (id: string) => { const m = matches.value.find(m => m.id === id); if (!m) throw new Error('Partido no encontrado.'); return m }
  const roster = (teamId: string) => profiles.value.details.find(team => team.id === teamId)?.players ?? []
  function create(home: string, away: string, date: string) {
    if (!teamById(home) || !teamById(away) || home === away) throw new Error('Selecciona dos equipos distintos.')
    if (!Number.isFinite(Date.parse(date))) throw new Error('Selecciona una fecha válida.')
    const id = `match-${crypto.randomUUID()}`
    const makeTeam = (teamId: string, side: Side): Team => ({ id: teamId, name: teamById(teamId)!.name, team_side: side, score: 0, formation: null, positions: [], goals: [] })
    matches.value.push({ id, status: 'scheduled', scheduled_at: new Date(date).toISOString(), current_period: null, current_minute: null, current_added_minute: 0, clock: { period: null, status: 'not_started', minute: null, second: 0, added_minute: 0, announced_added_minutes: 0 }, home_team: makeTeam(home, 'home'), away_team: makeTeam(away, 'away') })
    operations.value[id] = { lineups: { home: [], away: [] }, events: [] }
    return id
  }
  function prepare(id: string) {
    const match = get(id)
    if (!operations.value[id]) { if (match.status !== 'scheduled') throw new Error('Los partidos históricos de ejemplo son de solo consulta. Crea un partido para operarlo.'); operations.value[id] = { lineups: { home: [], away: [] }, events: [] } }
    return operations.value[id]!
  }
  function reschedule(id: string, date: string) { const m = get(id); if (m.status !== 'scheduled' || !Number.isFinite(Date.parse(date))) throw new Error('Solo se puede reprogramar un partido pendiente con una fecha válida.'); m.scheduled_at = new Date(date).toISOString() }
  function lineup(id: string, side: Side, players: string[]) {
    const m = get(id), state = prepare(id)
    if (m.status !== 'scheduled') throw new Error('La alineación queda bloqueada al comenzar.')
    if (players.length !== 11 || new Set(players).size !== 11 || players.some(p => !roster(m[`${side}_team`].id).some(player => player.id === p))) throw new Error('Selecciona once titulares distintos de la plantilla.')
    state.lineups[side] = [...players]
  }
  function activePlayers(id: string, side: Side) {
    const state = operations.value[id]; if (!state) return []
    const active = new Set(state.lineups[side])
    const yellows: Record<string, number> = {}
    for (const e of state.events.filter(e => !e.cancelled && e.side === side)) {
      if (e.kind === 'substitution') { active.delete(e.player); active.add(e.replacement!) }
      if (e.kind === 'yellow_card') { yellows[e.player] = (yellows[e.player] ?? 0) + 1; if (yellows[e.player] >= 2) active.delete(e.player) }
      if (e.kind === 'red_card') active.delete(e.player)
    }
    return [...active]
  }
  function period(id: string, action: 'next' | 'extra' | 'finish', minute?: number) {
    const m = get(id), state = prepare(id)
    if (m.status === 'finished' || m.shootout) throw new Error('El partido ya no permite cambiar periodos.')
    if (action === 'finish') {
      if (!['second_half','extra_time_second_half'].includes(m.current_period ?? '') || m.clock.status !== 'closed') throw new Error('Cierra el último periodo antes de finalizar.')
      m.status = 'finished'; return
    }
    if (action === 'extra') {
      if (m.current_period !== 'second_half' || m.clock.status !== 'closed' || m.home_team.score !== m.away_team.score) throw new Error('La prórroga requiere el segundo tiempo cerrado y un empate.')
      m.current_period = 'extra_time_first_half'; m.current_minute = 90
    } else if (m.status === 'scheduled') {
      if (state.lineups.home.length !== 11 || state.lineups.away.length !== 11) throw new Error('Guarda once titulares por equipo antes de comenzar.')
      m.status = 'live'; m.current_period = 'first_half'; m.current_minute = 0
    } else {
      const next: Partial<Record<Period, [Period, number]>> = { first_half: ['halftime',45], halftime: ['second_half',45], extra_time_first_half: ['extra_time_halftime',105], extra_time_halftime: ['extra_time_second_half',105] }
      if (m.clock.status === 'running') {
        const end = ({ first_half:45, second_half:90, extra_time_first_half:105, extra_time_second_half:120 } as Record<string, number>)[m.current_period!]
        if (minute == null || !Number.isInteger(minute) || minute < end! || minute < (m.current_minute ?? 0)) throw new Error(`Indica el minuto de cierre, al menos ${end}.`)
        m.current_minute = minute; m.clock.minute = minute; m.clock.status = 'closed'; return
      }
      const transition = next[m.current_period!]; if (!transition) throw new Error('Finaliza el partido, inicia la prórroga o una tanda si hay empate.')
      ;[m.current_period, m.current_minute] = transition
    }
    m.clock.period = m.current_period; m.clock.minute = m.current_minute; m.clock.status = m.current_period?.includes('halftime') ? 'closed' : 'running'
  }
  function event(id: string, side: Side, kind: EventKind, player: string, minute: number, replacement?: string) {
    const m = get(id), state = prepare(id)
    if (m.status !== 'live' || m.clock.status !== 'running' || m.shootout) throw new Error('Los eventos requieren un periodo en juego.')
    const start = ({ first_half:0, second_half:45, extra_time_first_half:90, extra_time_second_half:105 } as Record<string, number>)[m.current_period!]!
    const end = ({ first_half:45, second_half:90, extra_time_first_half:105, extra_time_second_half:120 } as Record<string, number>)[m.current_period!]!
    if (!Number.isInteger(minute) || minute < Math.max(start, m.current_minute ?? 0) || minute > end + 30) throw new Error('El minuto debe corresponder al periodo y no retroceder respecto del último evento.')
    if (!activePlayers(id, side).includes(player)) throw new Error('Selecciona un jugador que esté en el campo.')
    if (kind === 'substitution') {
      const used = new Set([...state.lineups[side], ...state.events.filter(e => !e.cancelled && e.side === side && e.replacement).map(e => e.replacement!)])
      if (!replacement || used.has(replacement) || !roster(m[`${side}_team`].id).some(p => p.id === replacement)) throw new Error('Selecciona un suplente que no haya participado.')
      if (state.events.filter(e => !e.cancelled && e.side === side && e.kind === 'substitution').length >= 5) throw new Error('Se alcanzó el máximo de cinco sustituciones de esta demo.')
    }
    state.events.push({ id: crypto.randomUUID(), kind, side, player, replacement, minute, cancelled: false })
    m.current_minute = minute; m.clock.minute = minute; updateScore(id)
  }
  function updateScore(id: string) {
    const m = get(id), state = operations.value[id]!
    for (const side of ['home','away'] as const) {
      const goals = state.events.filter(e => !e.cancelled && ['goal','penalty_goal','own_goal'].includes(e.kind) && (e.kind === 'own_goal' ? e.side !== side : e.side === side))
      m[`${side}_team`].score = goals.length
      m[`${side}_team`].goals = goals.map(e => ({ player_name: roster(m[`${e.side}_team`].id).find(p => p.id === e.player)?.name ?? '', goal_type: e.kind === 'own_goal' ? 'own_goal' : e.kind === 'penalty_goal' ? 'penalty' : 'regular', minute: e.minute }))
    }
  }
  function cancel(id: string, eventId: string) {
    const m = get(id), state = prepare(id), e = state.events.find(e => e.id === eventId)
    if (m.status !== 'live' || m.shootout || !e || e.cancelled || e.kind === 'substitution') throw new Error('Solo se pueden anular goles o tarjetas antes de finalizar o iniciar una tanda.')
    e.cancelled = true; updateScore(id)
  }
  function shootout(id: string) {
    const m = get(id)
    if (m.status !== 'live' || m.shootout || m.clock.status !== 'closed' || !['second_half','extra_time_second_half'].includes(m.current_period ?? '') || m.home_team.score !== m.away_team.score) throw new Error('La tanda requiere un empate al cerrar el segundo tiempo o la prórroga.')
    m.shootout = { status:'in_progress', nextSide:0, kicks:[] }; m.home_team.penalty_score = 0; m.away_team.penalty_score = 0
  }
  function kick(id: string, player: string, scored: boolean) {
    const m = get(id), s = m.shootout
    if (!s || s.status === 'finished' || s.nextSide === null) throw new Error('No hay una tanda en curso.')
    const side = s.nextSide === 0 ? 'home' : 'away', eligible = activePlayers(id, side)
    if (!eligible.includes(player)) throw new Error('El lanzador debe estar en el campo.')
    const own = s.kicks.filter(k => k.side === s.nextSide), cycle = own.slice(Math.floor(own.length / eligible.length) * eligible.length)
    const name = roster(m[`${side}_team`].id).find(p => p.id === player)!.name
    if (cycle.some(k => k.player === name)) throw new Error('Deben lanzar todos los jugadores habilitados antes de repetir.')
    s.kicks.push({ side:s.nextSide, player:name, outcome:scored ? 'scored' : 'missed', sequence:s.kicks.length+1 })
    const shots = [0,1].map(side => s.kicks.filter(k => k.side === side)), scores = shots.map(shots => shots.filter(k => k.outcome === 'scored').length)
    m.home_team.penalty_score = scores[0]!; m.away_team.penalty_score = scores[1]!
    const decided = (shots[0]!.length <= 5 && shots[1]!.length <= 5) ? scores[0]! > scores[1]! + Math.max(0,5-shots[1]!.length) || scores[1]! > scores[0]! + Math.max(0,5-shots[0]!.length) : shots[0]!.length === shots[1]!.length && scores[0] !== scores[1]
    if (decided) { s.status = 'finished'; s.nextSide = null; m.status = 'finished' } else s.nextSide = s.nextSide === 0 ? 1 : 0
  }
  return { matches, operations, roster, create, prepare, reschedule, lineup, activePlayers, period, event, cancel, shootout, kick }
}
