<script setup lang="ts">
import AppSelect from "~/components/AppSelect.vue";
import RegistrationSteps from "~/components/RegistrationSteps.vue";
import PageHeading from "~/components/PageHeading.vue";
import { useTournamentRegistration } from "~/modules/tournaments/composables/useTournamentRegistration";

const {
  tournament,
  seasons,
  seasonId,
  teamId,
  enrolled,
  locked,
  available,
  message,
  error,
  register,
} = useTournamentRegistration();
const step = ref(0);
useUnsavedChanges(computed(() => step.value > 0 || !!teamId.value));
const selectedTeam = computed(() =>
  available.value.find((team) => team.id === teamId.value),
);
function proceed() {
  error.value = "";
  if (locked.value) {
    error.value = "Las inscripciones de esta temporada están cerradas.";
    return;
  }
  if (step.value === 0) {
    step.value = 1;
    return;
  }
  if (!selectedTeam.value) {
    error.value = "Selecciona un equipo disponible.";
    return;
  }
  if (step.value === 1) {
    step.value = 2;
    return;
  }
  register();
  if (!error.value) step.value = 0;
}
function back() {
  error.value = "";
  step.value--;
}
useHead({ title: "Inscribir equipos · Matchday" });
</script>

<template>
  <main class="competition-page">
    <PageHeading
      title="Inscribir equipos"
      :kicker="tournament.name"
      description="Selecciona un equipo existente para incorporarlo a una temporada."
      :back-to="`/tournaments/${tournament.slug}?season=${seasonId}`"
      back-label="Volver al torneo"
    />
    <RegistrationSteps
      :labels="['Temporada', 'Equipo', 'Confirmar']"
      :current="step"
    />
    <Transition name="registration-step" mode="out-in"
      ><form :key="step" class="demo-form" @submit.prevent="proceed">
        <h2 aria-live="polite">
          {{
            [
              "Elige la temporada",
              "Selecciona un equipo",
              "Revisa la inscripción",
            ][step]
          }}
        </h2>
        <label v-if="step === 0"
          >Temporada<AppSelect v-model="seasonId"
            ><option
              v-for="season in seasons"
              :key="season.id"
              :value="season.id"
            >
              {{ season.name }} ·
              {{
                tournament.id === season.tournament
                  ? tournament.name
                  : "Otro torneo"
              }}
            </option></AppSelect
          ></label
        >
        <label v-if="step === 1"
          >Equipo<AppSelect v-model="teamId" required :disabled="locked"
            ><option value="" disabled>Selecciona un equipo</option>
            <option v-for="team in available" :key="team.id" :value="team.id">
              {{ team.name }}
            </option></AppSelect
          ></label
        >
        <p v-if="locked" role="status">
          Inscripciones cerradas: esta temporada ya tiene eliminatorias
          generadas.
        </p>
        <p>
          {{ enrolled.length }} equipos inscritos. Los equipos ya inscritos no
          aparecen en el selector.
        </p>
        <p>
          La inscripción pertenece a la temporada. La asignación a grupos es un
          paso independiente; cada grupo admite hasta
          {{ tournament.max_teams_per_group }} equipos.
        </p>
        <section v-if="step === 2" class="registration-review">
          <h3>{{ selectedTeam?.name }}</h3>
          <p>
            {{ tournament.name }} · Temporada
            {{ seasons.find((season) => season.id === seasonId)?.name }}
          </p>
          <p>El equipo quedará inscrito sin un grupo asignado.</p>
        </section>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <p v-if="message" role="status">
          {{ message }} Puedes consultarlo en la pestaña Equipos del torneo.
        </p>
        <div class="step-actions">
          <button
            v-if="step > 0"
            type="button"
            class="text-action"
            @click="back"
          >
            Atrás</button
          ><button
            type="submit"
            class="primary-action"
            :disabled="locked || !available.length"
          >
            {{ step === 2 ? "Confirmar inscripción demo" : "Continuar" }}
          </button>
        </div>
        <p v-if="!available.length">
          Todos los equipos del catálogo ya están inscritos.
        </p>
        <p>
          Los cambios se mantienen mientras navegas y se restablecen al recargar
          la aplicación.
        </p>
        <NuxtLink to="/teams/register" class="text-action"
          >Explorar la creación de un equipo</NuxtLink
        >
      </form></Transition
    >
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
main {
  color: var(--text-color);
}
button:hover {
  color: var(--accent);
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
}
@media (min-width: 1450px) {
  main {
    max-width: 1360px;
  }
}
@media (max-width: 1050px) {
  main {
    padding: 0 30px;
  }
}
@media (max-width: 700px) {
  main {
    padding: 0 18px;
  }
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.text-action {
  font-size: 12px;
  color: var(--accent);
}
.demo-form label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}
.demo-form select {
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: inherit;
  font: inherit;
  max-width: 100%;
}
.demo-form {
  display: grid;
  gap: 20px;
  max-width: 800px;
}
.demo-form .form-error {
  color: var(--ui-danger, #e99393);
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  border: 1px solid var(--ui-border, rgba(189, 237, 117, 0.2));
  color: var(--accent);
  font-weight: 600;
}
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}
.registration-review {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
}
html[data-theme="light"] .primary-action:hover:not(:disabled) {
  background: #d5e7c7;
  color: #244b16;
}
html[data-theme="light"] .primary-action:disabled {
  background: #e9eee6;
  color: #596452;
  border-color: #c5cec0;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: no-preference) {
  .registration-step-enter-active,
  .registration-step-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
  .registration-step-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .registration-step-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: no-preference) {
  button,
  a,
  input {
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }
  button:not(:disabled):active,
  .primary-action:active {
    transform: translateY(1px);
  }
  input:focus-visible {
    box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  }
}
</style>
