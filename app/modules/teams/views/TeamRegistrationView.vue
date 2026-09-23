<script setup lang="ts">
import AppSelect from "~/components/AppSelect.vue";
import RegistrationSteps from "~/components/RegistrationSteps.vue";
import PageHeading from "~/components/PageHeading.vue";
import { positionNames } from "~/modules/teams/data/teamProfiles";
import { useTeamRegistration } from "~/modules/teams/composables/useTeamRegistration";

const { name, coach, players, error, validate, submit } = useTeamRegistration();
const step = ref(0);
const submitted = ref(false);
useUnsavedChanges(
  computed(
    () =>
      !submitted.value &&
      (!!name.value.trim() ||
        !!coach.value.trim() ||
        players.value.some((player) => !!player.name.trim())),
  ),
);
function proceed() {
  if (step.value < 2) {
    if (validate(step.value)) step.value++;
    return;
  }
  if (validate()) {
    submitted.value = true;
    submit();
  }
}
function back() {
  error.value = "";
  step.value--;
}
useHead({ title: "Crear equipo · Matchday" });
</script>
<template>
  <main class="competition-page">
    <PageHeading
      title="Crear equipo"
      kicker="EQUIPOS"
      description="Prepara los datos del club y su plantilla en esta demostración."
      back-to="/teams"
      back-label="Todos los equipos"
    /><RegistrationSteps
      :labels="['Equipo', 'Plantilla', 'Confirmar']"
      :current="step"
    />
    <Transition name="registration-step" mode="out-in"
      ><form :key="step" class="demo-form" @submit.prevent="proceed">
        <h2 tabindex="-1" aria-live="polite">
          {{
            [
              "Datos del equipo",
              "Jugadores de la plantilla",
              "Revisa el registro",
            ][step]
          }}
        </h2>
        <template v-if="step === 0"
          ><label
            >Nombre del equipo<input
              v-model="name"
              required
              maxlength="200"
              autocomplete="organization" /></label
          ><label
            >Director técnico<input
              v-model="coach"
              required
              maxlength="200"
              autocomplete="name" /></label
        ></template>
        <template v-else-if="step === 1"
          ><fieldset v-for="(player, index) in players" :key="index">
            <legend>Jugador {{ index + 1 }}</legend>
            <label
              >Nombre<input
                v-model="player.name"
                required
                maxlength="200" /></label
            ><label
              >Posición preferida<AppSelect v-model="player.preferred_position"
                ><option value="">Sin definir</option>
                <option
                  v-for="(label, key) in positionNames"
                  :key="key"
                  :value="key"
                >
                  {{ label }}
                </option></AppSelect
              ></label
            ><label
              >Dorsal preferido (opcional)<input
                :value="player.preferred_shirt_number ?? ''"
                type="number"
                min="1"
                max="99"
                step="1"
                @input="
                  player.preferred_shirt_number =
                    ($event.target as HTMLInputElement).value === ''
                      ? null
                      : Number(($event.target as HTMLInputElement).value)
                " /></label
            ><button
              type="button"
              class="text-action"
              @click="players.splice(index, 1)"
            >
              Quitar jugador
            </button>
          </fieldset>
          <button
            type="button"
            class="text-action"
            @click="
              players.push({
                name: '',
                preferred_position: '',
                preferred_shirt_number: null,
              })
            "
          >
            + Añadir jugador
          </button></template
        >
        <section v-else class="registration-review">
          <h3>{{ name }}</h3>
          <p>Director técnico: {{ coach || "Sin asignar" }}</p>
          <p>{{ players.length }} jugadores</p>
          <ul>
            <li v-for="(player, index) in players" :key="index">
              {{ player.name }} ·
              {{
                player.preferred_position
                  ? positionNames[
                      player.preferred_position as keyof typeof positionNames
                    ]
                  : "Sin posición"
              }}
              · Dorsal {{ player.preferred_shirt_number ?? "sin asignar" }}
            </li>
          </ul>
          <p>
            El registro es una simulación y no inscribe al equipo en una
            temporada.
          </p>
        </section>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <div class="step-actions">
          <button
            v-if="step > 0"
            type="button"
            class="text-action"
            @click="back"
          >
            Atrás</button
          ><button type="submit" class="primary-action">
            {{ step === 2 ? "Confirmar registro demo" : "Continuar" }}
          </button>
        </div>
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
.demo-form input,
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
.demo-form fieldset {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  gap: 16px;
}
.demo-form legend {
  padding: 0 8px;
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
.registration-review li {
  margin-bottom: 8px;
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
