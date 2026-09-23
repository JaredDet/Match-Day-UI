import { teams as initialTeams } from '~/modules/teams/data/teams'
import type { TeamPlayer } from '~/modules/teams/types/teams'
import type { TeamRegistrationDraft } from '~/modules/teams/types/registration'

export function useDemoTeams() {
  const teams = useState('demo-team-catalog', () => initialTeams.map(team => ({ ...team })))
  const rosters = useState<Record<string, TeamPlayer[]>>('demo-team-rosters', () => ({}))
  function create(draft: TeamRegistrationDraft) {
    if (teams.value.some(team => team.name.trim().toLocaleLowerCase('es') === draft.name.trim().toLocaleLowerCase('es'))) throw new Error('Ya existe un equipo con ese nombre.')
    if (!draft.head_coach_name.trim()) throw new Error('El director técnico es obligatorio.')
    const id = `team-${crypto.randomUUID()}`
    teams.value.push({ id, name: draft.name.trim(), coach: draft.head_coach_name, city: '', stadium: '', founded: new Date().getFullYear() })
    rosters.value[id] = draft.players.map((player, index) => ({ ...player, id: `${id}-${index}`, preferred_position: (player.preferred_position || null) as TeamPlayer['preferred_position'], is_captain: false }))
    return id
  }
  function update(id: string, name: string, coach: string) {
    const team = teams.value.find(team => team.id === id)
    if (!team) throw new Error('Equipo no encontrado.')
    if (!name.trim() || !coach.trim()) throw new Error('Nombre y director técnico son obligatorios.')
    if (teams.value.some(item => item.id !== id && item.name.trim().toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'))) throw new Error('Ya existe un equipo con ese nombre.')
    team.name = name.trim(); team.coach = coach.trim()
  }
  function replaceRoster(teamId: string, players: TeamPlayer[]) { rosters.value[teamId] = players.map(player => ({ ...player })) }
  function savePlayer(teamId: string, draft: Omit<TeamPlayer, 'id' | 'is_captain'>, playerId?: string) {
    const roster = rosters.value[teamId] ?? []
    if (!draft.name.trim()) throw new Error('El nombre del jugador es obligatorio.')
    if (roster.some(player => player.id !== playerId && player.name.trim().toLocaleLowerCase('es') === draft.name.trim().toLocaleLowerCase('es'))) throw new Error('Ese jugador ya está en la plantilla.')
    if (draft.preferred_shirt_number != null && roster.some(player => player.id !== playerId && player.preferred_shirt_number === draft.preferred_shirt_number)) throw new Error('Ese dorsal ya está ocupado.')
    const existing = roster.find(player => player.id === playerId)
    if (existing) Object.assign(existing, draft, { name: draft.name.trim() })
    else roster.push({ ...draft, name: draft.name.trim(), id: `${teamId}-${crypto.randomUUID()}`, is_captain: false })
    rosters.value[teamId] = roster
  }
  function setCaptain(teamId: string, playerId: string) {
    const roster = rosters.value[teamId] ?? []
    if (!roster.some(player => player.id === playerId)) throw new Error('Selecciona un jugador de la plantilla.')
    roster.forEach(player => { player.is_captain = player.id === playerId })
  }
  return { teams, rosters, create, update, replaceRoster, savePlayer, setCaptain, teamById: (id: string) => teams.value.find(team => team.id === id) }
}
