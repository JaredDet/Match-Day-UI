<script setup lang="ts">
import AppSelect from "~/components/AppSelect.vue";
import PageHeading from "~/components/PageHeading.vue";
import FormationEditor from "~/modules/teams/components/FormationEditor.vue";
import { ManageTeamFormationsUseCase } from "~/modules/teams/application/manage-team-formations-use-case";
import { useRepositories } from "~/core/api/repository-context";
import { formationPositions } from "~/modules/matches/data/formations";
import type { FormationShape, TeamFormation } from "~/modules/teams/types/formations";

const teamId = String(useRoute().params.id);
const repositories = useRepositories();
const useCase = new ManageTeamFormationsUseCase(repositories.teams);
const team = ref(await repositories.teams.get(teamId));
const formations = ref<TeamFormation[]>([]);
const selected = ref("");
const name = ref("Mi formación");
const shape = ref<FormationShape>("4-3-3");
const positions = ref(formationPositions(shape.value));
const isDefault = ref(false);
const message = ref("");
const error = ref("");
const shapes: FormationShape[] = ["4-3-3", "4-4-2", "4-2-3-1", "4-1-4-1", "3-5-2", "3-4-3"];
async function refresh() {
  formations.value = await useCase.list(teamId);
}
function reset() {
  selected.value = "";
  name.value = "Mi formación";
  shape.value = "4-3-3";
  positions.value = formationPositions(shape.value);
  isDefault.value = false;
}
function load(id: string) {
  const item = formations.value.find((formation) => formation.id === id);
  if (!item) return reset();
  name.value = item.name;
  shape.value = item.shape;
  positions.value = structuredClone(item.positions);
  isDefault.value = item.is_default;
}
watch(shape, (value, previous) => {
  if (value !== previous) positions.value = formationPositions(value);
});
async function save() {
  error.value = "";
  try {
    await useCase.save(
      teamId,
      {
        name: name.value,
        shape: shape.value,
        positions: positions.value,
        is_default: isDefault.value,
      },
      selected.value || undefined,
    );
    await refresh();
    reset();
    message.value = "Formación guardada.";
  } catch (reason) {
    error.value = (reason as Error).message;
  }
}
async function remove() {
  if (!selected.value) return;
  await useCase.remove(teamId, selected.value);
  await refresh();
  reset();
  message.value = "Formación eliminada.";
}
await refresh();
useHead({ title: `Formaciones de ${team.value.name} · Matchday` });
</script>

<template>
  <main class="formation-page">
    <PageHeading
      :title="`Formaciones de ${team.name}`"
      kicker="EQUIPO"
      :back-to="`/teams/${teamId}`"
      back-label="Volver al equipo"
      description="Guarda esquemas reutilizables. Arrastra cada posición o ajusta sus coordenadas."
    />
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <form @submit.prevent="save">
      <label
        >Editar formación<AppSelect v-model="selected" @update:model-value="load"
          ><option value="">Crear nueva</option>
          <option v-for="item in formations" :key="item.id" :value="item.id">
            {{ item.name }} · {{ item.shape }}
          </option></AppSelect
        ></label
      >
      <div class="fields">
        <label>Nombre<input v-model="name" required maxlength="80" /></label
        ><label
          >Esquema<AppSelect v-model="shape"
            ><option v-for="item in shapes" :key="item" :value="item">{{ item }}</option></AppSelect
          ></label
        ><label class="default"><input v-model="isDefault" type="checkbox" /> Predeterminada</label>
      </div>
      <FormationEditor v-model="positions" />
      <div class="actions">
        <button>Guardar formación</button
        ><button v-if="selected" type="button" class="secondary" @click="remove">Eliminar</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.formation-page {
  max-width: 1100px;
  margin: auto;
  padding: 30px 24px 70px;
}
.formation-page form {
  display: grid;
  gap: 18px;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 220px auto;
  gap: 16px;
  align-items: end;
}
.default {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 44px;
}
.actions {
  display: flex;
  gap: 12px;
}
.error {
  color: var(--ui-danger, #ffaaa3);
}
@media (max-width: 700px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
