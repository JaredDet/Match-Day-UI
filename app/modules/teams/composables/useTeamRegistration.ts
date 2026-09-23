import { useTeamRegistrationDraft } from "~/modules/teams/composables/useTeamRegistrationDraft";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { useRepositories } from "~/core/api/repository-context";
import { RegisterTeamUseCase } from "~/modules/teams/application/register-team-use-case";

export function useTeamRegistration() {
  const { teams, refresh } = useTeams();
  const registerTeam = new RegisterTeamUseCase(useRepositories().teams);
  const draft = useTeamRegistrationDraft();
  const name = ref("");
  const coach = ref("");
  const crest = ref<string | null>(null);
  const city = ref("");
  const stadium = ref("");
  const foundedYear = ref<number | null>(null);
  const players = ref([
    { name: "", preferred_position: "", preferred_shirt_number: null as number | null },
  ]);
  const error = ref("");
  function validate(step = 1) {
    error.value = "";
    if (!name.value.trim()) {
      error.value = "Completa el nombre del equipo.";
      return false;
    }
    if (!coach.value.trim()) {
      error.value = "Completa el nombre del director técnico.";
      return false;
    }
    if (
      foundedYear.value !== null &&
      (!Number.isInteger(foundedYear.value) ||
        foundedYear.value < 1800 ||
        foundedYear.value > new Date().getFullYear())
    ) {
      error.value = "Indica un año de fundación válido.";
      return false;
    }
    if (
      teams.value.some(
        (team) => team.name.toLocaleLowerCase("es") === name.value.trim().toLocaleLowerCase("es"),
      )
    ) {
      error.value = "Ya existe un equipo con ese nombre.";
      return false;
    }
    if (step === 0) return true;
    const numbers = players.value.map((p) => p.preferred_shirt_number).filter((n) => n !== null);
    if (players.value.some((p) => !p.name.trim())) {
      error.value = "Completa el nombre de cada jugador.";
      return false;
    }
    if (numbers.some((n) => !Number.isInteger(n) || n < 1 || n > 99)) {
      error.value = "Los dorsales deben ser enteros entre 1 y 99.";
      return false;
    }
    if (new Set(numbers).size !== numbers.length) {
      error.value = "No se puede repetir un dorsal en el mismo equipo.";
      return false;
    }
    const names = players.value.map((p) => p.name.trim().toLocaleLowerCase("es"));
    if (new Set(names).size !== names.length) {
      error.value = "No se puede repetir un jugador en la plantilla.";
      return false;
    }
    return true;
  }

  async function submit() {
    if (!validate()) return;
    draft.value = {
      name: name.value.trim(),
      head_coach_name: coach.value.trim(),
      crest: crest.value,
      city: city.value.trim(),
      stadium_name: stadium.value.trim(),
      founded_year: foundedYear.value,
      players: players.value.map((p) => ({ ...p, name: p.name.trim() })),
    };
    try {
      const teamId = await registerTeam.execute(draft.value);
      await refresh();
      return teamId;
    } catch (exception) {
      error.value = (exception as Error).message;
      throw exception;
    }
  }

  return {
    name,
    coach,
    crest,
    city,
    stadium,
    foundedYear,
    players,
    error,
    validate,
    submit,
  };
}
