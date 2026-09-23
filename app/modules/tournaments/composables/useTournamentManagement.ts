import { tournaments as seedTournaments, seasons as seedSeasons } from '~/modules/tournaments/data/tournaments'
import { useDemoRegistrations } from '~/modules/tournaments/composables/useDemoRegistrations'
import { useDemoTeams } from '~/modules/teams/composables/useDemoTeams'
import { useMatchOperations } from '~/modules/matches/composables/useMatchOperations'
import { groupStandings, matchWinner } from '~/modules/tournaments/utils/standings'
import type { DemoPhase } from '~/modules/tournaments/types/management'
export function useTournamentManagement() {
  const tournaments = useState('demo-tournaments', () => seedTournaments.map(t => ({ ...t })))
  const seasons = useState('demo-seasons', () => seedSeasons.map(s => ({ ...s })))
  const phases = useState<DemoPhase[]>('demo-competition-phases', () => [])
  const registrations = useDemoRegistrations(), { teams } = useDemoTeams(), ops = useMatchOperations()
  const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`
  const locked = (season: string) => season === 'season-2026' || phases.value.some(p => p.season === season && p.generated)
  function phase(id: string) { const p = phases.value.find(p => p.id === id); if (!p) throw new Error('Fase no encontrada.'); return p }
  function mutable(p: DemoPhase) { if (locked(p.season) || p.status !== 'scheduled' || p.fixtures.some(f => ops.matches.value.find(m => m.id === f.match)?.status !== 'scheduled')) throw new Error('La estructura está bloqueada: hay partidos iniciados o eliminatorias generadas.') }
  function createTournament(name: string, cap = 4) {
    if (!name.trim() || tournaments.value.some(t => t.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'))) throw new Error('Indica un nombre de torneo único.')
    if (!Number.isInteger(cap) || cap < 1 || cap > 32767) throw new Error('La capacidad debe ser un entero entre 1 y 32767.')
    const key = id('tournament'); tournaments.value.push({ id:key, slug:key, name:name.trim(), country:'Chile', category:'Torneo', max_teams_per_group:cap }); return key
  }
  function configure(tournamentId: string, name: string, cap: number) {
    const t = tournaments.value.find(t => t.id === tournamentId)
    if (!t || !name.trim() || !Number.isInteger(cap) || cap < 1 || cap > 32767) throw new Error('Revisa el nombre y la capacidad del torneo.')
    if (tournaments.value.some(other => other.id !== t.id && other.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'))) throw new Error('Ya existe ese nombre de torneo.')
    const editions = seasons.value.filter(s => s.tournament === t.id).map(s => s.id)
    if ((editions.includes('season-2026') && cap < 4) || phases.value.some(p => editions.includes(p.season) && p.groups.some(g => g.teams.length > cap))) throw new Error('La capacidad no puede ser menor que un grupo existente.')
    t.name = name.trim(); t.max_teams_per_group = cap
  }
  function createSeason(tournament: string, name: string) {
    if (!tournaments.value.some(t => t.id === tournament) || !name.trim() || seasons.value.some(s => s.tournament === tournament && s.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'))) throw new Error('Indica una temporada nueva para el torneo.')
    const key = id('season'); seasons.value.unshift({ id:key, name:name.trim(), tournament, has_data:false }); registrations.value[key] = []; return key
  }
  function enroll(season: string, team: string) {
    if (locked(season)) throw new Error('La temporada tiene eliminatorias generadas; las inscripciones están cerradas.')
    if (!seasons.value.some(s => s.id === season) || !teams.value.some(t => t.id === team)) throw new Error('Selecciona temporada y equipo válidos.')
    const current = registrations.value[season] ?? []
    if (current.includes(team)) throw new Error('El equipo ya está inscrito.')
    registrations.value[season] = [...current,team]
  }
  function withdraw(season: string, team: string) {
    if (locked(season) || phases.value.some(p => p.season === season && (p.groups.some(g => g.teams.includes(team)) || p.fixtures.some(f => { const m = ops.matches.value.find(m => m.id === f.match); return m && [m.home_team.id,m.away_team.id].includes(team) })))) throw new Error('Retira sus asignaciones primero. Una temporada con eliminatorias generadas no permite bajas.')
    registrations.value[season] = (registrations.value[season] ?? []).filter(t => t !== team)
  }
  function createPhase(season: string, name: string, qualifying: number, matchdays: number) {
    if (!seasons.value.some(s => s.id === season) || locked(season) || !name.trim() || !Number.isInteger(qualifying) || qualifying < 1 || !Number.isInteger(matchdays) || matchdays < 1) throw new Error('Revisa la temporada, nombre, clasificados y jornadas.')
    const key = id('phase'); phases.value.push({ id:key, season, name:name.trim(), kind:'groups', status:'scheduled', generated:false, qualifying, matchdays, groups:[], fixtures:[] }); return key
  }
  function addGroup(phaseId: string, name: string) { const p = phase(phaseId); mutable(p); if (!name.trim() || p.groups.some(g => g.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'))) throw new Error('Indica un nombre de grupo único en la fase.'); p.groups.push({ id:id('group'), name:name.trim(), teams:[], manualOrder:[] }) }
  function assign(phaseId: string, groupId: string, team: string) {
    const p = phase(phaseId); mutable(p); const g = p.groups.find(g => g.id === groupId), season = seasons.value.find(s => s.id === p.season)!, tournament = tournaments.value.find(t => t.id === season.tournament)!
    if (!g || !(registrations.value[p.season] ?? []).includes(team)) throw new Error('El equipo debe estar inscrito en esta temporada.')
    if (p.groups.some(g => g.teams.includes(team))) throw new Error('El equipo ya pertenece a un grupo de esta fase.')
    if (g.teams.length >= tournament.max_teams_per_group) throw new Error('El grupo está completo.')
    g.teams.push(team); g.manualOrder = []
  }
  function removeTeam(phaseId: string, groupId: string, team: string) { const p = phase(phaseId); mutable(p); const g = p.groups.find(g => g.id === groupId)!; if (p.fixtures.some(f => f.group === groupId && ops.matches.value.some(m => m.id === f.match && [m.home_team.id,m.away_team.id].includes(team)))) throw new Error('Desvincula primero sus partidos del grupo.'); g.teams = g.teams.filter(t => t !== team); g.manualOrder = [] }
  function removeGroup(phaseId: string, groupId: string) { const p = phase(phaseId); mutable(p); if (p.fixtures.some(f => f.group === groupId)) throw new Error('Desvincula primero los partidos del grupo.'); p.groups = p.groups.filter(g => g.id !== groupId) }
  function removePhase(phaseId: string) { const p = phase(phaseId); mutable(p); if (p.fixtures.length || p.groups.length) throw new Error('Elimina los grupos y desvincula sus partidos primero.'); phases.value = phases.value.filter(p => p.id !== phaseId) }
  function fixture(phaseId: string, groupId: string, matchId: string, matchday: number) {
    const p = phase(phaseId); mutable(p); const g = p.groups.find(g => g.id === groupId), m = ops.matches.value.find(m => m.id === matchId)
    if (!g || !m || ![m.home_team.id,m.away_team.id].every(id => g.teams.includes(id))) throw new Error('Ambos equipos del partido deben pertenecer al grupo.')
    if (phases.value.some(p => p.fixtures.some(f => f.match === matchId))) throw new Error('El partido ya está vinculado a una fase.')
    if (m.status !== 'scheduled' || !Number.isInteger(matchday) || matchday < 1 || matchday > p.matchdays) throw new Error('Selecciona un partido pendiente y una jornada válida.')
    p.fixtures.push({ match:matchId, group:groupId, matchday })
  }
  function unfixture(phaseId: string, matchId: string) { const p = phase(phaseId); mutable(p); p.fixtures = p.fixtures.filter(f => f.match !== matchId) }
  function standings(phaseId: string, groupId: string) { const p = phase(phaseId), g = p.groups.find(g => g.id === groupId)!; return groupStandings(g, ops.matches.value.filter(m => p.fixtures.some(f => f.group === groupId && f.match === m.id)), ops.operations.value) }
  function finishGroups(phaseId: string) { const p = phase(phaseId); if (locked(p.season) || !p.groups.length || p.groups.some(g => g.teams.length < p.qualifying || !p.fixtures.some(f => f.group === g.id)) || p.fixtures.some(f => ops.matches.value.find(m => m.id === f.match)?.status !== 'finished')) throw new Error('Cada grupo necesita suficientes equipos y partidos vinculados; todos los encuentros deben estar finalizados.'); p.status = 'finished' }
  function manualOrder(phaseId: string, groupId: string, order: string[]) { const p = phase(phaseId), g = p.groups.find(g => g.id === groupId)!; if (locked(p.season) || p.status !== 'finished' || order.length !== g.teams.length || new Set(order).size !== order.length || order.some(id => !g.teams.includes(id))) throw new Error('Finaliza la fase y ordena todos los equipos una sola vez antes de generar las eliminatorias.'); g.manualOrder = [...order] }
  function generate(season: string, entrants: string[], date: string, interval: number, third: boolean, source?: string) {
    if (locked(season)) throw new Error('La temporada ya tiene eliminatorias generadas.')
    if (source) {
      const p = phase(source); if (p.season !== season || p.status !== 'finished') throw new Error('Finaliza la fase de grupos antes de clasificar equipos.')
      const groups = [...p.groups].sort((a,b) => a.name.localeCompare(b.name))
      const tables = groups.map(g => standings(p.id,g.id))
      if (!groups.length || tables.some(rows => rows.slice(0,p.qualifying).some(row => row.tied))) throw new Error('Resuelve los empates de clasificación mediante el orden manual.')
      entrants = Array.from({ length:p.qualifying },(_, rank) => tables.map(rows => rows[rank]!.id)).flat()
    }
    const n = entrants.length
    if (n < 2 || n > 64 || (n & (n-1)) || new Set(entrants).size !== n || entrants.some(t => !(registrations.value[season] ?? []).includes(t))) throw new Error('Selecciona 2, 4, 8, 16, 32 o 64 equipos distintos inscritos en la temporada.')
    if (!Number.isFinite(Date.parse(date)) || !Number.isInteger(interval) || interval < 1 || interval > 365 || (third && n < 4)) throw new Error('Indica una fecha válida, intervalo de 1 a 365 días y al menos cuatro equipos para tercer puesto.')
    let previous = '', round = 0
    for (let size = n; size >= 2; size /= 2) {
      const key = id('round'), scheduled_at = new Date(Date.parse(date)+round*interval*86400000).toISOString()
      const p: DemoPhase = { id:key, season, name:size === 2 ? 'Final' : size === 4 ? 'Semifinales' : `Ronda de ${size}`, kind:'knockout', status:'scheduled', generated:true, qualifying:0, matchdays:1, groups:[], fixtures:[], source:previous || source, scheduled_at, interval }
      if (!previous) for (let index = 0; index < n/2; index++) p.fixtures.push({ match:ops.create(entrants[index]!,entrants[n-1-index]!,scheduled_at), matchday:1 })
      phases.value.push(p); previous = key; round++
    }
    if (third) { const semifinal = phases.value.find(p => p.season === season && p.name === 'Semifinales')!; phases.value.push({ id:id('third'), season, name:'Tercer puesto', kind:'third_place', status:'scheduled', generated:true, qualifying:0, matchdays:1, groups:[], fixtures:[], source:semifinal.id, scheduled_at:new Date(Date.parse(date)+(round-1)*interval*86400000).toISOString() }) }
  }
  function advance(season: string) {
    let created = 0
    for (const p of phases.value.filter(p => p.season === season && p.generated)) {
      if (p.fixtures.length && p.fixtures.every(f => matchWinner(ops.matches.value.find(m => m.id === f.match)))) p.status = 'finished'
      if (p.fixtures.length || !p.source) continue
      const previous = phases.value.find(source => source.id === p.source)
      if (!previous || previous.kind === 'groups' || previous.status !== 'finished') continue
      const matches = previous.fixtures.map(f => ops.matches.value.find(m => m.id === f.match)!)
      const entrants = matches.map(m => p.kind === 'third_place' ? (m.home_team.id === matchWinner(m) ? m.away_team.id : m.home_team.id) : matchWinner(m)!)
      for (let i = 0; i < entrants.length; i += 2) { p.fixtures.push({ match:ops.create(entrants[i]!,entrants[i+1]!,p.scheduled_at!), matchday:1 }); created++ }
    }
    return created
  }
  return { tournaments, seasons, phases, registrations, matches:ops.matches, locked, createTournament, configure, createSeason, enroll, withdraw, createPhase, addGroup, assign, removeTeam, removeGroup, removePhase, fixture, unfixture, standings, finishGroups, manualOrder, generate, advance }
}
