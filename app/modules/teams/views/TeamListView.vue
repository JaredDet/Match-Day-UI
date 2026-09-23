<script setup lang="ts">
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";
import PageHeading from "~/components/PageHeading.vue";
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue";
import { useTeams } from "~/modules/teams/composables/useTeams";

import { ArrowUpRightIcon } from "@heroicons/vue/24/outline";
import { resultNames } from "~/modules/teams/data/teamProfiles";
const { teams } = useTeams();
const search = ref("");
const visible = computed(() =>
  teams.value.filter((t) =>
    t.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        search.value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase(),
      ),
  ),
);
useHead({ title: "Equipos · Matchday" });
</script>
<template>
  <main class="competition-page">
    <PageHeading
      title="Equipos"
      kicker="LOS PROTAGONISTAS"
      description="Encuentra tu club y sigue sus resultados."
      ><div class="heading-actions">
        <ActionLink to="/players">Ver jugadores</ActionLink
        ><ActionLink to="/teams/manage">Administrar equipos</ActionLink>
      </div></PageHeading
    >
    <div class="content-heading">
      <h2>{{ visible.length }} equipos</h2>
      <div class="team-actions">
        <label class="team-search"
          >Buscar equipo<input v-model="search" type="search" placeholder="Nombre del equipo"
        /></label>
        <NuxtLink class="primary-action" to="/teams/register">Crear equipo</NuxtLink>
      </div>
    </div>
    <div class="team-directory">
      <article v-for="team in visible" :key="team.id" class="info-panel team-card">
        <NuxtLink
          :to="`/teams/${team.id}`"
          class="team-card-open"
          :aria-label="`Ver equipo ${team.name}`"
        />
        <NuxtLink :to="`/teams/${team.id}`" class="directory-title"
          ><TeamBadge :name="team.name" :src="team.crest" />
          <h2>{{ team.name }}</h2></NuxtLink
        >
        <AnimatedHeroIcon
          :icon="ArrowUpRightIcon"
          motion="arrow"
          class="team-card-indicator"
          aria-hidden="true"
        />
        <div class="directory-matches">
          <h3>Partidos</h3>
          <div class="directory-match-grid">
            <div class="directory-match directory-match--recent">
              <span>Último</span
              ><NuxtLink v-if="team.last_match" :to="`/matches/${team.last_match.match_id}`"
                ><span class="recent-match-summary"
                  ><span :class="['result-pill', team.last_match.result]">{{
                    resultNames[team.last_match.result]
                  }}</span
                  ><span class="recent-score-stack"
                    ><strong class="recent-match-score"
                      >{{ team.last_match.goals_for }}–{{ team.last_match.goals_against }}</strong
                    ><small
                      v-if="
                        team.last_match.penalty_score_for != null &&
                        team.last_match.penalty_score_against != null
                      "
                      class="recent-match-penalties"
                      >Pen. {{ team.last_match.penalty_score_for }}–{{
                        team.last_match.penalty_score_against
                      }}</small
                    ></span
                  ></span
                ><span class="recent-match-opponent">{{
                  team.last_match.opponent_name
                }}</span></NuxtLink
              >
              <p v-else>Sin resultados recientes</p>
            </div>
            <div class="directory-match directory-match--next">
              <span>Próximo</span
              ><NuxtLink v-if="team.next_match" :to="`/matches/${team.next_match.match_id}`"
                >vs. {{ team.next_match.opponent_name
                }}<small
                  >{{
                    new Date(team.next_match.scheduled_at).toLocaleString("es-CL", {
                      timeZone: "America/Santiago",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                  · Santiago</small
                ></NuxtLink
              >
              <p v-else>Sin partido programado</p>
            </div>
          </div>
        </div>
      </article>
    </div>
    <div v-if="!visible.length" class="section-empty">
      <h2>No encontramos equipos</h2>
      <button @click="search = ''">Limpiar búsqueda</button>
    </div>
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .competition-page,
html[data-theme="light"] .content-heading,
html[data-theme="light"] .info-panel,
html[data-theme="light"] .team-card {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .content-heading h2 {
  color: var(--text-color) !important;
}
html[data-theme="light"] .section-empty,
html[data-theme="light"] .content-heading > span,
html[data-theme="light"] .team-card .directory-matches h3,
html[data-theme="light"] .directory-match--next small,
html[data-theme="light"] .directory-match--next > span,
html[data-theme="light"] .team-card-indicator {
  color: var(--muted) !important;
}
html[data-theme="light"] .team-card:hover,
html[data-theme="light"] .team-card:focus-within {
  background: var(--surface) !important;
  border-color: var(--border) !important;
}
main,
.content-heading,
.content-heading h2,
.info-panel,
.team-card {
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
.team {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  min-width: 0;
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
@media (max-width: 700px) {
  .content-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
.info-panel {
  transition:
    border-color 0.24s,
    background-color 0.24s;
}
@media (max-width: 700px) {
  .info-panel {
    padding: 22px;
  }
}

.team-directory {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
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
.directory-match {
  border-top: 1px solid var(--ui-border, #ffffff0b);
  margin-top: 20px;
  padding-top: 18px;
  font-size: 12px;
  line-height: 1.8;
}
.directory-match > span {
  display: block;
  color: var(--ui-muted, #939f8d);
  font-size: 10px;
  margin-bottom: 8px;
}
.directory-match p {
  color: var(--ui-muted, #939f8d);
}
.directory-match small {
  display: block;
  color: var(--ui-muted, #a2ad9b);
  margin-top: 5px;
}
.team-search {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: var(--ui-muted, #a2ad9b);
}
.team-search input {
  width: 220px;
  padding: 12px 16px;
  background: var(--ui-surface, #1e251b);
  border: 1px solid var(--ui-border, #4b5b40);
  border-radius: 6px;
  color: var(--ui-text, #edf2e8);
  max-width: 100%;
}
.result-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 5px;
  background: var(--ui-surface, #30362b);
  color: var(--ui-text, #c9d2c1);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
@media (max-width: 1000px) {
  .team-directory {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .team-directory {
    grid-template-columns: 1fr;
  }
  .team-search {
    flex-wrap: wrap;
  }
  .team-search input {
    width: min(100%, 280px);
  }
}

.team-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
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
.team-card {
  position: relative;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.15s,
    transform 0.18s;
}

.team-card:hover,
.team-card:focus-within {
  background: var(--ui-hover, #1c1c1c);
  border-color: var(--ui-border, #505050);
  box-shadow: none;
  transform: translateY(-2px);
}

.team-card-open {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.team-card .directory-title,
.team-card .directory-matches {
  position: relative;
  z-index: 2;
}

.team-card .directory-title:hover {
  color: inherit;
}

.team-card-indicator {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: var(--ui-muted, #858585);
  font-size: 14px;
  opacity: 0.55;
  transition: opacity 0.15s;
  z-index: 2;
}

.team-card:hover .team-card-indicator,
.team-card:focus-within .team-card-indicator {
  color: var(--ui-text, #ddd);
  opacity: 1;
}

.team-card .directory-title {
  position: relative;
  padding-right: 28px;
}

.directory-matches {
  margin-top: 24px;
}

.directory-matches h3 {
  margin: 0 0 12px;
  color: var(--ui-text, #b9c3b1);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.directory-match-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
}

.directory-match {
  min-width: 0;
  margin: 0;
  padding: 0 22px 0 0;
  border-top: 0;
}

.directory-match--next {
  padding: 0 0 0 22px;
  border-left: 1px solid var(--ui-border, #bded7540);
}

.directory-match--recent p,
.directory-match--next p {
  margin: 0;
}

.directory-match--recent > a {
  display: block;
}

.recent-match-summary {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 10px;
}

.recent-match-score {
  color: var(--ui-text, #c0c9bd);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1;
}

.recent-score-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.recent-match-opponent {
  display: block;
  margin-top: 5px;
  color: var(--ui-text, #d4dbd0);
  line-height: 1.45;
}

.recent-match-penalties {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  padding: 2px 5px;
  border-radius: 3px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  color: var(--ui-success, #bfdca0);
  font-size: 9px;
  line-height: 1.2;
  align-self: center;
}

.directory-match--next > span {
  color: var(--ui-success, #b9d499);
}

.directory-match--next > a {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.directory-match--next small {
  font-size: 10px;
}

.directory-match a:hover {
  color: var(--accent);
}

@media (max-width: 700px) {
  .directory-match-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .directory-match,
  .directory-match--next {
    padding: 0;
    border-left: 0;
  }

  .directory-match--next {
    padding-top: 16px;
    border-top: 1px solid var(--ui-border, #bded7540);
  }
}

.result-pill.win {
  background: var(--ui-surface, #2f4425);
  color: var(--ui-success, #bde897);
}
.result-pill.loss {
  background: var(--ui-surface, #442c29);
  color: var(--ui-danger, #edb5ad);
}
html[data-theme="light"] .result-pill.win {
  background: #dff1c4;
  color: #224c1b;
}
html[data-theme="light"] .result-pill.loss {
  background: #f8d8d0;
  color: #7b3127;
}
html[data-theme="light"] .result-pill.draw {
  background: #ebebeb;
  color: #3b3b3b;
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
  .team-card {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .team-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
</style>
