import { useTournamentManagement } from '~/modules/tournaments/composables/useTournamentManagement'
import { useDemoTeams } from '~/modules/teams/composables/useDemoTeams'
export function useTournamentRegistration() {
  const manager = useTournamentManagement(), { teams } = useDemoTeams(), route = useRoute()
  const seasonId = ref(manager.seasons.value.find(s => s.id === route.query.season)?.id ?? 'season-2027')
  const tournament = computed(() => manager.tournaments.value.find(t => t.id === manager.seasons.value.find(s => s.id === seasonId.value)?.tournament) ?? manager.tournaments.value[0]!)
  const seasons = manager.seasons
  const teamId = ref(''), message = ref(''), error = ref('')
  const enrolled = computed(() => manager.registrations.value[seasonId.value] ?? [])
  const locked = computed(() => manager.locked(seasonId.value))
  const available = computed(() => teams.value.filter(t => !enrolled.value.includes(t.id)))
  watch(seasonId, () => { teamId.value = ''; message.value = ''; error.value = '' })
  function register() {
    error.value = ''; message.value = ''
    try { manager.enroll(seasonId.value,teamId.value); message.value = `${teams.value.find(t => t.id === teamId.value)?.name} se inscribi\u00f3 en ${manager.seasons.value.find(s => s.id === seasonId.value)?.name}.`; teamId.value = '' }
    catch(e) { error.value = (e as Error).message }
  }
  return { tournament, seasons, seasonId, teamId, enrolled, locked, available, message, error, register }
}
