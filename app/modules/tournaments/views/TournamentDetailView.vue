<script setup lang="ts">
import AppSelect from "~/components/AppSelect.vue";
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";
import PageHeading from "~/components/PageHeading.vue";
import EmptyState from "~/components/EmptyState.vue";
import { useDemoRegistrations } from "~/modules/tournaments/composables/useDemoRegistrations";

import TournamentBracket from "~/modules/tournaments/components/TournamentBracket.vue";

import { phases } from "~/modules/tournaments/data/tournaments";
import { useTournamentManagement } from "~/modules/tournaments/composables/useTournamentManagement";
import { useDemoTeams } from "~/modules/teams/composables/useDemoTeams";
import SeasonBoard from "~/modules/tournaments/components/SeasonBoard.vue";
import { groups } from "~/modules/tournaments/data/competition";
const route = useRoute(),
  manager = useTournamentManagement(),
  { teamById } = useDemoTeams();
const tournament = computed(() =>
  manager.tournaments.value.find((t) => t.slug === route.params.id),
);
if (!tournament.value)
  throw createError({ statusCode: 404, statusMessage: "Torneo no encontrado" });
const seasons = computed(() =>
  manager.seasons.value.filter((s) => s.tournament === tournament.value!.id),
);
const season = ref(
  seasons.value.find((s) => s.id === route.query.season)?.id ??
    (tournament.value.id === "demo-cup"
      ? "season-2026"
      : (seasons.value[0]?.id ?? "")),
);
const tab = ref("groups");
const registrations = useDemoRegistrations();
const registeredTeams = computed(() =>
  (registrations.value[season.value] ?? []).map((id) => ({
    ...teamById(id)!,
    group:
      season.value === "season-2026"
        ? groups.find((g) => g.rows.some((row) => row.id === id))?.name
        : manager.phases.value
            .filter((p) => p.season === season.value)
            .flatMap((p) => p.groups)
            .find((g) => g.teams.includes(id))?.name,
  })),
);
const registeredTeamGroups = computed(() => {
  const grouped = new Map<string, typeof registeredTeams.value>();
  for (const team of registeredTeams.value) {
    const name = team.group ?? "Sin asignar";
    const teams = grouped.get(name) ?? [];
    teams.push(team);
    grouped.set(name, teams);
  }
  return [...grouped.entries()]
    .map(([name, teams]) => ({ name, teams }))
    .sort((left, right) =>
      left.name === "Sin asignar"
        ? 1
        : right.name === "Sin asignar"
          ? -1
          : left.name.localeCompare(right.name, "es", { numeric: true }),
    );
});
const tabs = [
  { id: "teams", label: "Equipos" },
  { id: "phases", label: "Fases" },
  { id: "groups", label: "Grupos" },
  { id: "bracket", label: "Eliminatorias" },
];
const currentPhaseId = computed(
  () =>
    [...phases]
      .filter((phase) => phase.status !== "finished")
      .sort((left, right) => left.order - right.order)[0]?.id,
);
useHead({ title: "Copa Matchday · Torneos" });
</script>
<template>
  <main v-if="tournament" class="competition-page">
    <PageHeading
      :title="tournament.name"
      :kicker="`${tournament.country} · ${tournament.category}`"
      :description="`${registeredTeams.length} equipos · ${season === 'season-2026' ? groups.length : 0} grupos · Máximo ${tournament.max_teams_per_group} por grupo`"
      back-to="/tournaments"
      back-label="Todos los torneos"
    >
      <label class="season-picker"
        >Temporada<AppSelect v-model="season"
          ><option
            v-for="edition in seasons"
            :key="edition.id"
            :value="edition.id"
          >
            {{ edition.name }}
          </option></AppSelect
        ></label
      >
      <NuxtLink
        :to="`/tournaments/manage?tournament=${tournament.id}&season=${season}`"
        class="primary-action"
        >Gestionar torneo</NuxtLink
      ><NuxtLink
        :to="`/tournaments/register?season=${season}`"
        class="primary-action"
        >Inscribir equipos</NuxtLink
      >
    </PageHeading>
    <nav class="entity-tabs" aria-label="Secciones del torneo">
      <button
        v-for="item in tabs"
        :key="item.id"
        :aria-current="tab === item.id ? 'page' : undefined"
        :class="{ active: tab === item.id }"
        @click="tab = item.id"
      >
        {{ item.label }}
      </button>
    </nav>
    <Transition name="section-swap" mode="out-in"
      ><section :key="`${tab}-${season}`" class="entity-content">
        <SeasonBoard
          v-if="season !== 'season-2026' && tab !== 'teams'"
          :season-id="season"
          :tab="tab"
        />
        <template v-else-if="tab === 'teams'">
          <div class="content-heading">
            <h2>Equipos inscritos</h2>
            <span
              >{{ registeredTeams.length }} participantes en esta
              temporada</span
            >
          </div>
          <EmptyState
            v-if="!registeredTeams.length"
            title="Sin equipos inscritos"
            description="Inscribe equipos para preparar esta temporada."
          />
          <div class="registered-groups">
            <section
              v-for="group in registeredTeamGroups"
              :key="group.name"
              class="registered-group"
            >
              <header>
                <div>
                  <span class="section-kicker">Grupo</span>
                  <h3>{{ group.name }}</h3>
                </div>
                <span
                  >{{ group.teams.length }}
                  {{ group.teams.length === 1 ? "equipo" : "equipos" }}</span
                >
              </header>
              <div class="registered-team-list">
                <NuxtLink
                  v-for="team in group.teams"
                  :key="team.id"
                  :to="`/teams/${team.id}`"
                  class="registered-team"
                >
                  <TeamBadge :name="team.name" />
                  <strong>{{ team.name }}</strong>
                  <span>Ver equipo</span>
                </NuxtLink>
              </div>
            </section>
          </div>
        </template>
        <template v-else-if="tab === 'phases'">
          <div class="content-heading">
            <h2>Etapas del torneo</h2>
            <span>Partido único · Final y tercer puesto</span>
          </div>
          <div class="phase-list">
            <article
              v-for="phase in phases"
              :key="phase.id"
              class="info-panel"
              :class="{ current: phase.id === currentPhaseId }"
            >
              <div>
                <span>FASE {{ phase.order + 1 }}</span>
                <h3>{{ phase.name }}</h3>
              </div>
              <span class="phase-status"
                ><strong v-if="phase.id === currentPhaseId">Actual</strong
                >{{
                  phase.status === "finished" ? "Finalizada" : "Programada"
                }}</span
              >
              <span>{{
                phase.kind === "groups"
                  ? "Clasifican los dos primeros por grupo"
                  : phase.kind === "third_place"
                    ? "Perdedores de semifinales"
                    : "Avanzan los ganadores"
              }}</span>
            </article>
          </div>
        </template>
        <template v-else-if="tab === 'groups'"
          ><div class="content-heading">
            <h2>Fase de grupos</h2>
            <span>Clasifican los dos primeros de cada grupo</span>
          </div>
          <div class="groups-layout">
            <div v-for="group in groups" :key="group.name" class="group-panel">
              <h3>
                Grupo {{ group.name }}<span>6 jornadas · Finalizado</span>
              </h3>
              <div class="table-scroll">
                <table>
                  <caption class="sr-only">
                    Clasificación del grupo
                    {{
                      group.name
                    }}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Equipo</th>
                      <th scope="col">
                        <abbr title="Partidos jugados">PJ</abbr>
                      </th>
                      <th scope="col"><abbr title="Ganados">G</abbr></th>
                      <th scope="col"><abbr title="Empatados">E</abbr></th>
                      <th scope="col"><abbr title="Perdidos">P</abbr></th>
                      <th scope="col"><abbr title="Goles a favor">GF</abbr></th>
                      <th scope="col">
                        <abbr title="Goles en contra">GC</abbr>
                      </th>
                      <th scope="col">
                        <abbr title="Diferencia de goles">DG</abbr>
                      </th>
                      <th scope="col"><abbr title="Puntos">PTS</abbr></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in group.rows"
                      :key="row.id"
                      :class="{ qualified: index < 2 }"
                    >
                      <th scope="row">
                        <NuxtLink :to="`/teams/${row.id}`"
                          ><span class="rank">{{ index + 1 }}</span
                          ><TeamBadge :name="teamById(row.id)?.name" />{{
                            teamById(row.id)?.name
                          }}<span v-if="index < 2" class="sr-only"
                            >Clasificado</span
                          ></NuxtLink
                        >
                      </th>
                      <td>{{ row.w + row.d + row.l }}</td>
                      <td>{{ row.w }}</td>
                      <td>{{ row.d }}</td>
                      <td>{{ row.l }}</td>
                      <td>{{ row.gf }}</td>
                      <td>{{ row.ga }}</td>
                      <td :class="{ positive: row.gf > row.ga }">
                        {{ row.gf > row.ga ? "+" : "" }}{{ row.gf - row.ga }}
                      </td>
                      <td class="points">{{ row.w * 3 + row.d }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p class="standings-legend">
            <i /> Clasificado a octavos
            <span
              >PJ: jugados · G: ganados · E: empatados · P: perdidos · GF/GC:
              goles · DG: diferencia · PTS: puntos</span
            >
          </p></template
        >
        <template v-else
          ><div class="content-heading">
            <h2>Camino al título</h2>
            <span>Partido único · Final y tercer puesto</span>
          </div>
          <TournamentBracket
        /></template></section
    ></Transition>
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page,
html[data-theme="light"] .content-heading,
html[data-theme="light"] .info-panel,
html[data-theme="light"] .group-panel,
html[data-theme="light"] .table-scroll,
html[data-theme="light"] .entity-tabs,
html[data-theme="light"] .season-picker select,
html[data-theme="light"] .group-panel h3,
html[data-theme="light"] .group-panel tbody th,
html[data-theme="light"] .group-panel thead th,
html[data-theme="light"] .group-panel th,
html[data-theme="light"] .group-panel td {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .content-heading h2,
html[data-theme="light"] .section-kicker,
html[data-theme="light"] .group-panel h3,
html[data-theme="light"] .group-panel th a,
html[data-theme="light"] .group-panel td,
html[data-theme="light"] .standings-legend,
html[data-theme="light"] .season-picker {
  color: var(--text-color) !important;
}
html[data-theme="light"] .section-empty,
html[data-theme="light"] .content-heading > span,
html[data-theme="light"] .group-panel h3 span,
html[data-theme="light"] .group-panel thead th,
html[data-theme="light"] .standings-legend > span,
html[data-theme="light"] .rank,
html[data-theme="light"] .season-picker select,
html[data-theme="light"] .entity-tabs button {
  color: var(--muted) !important;
}
main,
.content-heading,
.content-heading h2,
.info-panel,
.group-panel,
.section-kicker,
.table-scroll {
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
h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.6px;
  display: flex;
  align-items: center;
  gap: 10px;
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
  h2 {
    font-size: 19px;
  }
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.section-kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ui-success, #b9d499);
  text-transform: uppercase;
}
.season-picker {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 10px;
  color: var(--ui-muted, #939b93);
}
.season-picker select {
  min-width: 132px;
  min-height: 46px;
  padding: 12px 44px 12px 16px;
  border: 1px solid var(--ui-border, #42483e);
  border-radius: 6px;
  background: var(--ui-surface, #1d211c);
  color: var(--ui-text, #e7ebe4);
}
.entity-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--ui-border, #30372e);
  margin-bottom: 30px;
}
.entity-tabs button {
  padding: 16px 20px;
  color: var(--ui-muted, #9ca598);
  font-size: 12px;
  border-bottom: 2px solid transparent;
}
.entity-tabs button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.content-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.content-heading h2,
.info-panel h2 {
  font-size: 19px;
  font-weight: 500;
}
.content-heading > span {
  font-size: 11px;
  color: var(--ui-muted, #929b8f);
}
.groups-layout {
  display: grid;
  gap: 24px;
}
.group-panel {
  border: 1px solid var(--ui-border, #343c32);
  border-radius: 10px;
  overflow: hidden;
  background: var(--ui-surface, #1b1f1b);
}
.group-panel h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  margin: 0;
  background: var(--ui-surface, #252e22);
  font-size: 14px;
  color: var(--ui-success, #c2e69b);
}
.group-panel h3 span {
  color: var(--ui-muted, #a0ad98);
  font-size: 10px;
  font-weight: 400;
}
.table-scroll {
  overflow-x: auto;
}
.group-panel table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  white-space: nowrap;
}
.group-panel th,
.group-panel td {
  padding: 16px 12px;
  text-align: center;
  border-bottom: 1px solid var(--ui-border, #ffffff08);
}
.group-panel thead th {
  font-size: 10px;
  color: var(--ui-muted, #919c8b);
  font-weight: 500;
}
.group-panel th:first-child {
  text-align: left;
  padding-left: 22px;
  min-width: 240px;
}
.group-panel th a {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 400;
}
.group-panel tbody tr:hover {
  background: var(--ui-hover, #ffffff04);
}
.group-panel tbody th {
  background: var(--ui-surface, #1b1f1b);
  position: sticky;
  left: 0;
  z-index: 1;
}
.group-panel .qualified th {
  box-shadow: inset 3px 0 var(--ui-shadow, #bded75);
}
.rank {
  width: 16px;
  color: var(--ui-muted, #929d8c);
}
.points {
  font-weight: 700;
  color: var(--ui-success, #d4ebbc);
  background: var(--ui-success-soft, #bded7507);
}
.positive {
  color: var(--ui-success, #a8d18c);
}
.standings-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--ui-text, #b8c1b2);
  margin-top: 18px;
  flex-wrap: wrap;
}
.standings-legend i {
  width: 3px;
  height: 12px;
  background: var(--accent);
}
.standings-legend > span {
  margin-left: auto;
  color: var(--ui-muted, #808c7b);
  font-size: 10px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.info-panel {
  padding: 28px;
  border: 1px solid var(--ui-border, #303030);
  border-radius: 10px;
  background: var(--ui-surface, #1c1c1c);
}
.section-empty {
  padding: 32px;
  border: 1px solid var(--ui-border, #30382b);
  border-radius: 8px;
  background: var(--ui-surface, #191e18);
  color: var(--ui-muted, #96a38e);
  font-size: 12px;
}
.section-empty h2 {
  font-size: 18px;
  color: var(--ui-text, #e2e9dc);
  margin-bottom: 12px;
}
.section-empty button {
  margin-top: 18px;
  color: var(--accent);
}
.section-swap-enter-active,
.section-swap-leave-active {
  transition: opacity 0.18s ease;
}
.section-swap-enter-from,
.section-swap-leave-to {
  opacity: 0;
}
@media (max-width: 700px) {
  .season-picker {
    margin-left: 0;
    flex-direction: row;
    align-items: center;
  }
  .content-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
  .entity-tabs {
    gap: 4px;
    overflow-x: auto;
  }
  .entity-tabs button {
    padding: 16px;
    white-space: nowrap;
  }
  .group-panel th:first-child {
    min-width: 180px;
    padding-left: 12px;
  }
  .group-panel th,
  .group-panel td {
    padding: 12px 10px;
    font-size: 10px;
  }
  .group-panel th a {
    gap: 7px;
  }
  .group-panel .team-badge {
    width: 26px;
    height: 30px;
    font-size: 9px;
  }
  .standings-legend > span {
    margin-left: 0;
    line-height: 1.7;
    width: 100%;
  }
  .group-panel h3 {
    padding: 16px;
  }
}

.season-picker select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23bded75' stroke-width='1.8'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.season-picker select:hover {
  background-color: var(--ui-hover, #293122);
  border-color: var(--ui-border, #84996b);
}
.season-picker select:focus {
  outline: none;
  border-color: var(--accent);
}
.entity-tabs button {
  transition:
    color 0.22s,
    border-color 0.22s,
    background-color 0.22s;
}
.entity-tabs button:hover {
  background: var(--ui-success-soft, #bded7508);
  color: var(--accent);
}
.info-panel {
  transition:
    border-color 0.24s,
    background-color 0.24s;
}
.group-panel tbody tr,
.group-panel tbody th {
  transition: background-color 0.2s;
}
.group-panel tbody tr:hover th {
  background: var(--ui-hover, #252d21);
}
.section-swap-enter-active {
  transition: opacity 0.22s ease;
}
.section-swap-leave-active {
  transition: opacity 0.12s ease;
}
@media (max-width: 700px) {
  .season-picker {
    gap: 14px;
  }
  .info-panel {
    padding: 22px;
  }
}
.directory-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
}
.directory-title h2 {
  font-size: 16px;
  flex: 1;
}
.directory-title:hover {
  color: var(--accent);
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 20px;
}
.editorial-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}
.editorial-card h2 {
  font-size: 24px;
  line-height: 1.2;
}
.editorial-card p {
  line-height: 1.8;
  color: var(--muted);
}
.phase-list {
  display: grid;
  gap: 12px;
}
.phase-list article {
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) minmax(120px, 0.45fr) minmax(
      260px,
      1fr
    );
  align-items: center;
  gap: 28px;
  padding: 20px;
}
.phase-list article.current {
  border-color: var(--accent);
  background: linear-gradient(
    90deg,
    var(--ui-success-soft),
    var(--surface) 38%
  );
  box-shadow: inset 3px 0 var(--accent);
}
.phase-list article > span:nth-child(2) {
  text-align: center;
}
.phase-list article > span:last-child {
  text-align: right;
}
.phase-list span {
  color: var(--muted);
  font-size: 13px;
}
.phase-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.phase-status strong {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--ui-on-accent, #14200f);
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
@media (max-width: 800px) {
  .editorial-card {
    padding: 20px;
  }
  .phase-list article {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 10px;
  }
  .phase-list article > span:nth-child(2),
  .phase-list article > span:last-child {
    text-align: left;
  }
  .phase-status {
    justify-content: flex-start;
  }
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
html[data-theme="light"] .entity-tabs button.active {
  color: var(--accent) !important;
  border-color: var(--accent);
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
@media (prefers-reduced-motion: no-preference) {
  .editorial-card {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .editorial-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
.registered-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.registered-group {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.registered-group > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
}
.registered-group > header > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.registered-group h3 {
  margin: 0;
  font-size: 20px;
}
.registered-group > header > span {
  color: var(--muted);
  font-size: 12px;
}
.registered-team-list {
  display: grid;
}
.registered-team {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 76px;
  padding: 12px 22px;
  border-bottom: 1px solid var(--border);
}
.registered-team:last-child {
  border-bottom: 0;
}
.registered-team strong {
  font-size: 16px;
  line-height: 1.25;
}
.registered-team > span {
  color: var(--muted);
  font-size: 11px;
  opacity: 0;
  transform: translateX(-5px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
}
.registered-team:hover {
  background: var(--ui-hover, #ffffff04);
}
.registered-team:hover > span {
  color: var(--accent);
  opacity: 1;
  transform: translateX(0);
}
@media (max-width: 800px) {
  .registered-groups {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .registered-team {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 12px 16px;
  }
  .registered-team > span {
    display: none;
  }
}
</style>
