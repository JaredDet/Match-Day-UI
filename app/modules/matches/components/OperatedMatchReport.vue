<script setup lang="ts">
import { useMatchOperations } from "~/modules/matches/composables/useMatchOperations";
import { eventLabels } from "~/modules/matches/types/operations";
const props = defineProps<{ matchId: string }>();
const { matches, operations, roster } = useMatchOperations();
const match = computed(() => matches.value.find((m) => m.id === props.matchId)!);
const state = computed(() => operations.value[props.matchId]);
function playerName(side: "home" | "away", id?: string) {
  return roster(match.value[`${side}_team`].id).find((p) => p.id === id)?.name ?? "";
}
</script>
<template>
  <section v-if="state" class="operated-report">
    <h2>Acta del partido</h2>
    <div class="lineups">
      <section v-for="side in ['home', 'away'] as const" :key="side">
        <h3>{{ match[`${side}_team`].name }}</h3>
        <p v-if="!state.lineups[side].length">Alineación pendiente</p>
        <ul>
          <li v-for="id in state.lineups[side]" :key="id">{{ playerName(side, id) }}</li>
        </ul>
      </section>
    </div>
    <h3>Cronología</h3>
    <p v-if="!state.events.length">Sin eventos registrados.</p>
    <ol>
      <li v-for="event in state.events" :key="event.id" :class="{ cancelled: event.cancelled }">
        {{ event.minute }}′ · {{ eventLabels[event.kind] }} ·
        {{ playerName(event.side, event.player)
        }}<span v-if="event.replacement"> → {{ playerName(event.side, event.replacement) }}</span
        ><strong v-if="event.cancelled"> · Anulado</strong>
      </li>
    </ol>
  </section>
</template>
<style scoped>
.operated-report {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text-color);
  display: grid;
  gap: 20px;
}
.lineups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
ul,
ol {
  padding-left: 20px;
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.cancelled {
  color: var(--muted);
  text-decoration: line-through;
}
@media (max-width: 600px) {
  .lineups {
    grid-template-columns: 1fr;
  }
}
</style>
