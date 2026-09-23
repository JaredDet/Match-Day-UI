<script setup lang="ts">
import ManagementPanel from "~/components/ManagementPanel.vue";
import AppSelect from "~/components/AppSelect.vue";
import { useTournamentManagement } from "~/modules/tournaments/composables/useTournamentManagement";
import { useTeams } from "~/modules/teams/composables/useTeams";
import type { DemoPhase, DemoGroup } from "~/modules/tournaments/types/management";
const props = defineProps<{ phase: DemoPhase; group: DemoGroup; capacity: number }>();
const emit = defineEmits<{ feedback: [action: () => Promise<unknown>] }>();
const manager = useTournamentManagement(),
  { teamById } = useTeams();
const team = ref(""),
  match = ref(""),
  day = ref(1),
  order = ref<string[]>([]);
watch(
  () => props.group.teams.join(","),
  () => {
    order.value = [...props.group.teams];
  },
  { immediate: true },
);
const available = computed(() =>
  (manager.registrations.value[props.phase.season] ?? []).filter(
    (id) => !props.phase.groups.some((g) => g.teams.includes(id)),
  ),
);
const candidates = computed(() =>
  manager.matches.value.filter(
    (m) =>
      m.status === "scheduled" &&
      [m.home_team.id, m.away_team.id].every((id) => props.group.teams.includes(id)) &&
      !manager.phases.value.some((p) => p.fixtures.some((f) => f.match === m.id)),
  ),
);
const disabled = computed(
  () =>
    manager.locked(props.phase.season) ||
    props.phase.status !== "scheduled" ||
    props.phase.fixtures.some(
      (f) => manager.matches.value.find((m) => m.id === f.match)?.status !== "scheduled",
    ),
);
function move(index: number, offset: number) {
  const next = [...order.value];
  [next[index], next[index + offset]] = [next[index + offset]!, next[index]!];
  order.value = next;
}
</script>
<template>
  <ManagementPanel :title="`Grupo ${group.name} · ${group.teams.length}/${capacity}`"
    ><p v-if="group.teams.length >= capacity">Grupo completo</p>
    <ul>
      <li v-for="id in group.teams" :key="id">
        <div class="actions">
          <span>{{ teamById(id)?.name }}</span
          ><button
            :disabled="disabled"
            @click="emit('feedback', () => manager.removeTeam(phase.id, group.id, id))"
          >
            Retirar del grupo
          </button>
        </div>
      </li>
    </ul>
    <label
      >Equipo inscrito<AppSelect v-model="team" :disabled="disabled"
        ><option value="">Selecciona equipo</option>
        <option v-for="id in available" :key="id" :value="id">
          {{ teamById(id)?.name }}
        </option></AppSelect
      ></label
    ><button
      :disabled="disabled || group.teams.length >= capacity"
      @click="
        emit('feedback', async () => {
          await manager.assign(phase.id, group.id, team);
          team = '';
        })
      "
    >
      Asignar al grupo</button
    ><label
      >Partido pendiente<AppSelect v-model="match" :disabled="disabled"
        ><option value="">Selecciona partido</option>
        <option v-for="m in candidates" :key="m.id" :value="m.id">
          {{ m.home_team.name }} – {{ m.away_team.name }}
        </option></AppSelect
      ></label
    ><label
      >Jornada<input
        v-model.number="day"
        type="number"
        min="1"
        :max="phase.matchdays"
        :disabled="disabled" /></label
    ><button
      :disabled="disabled"
      @click="
        emit('feedback', async () => {
          await manager.fixture(phase.id, group.id, match, day);
          match = '';
        })
      "
    >
      Vincular partido</button
    ><NuxtLink to="/matches/manage">Crear u operar partidos</NuxtLink>
    <div
      v-for="f in phase.fixtures.filter((f) => f.group === group.id)"
      :key="f.match"
      class="actions"
    >
      <NuxtLink :to="`/matches/manage?match=${f.match}`"
        >Jornada {{ f.matchday }} ·
        {{ manager.matches.value.find((m) => m.id === f.match)?.home_team.name }} –
        {{ manager.matches.value.find((m) => m.id === f.match)?.away_team.name }}</NuxtLink
      ><button
        :disabled="disabled"
        @click="emit('feedback', () => manager.unfixture(phase.id, f.match))"
      >
        Desvincular
      </button>
    </div>
    <template v-if="phase.status === 'finished' && !manager.locked(phase.season)"
      ><h3>Orden manual de desempate</h3>
      <p>Se aplica después de los criterios deportivos. Ordena todos los equipos y confirma.</p>
      <div v-for="(id, index) in order" :key="id" class="actions">
        <span>{{ index + 1 }}. {{ teamById(id)?.name }}</span
        ><button
          :disabled="index === 0"
          :aria-label="`Subir ${teamById(id)?.name}`"
          @click="move(index, -1)"
        >
          ↑</button
        ><button
          :disabled="index === order.length - 1"
          :aria-label="`Bajar ${teamById(id)?.name}`"
          @click="move(index, 1)"
        >
          ↓
        </button>
      </div>
      <button @click="emit('feedback', () => manager.manualOrder(phase.id, group.id, order))">
        Guardar desempate
      </button></template
    ><button
      :disabled="disabled"
      @click="emit('feedback', () => manager.removeGroup(phase.id, group.id))"
    >
      Eliminar grupo
    </button></ManagementPanel
  >
</template>
