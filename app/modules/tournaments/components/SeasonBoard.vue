<script setup lang="ts">
import { useTournamentManagement } from "~/modules/tournaments/composables/useTournamentManagement";
import { useTeams } from "~/modules/teams/composables/useTeams";
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";
const props = defineProps<{ seasonId: string; tab?: string }>();
const { phases, standings } = useTournamentManagement(),
  { teamById } = useTeams();
const visible = computed(() =>
  phases.value.filter(
    (p) =>
      p.season === props.seasonId &&
      (!props.tab ||
        props.tab === "phases" ||
        (props.tab === "groups" ? p.kind === "groups" : p.kind !== "groups")),
  ),
);
</script>
<template>
  <div class="season-board">
    <p v-if="!visible.length">
      Esta temporada todavía no tiene {{ tab === "bracket" ? "eliminatorias" : "fases" }}. Puedes
      prepararlas desde la gestión del torneo.
    </p>
    <section v-for="phase in visible" :key="phase.id" class="phase">
      <div v-for="group in phase.groups" :key="group.id" class="group">
        <h3>
          <span>Grupo {{ group.name }}</span
          ><small>{{ group.teams.length }} equipos</small>
        </h3>
        <div class="scroll">
          <table>
            <caption>
              Clasificación ·
              {{
                group.teams.length
              }}
              equipos
            </caption>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in standings(phase.id, group.id)" :key="row.id">
                <th scope="row">
                  <NuxtLink :to="`/teams/${row.id}`"
                    ><TeamBadge
                      :name="teamById(row.id)?.name ?? 'Equipo'"
                      :src="teamById(row.id)?.crest"
                    />{{ teamById(row.id)?.name }}</NuxtLink
                  ><small v-if="row.tied"> · Desempate pendiente</small>
                </th>
                <td>{{ row.played }}</td>
                <td>{{ row.wins }}</td>
                <td>{{ row.draws }}</td>
                <td>{{ row.losses }}</td>
                <td>{{ row.gf }}</td>
                <td>{{ row.ga }}</td>
                <td>{{ row.gf - row.ga }}</td>
                <td>
                  <strong>{{ row.points }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.season-board {
  display: grid;
  gap: 24px;
  color: var(--text-color);
}
.phase {
  display: grid;
  gap: 20px;
}
.group {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.group h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
  color: var(--accent);
  font-size: 15px;
}
.group h3 small {
  color: var(--muted);
  font-size: 10px;
  font-weight: 400;
}
.scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
caption {
  text-align: left;
  color: var(--muted);
  padding: 14px 22px 8px;
  font-size: 11px;
}
td,
th {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid var(--border);
}
th:first-child {
  text-align: left;
  min-width: 240px;
  padding-left: 22px;
}
th a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}
tbody tr:nth-child(-n + 2) th {
  box-shadow: inset 3px 0 var(--accent);
}
tbody tr:nth-child(-n + 2) th a,
td:last-child strong {
  color: var(--accent);
}
small {
  display: block;
  color: var(--muted);
}
p {
  line-height: 1.6;
}
@media (max-width: 700px) {
  th:first-child {
    min-width: 190px;
    padding-left: 14px;
  }
  td,
  th {
    padding: 10px;
  }
}
</style>
