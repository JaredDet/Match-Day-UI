import { useDemoTeams } from "~/modules/teams/composables/useDemoTeams"
import { useTeamRegistrationDraft } from "~/modules/teams/composables/useTeamRegistrationDraft"


export function useTeamRegistration() {
  const { teams, create } = useDemoTeams()
  const draft = useTeamRegistrationDraft()
  const name = ref('')
  const coach = ref('')
  const players = ref([{ name: '', preferred_position: '', preferred_shirt_number: null as number | null }])
  const error = ref('')
  function validate(step = 1) {
    error.value = ''
    if (!name.value.trim()) { error.value = 'Completa el nombre del equipo.'; return false }
    if (!coach.value.trim()) { error.value = 'Completa el nombre del director técnico.'; return false }
    if (teams.value.some(team => team.name.toLocaleLowerCase('es') === name.value.trim().toLocaleLowerCase('es'))) { error.value = 'Ya existe un equipo con ese nombre.'; return false }
    if (step === 0) return true
    const numbers = players.value.map(p => p.preferred_shirt_number).filter(n => n !== null)
    if (players.value.some(p => !p.name.trim())) { error.value = 'Completa el nombre de cada jugador.'; return false }
    if (numbers.some(n => !Number.isInteger(n) || n < 1 || n > 99)) { error.value = 'Los dorsales deben ser enteros entre 1 y 99.'; return false }
    if (new Set(numbers).size !== numbers.length) { error.value = 'No se puede repetir un dorsal en el mismo equipo.'; return false }
    const names = players.value.map(p => p.name.trim().toLocaleLowerCase('es'))
    if (new Set(names).size !== names.length) { error.value = 'No se puede repetir un jugador en la plantilla.'; return false }
    return true
  }

  function submit() {
    if (!validate()) return
    draft.value = { name: name.value.trim(), head_coach_name: coach.value.trim(), players: players.value.map(p => ({ ...p, name: p.name.trim() })) }
    create(draft.value)
    navigateTo('/teams/register/success')
  }

  return { name, coach, players, error, validate, submit }
}
