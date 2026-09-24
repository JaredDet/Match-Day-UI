<script setup lang="ts">
import { useNews } from "~/modules/news/composables/useNews";
import TeamBadge from "~/modules/teams/components/TeamBadge.vue";
import EmptyState from "~/components/EmptyState.vue";
import { useTeams } from "~/modules/teams/composables/useTeams";
import { useRepositories } from "~/core/api/repository-context";

import { newsDate } from "~/modules/news/data/news";
import { positionNames, resultNames } from "~/modules/teams/data/teamProfiles";
const resultLetters = { win: "V", draw: "E", loss: "D" } as const;
const { items: publishedNews } = useNews("PUBLISHED");
const route = useRoute();
const { teams } = useTeams();
const repository = useRepositories().teams;
const { data: team } = await useAsyncData(`team-detail-${route.params.id}`, () =>
  repository.get(String(route.params.id)),
);
const summary = computed(() => teams.value.find((item) => item.id === route.params.id));
if (!team.value) throw createError({ statusCode: 404, statusMessage: "Equipo no encontrado" });
const tab = ref("overview");
const tabs = [
  { id: "overview", label: "Resumen" },
  { id: "matches", label: "Resultados" },
  { id: "squad", label: "Plantilla" },
  { id: "news", label: "Noticias" },
];
const metrics = computed(() =>
  team.value
    ? [
        ["Partidos", team.value.statistics.matches_played],
        ["Victorias", team.value.statistics.wins],
        ["Empates", team.value.statistics.draws],
        ["Derrotas", team.value.statistics.losses],
        ["Goles a favor", team.value.statistics.goals_for],
        ["Goles en contra", team.value.statistics.goals_against],
      ]
    : [],
);
const teamNews = computed(() =>
  publishedNews.value
    .filter((item) => item.team_id === team.value?.id)
    .map((item) => ({
      id: item.id,
      category: "Club",
      title: item.title,
      summary: item.preview,
      image: item.cover_image,
      date: newsDate(item.published_at!),
    })),
);
useSeoMeta(() => ({
  title: `${team.value?.name ?? "Equipo"} · Matchday`,
  description: `Plantilla, noticias y resultados de ${team.value?.name ?? "este equipo"}.`,
  ogTitle: team.value?.name,
  ogDescription: `Plantilla, noticias y resultados de ${team.value?.name ?? "este equipo"}.`,
  twitterTitle: team.value?.name,
}));
</script>
<template>
  <main v-if="team" class="competition-page">
    <AppBreadcrumbs
      :items="[
        { label: 'Inicio', to: '/' },
        { label: 'Equipos', to: '/teams' },
        { label: team.name },
      ]"
    />
    <NuxtLink to="/teams" class="section-back">← Todos los equipos</NuxtLink>
    <div class="entity-heading">
      <div class="entity-heading-badge">
        <TeamBadge class="large-badge" :name="team.name" :src="team.crest" />
      </div>
      <div class="entity-heading-copy">
        <span class="section-kicker">EQUIPO</span>
        <h1>{{ team.name }}<span>.</span></h1>
        <p>DT · {{ team.head_coach_name ?? "Sin técnico registrado" }}</p>
        <p v-if="team.city || team.stadium_name || team.founded_year" class="team-metadata">
          {{ [team.city, team.stadium_name, team.founded_year].filter(Boolean).join(" · ") }}
        </p>
      </div>
      <ShareButton :title="team.name" :text="`Plantilla, noticias y resultados de ${team.name}.`" />
    </div>
    <div class="team-tools">
      <p class="demo-caption">Plantilla, resultados y estadísticas del equipo</p>
      <NuxtLink :to="`/teams/${team.id}/formations`" class="text-action"
        >Gestionar formaciones →</NuxtLink
      >
    </div>
    <nav class="entity-tabs" aria-label="Secciones del equipo">
      <button
        v-for="item in tabs"
        :key="item.id"
        :class="{ active: tab === item.id }"
        :aria-current="tab === item.id ? 'page' : undefined"
        @click="tab = item.id"
      >
        {{ item.label }}
      </button>
    </nav>
    <Transition name="section-swap" mode="out-in"
      ><section :key="`${team.id}-${tab}`">
        <template v-if="tab === 'overview'"
          ><div class="content-heading">
            <h2>Estadísticas del equipo</h2>
            <span>Registro disponible · Sin filtro de temporada</span>
          </div>
          <dl class="profile-stats">
            <div v-for="metric in metrics" :key="String(metric[0])">
              <dt>{{ metric[0] }}</dt>
              <dd>{{ metric[1] }}</dd>
            </div>
          </dl>
          <div class="team-overview">
            <div class="info-panel">
              <h2>Próximo partido</h2>
              <NuxtLink
                v-if="summary?.next_match"
                class="profile-next"
                :to="`/matches/${summary.next_match.match_id}`"
                ><strong>vs. {{ summary.next_match.opponent_name }}</strong
                ><span
                  >{{
                    new Date(summary.next_match.scheduled_at).toLocaleString("es-CL", {
                      timeZone: "America/Santiago",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                  · Santiago</span
                ><span class="text-action">Ver partido →</span></NuxtLink
              >
              <p v-else class="profile-muted">Sin partido programado.</p>
            </div>
            <div class="info-panel">
              <h2>Resultados recientes</h2>
              <div class="team-form">
                <span
                  v-for="match in team.recent_matches"
                  :key="match.match_id"
                  :class="['result-pill', match.result]"
                  :title="`${resultNames[match.result]} contra ${match.opponent_name}`"
                  >{{ resultLetters[match.result]
                  }}<span class="sr-only">{{ resultNames[match.result] }}</span></span
                >
              </div>
              <p v-if="!team.recent_matches.length" class="profile-muted">
                Todavía no hay partidos finalizados.
              </p>
              <button v-else class="text-action" @click="tab = 'matches'">Ver resultados →</button>
            </div>
          </div>
          <div class="news-panel">
            <div class="content-heading">
              <h2>Noticias</h2>
              <span>Últimas novedades</span>
            </div>
            <EmptyState
              v-if="!teamNews.length"
              title="Sin noticias publicadas"
              description="Este equipo todavía no tiene publicaciones."
            />
            <div class="news-grid">
              <article v-for="item in teamNews" :key="item.title" class="news-card">
                <NuxtLink v-if="item.image" :to="`/news/${item.id}`" class="news-cover"
                  ><img :src="item.image" alt=""
                /></NuxtLink>
                <span class="news-tag">{{ item.category }}</span>
                <h3>
                  <NuxtLink :to="`/news/${item.id}`">{{ item.title }}</NuxtLink>
                </h3>
                <p>{{ item.summary }}</p>
                <time>{{ item.date }}</time>
              </article>
            </div>
          </div></template
        ><template v-else-if="tab === 'matches'"
          ><h2 class="profile-section-title">Resultados recientes</h2>
          <div class="profile-results">
            <NuxtLink
              v-for="match in team.recent_matches"
              :key="match.match_id"
              :to="`/matches/${match.match_id}`"
              class="profile-result"
              ><div class="profile-result-main">
                <span class="profile-result-opponent">vs. {{ match.opponent_name }}</span>
                <time>{{
                  new Date(match.scheduled_at).toLocaleDateString("es-CL", {
                    timeZone: "America/Santiago",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}</time>
              </div>
              <div class="profile-score-block">
                <div class="profile-score-stack">
                  <strong>{{ match.goals_for }} – {{ match.goals_against }}</strong>
                  <small
                    v-if="match.penalty_score_for != null && match.penalty_score_against != null"
                    >Pen. {{ match.penalty_score_for }}–{{ match.penalty_score_against }}</small
                  >
                </div>
              </div>
              <span :class="['result-pill', match.result]" :title="resultNames[match.result]"
                >{{ resultLetters[match.result]
                }}<span class="sr-only">{{ resultNames[match.result] }}</span></span
              ></NuxtLink
            >
            <p v-if="!team.recent_matches.length" class="section-empty">
              Todavía no hay resultados recientes.
            </p>
          </div>
          <p v-if="team.recent_matches.length" class="demo-caption">
            Marcadores desde la perspectiva de {{ team.name }}. El resultado puede incluir una tanda
            de penales.
          </p></template
        ><template v-else-if="tab === 'news'"
          ><div class="content-heading">
            <h2>Noticias</h2>
            <span>Todo el contenido del club</span>
          </div>
          <EmptyState
            v-if="!teamNews.length"
            title="Sin noticias publicadas"
            description="Este equipo todavía no tiene publicaciones."
          />
          <div class="news-grid full-news-grid">
            <article v-for="item in teamNews" :key="item.title" class="news-card">
              <NuxtLink v-if="item.image" :to="`/news/${item.id}`" class="news-cover"
                ><img :src="item.image" alt=""
              /></NuxtLink>
              <span class="news-tag">{{ item.category }}</span>
              <h3>
                <NuxtLink :to="`/news/${item.id}`">{{ item.title }}</NuxtLink>
              </h3>
              <p>{{ item.summary }}</p>
              <time>{{ item.date }}</time>
            </article>
          </div></template
        ><template v-else
          ><div class="content-heading">
            <h2>Plantilla</h2>
            <span>{{ team.players.length }} jugadores</span>
          </div>
          <div class="roster-grid">
            <NuxtLink
              v-for="player in team.players"
              :key="player.id"
              :to="`/players/${player.id}`"
              class="team-roster-player"
              ><span class="shirt-number">{{ player.preferred_shirt_number ?? "–" }}</span>
              <div>
                <strong>{{ player.name }}</strong
                ><small>{{
                  player.preferred_position
                    ? positionNames[player.preferred_position]
                    : "Posición sin definir"
                }}</small>
              </div>
              <span v-if="player.is_captain" class="captain-tag">C</span
              ><span v-else aria-hidden="true">↗</span></NuxtLink
            >
          </div>
          <p v-if="!team.players.length" class="section-empty">
            Este equipo todavía no tiene jugadores registrados.
          </p></template
        >
      </section></Transition
    >
  </main>
</template>

<style scoped>
.team-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
html[data-theme="light"] main,
html[data-theme="light"] .competition-page,
html[data-theme="light"] .entity-heading,
html[data-theme="light"] .content-heading,
html[data-theme="light"] .info-panel,
html[data-theme="light"] .profile-result,
html[data-theme="light"] .team-roster-player,
html[data-theme="light"] .profile-stats > div,
html[data-theme="light"] .entity-tabs {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .section-back,
html[data-theme="light"] .entity-heading h1,
html[data-theme="light"] .entity-heading p,
html[data-theme="light"] .content-heading h2,
html[data-theme="light"] .profile-section-title,
html[data-theme="light"] .section-kicker,
html[data-theme="light"] .profile-result time,
html[data-theme="light"] .team-roster-player small {
  color: var(--text-color) !important;
}
html[data-theme="light"] .section-empty,
html[data-theme="light"] .demo-caption,
html[data-theme="light"] .content-heading > span,
html[data-theme="light"] .profile-muted,
html[data-theme="light"] .entity-tabs button {
  color: var(--muted) !important;
}
main,
.section-back,
.entity-heading,
.entity-heading h1,
.entity-heading p,
.content-heading,
.content-heading h2,
.profile-section-title,
.info-panel,
.profile-result,
.team-roster-player,
.section-kicker {
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
h1 {
  font-size: 42px;
  font-weight: 600;
  letter-spacing: -1.8px;
  margin: 10px 0;
}
h1 > span {
  color: var(--accent);
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
  h1 {
    font-size: 34px;
    margin: 8px 0;
  }
  h2 {
    font-size: 19px;
  }
}
.competition-page {
  padding-top: 30px;
  padding-bottom: 60px;
}
.section-back {
  display: inline-block;
  font-size: 12px;
  color: var(--ui-muted, #a0aa9d);
  margin-bottom: 32px;
}
.section-back:hover {
  color: var(--accent);
}
.entity-heading {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 28px;
  padding: 18px 20px 18px 18px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--ui-border, rgba(255, 255, 255, 0.06));
  background: var(--ui-surface, rgba(15, 18, 22, 0.96));
}
.entity-heading-badge {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  background: transparent;
}
.entity-heading-copy {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}
.entity-heading :deep(.share-control) {
  z-index: 1;
  align-self: flex-start;
  margin-left: auto;
}
.entity-heading h1 {
  font-size: clamp(28px, 4vw, 44px);
  margin: 8px 0;
  line-height: 1.15;
  overflow-wrap: anywhere;
}
.entity-heading h1 > span {
  color: var(--accent);
}
.entity-heading p {
  color: var(--ui-muted, #929b93);
  font-size: 12px;
}
.section-kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ui-success, #b9d499);
  text-transform: uppercase;
}
.large-badge.team-badge {
  width: 96px;
  height: 96px;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background-size: contain;
}
.demo-caption {
  font-size: 10px;
  color: var(--ui-muted, #899187);
  margin-bottom: 28px;
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
.team-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-top: 30px;
}
.info-panel {
  padding: 28px;
  border: 1px solid var(--ui-border, #303030);
  border-radius: 10px;
  background: var(--ui-surface, #1c1c1c);
}
.info-panel dl {
  margin: 20px 0 0;
}
.info-panel dl > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ui-border, #ffffff08);
  font-size: 12px;
}
.info-panel dt {
  color: var(--ui-muted, #909d87);
}
.info-panel dd {
  margin: 0;
  text-align: right;
}
.text-action {
  font-size: 12px;
  color: var(--accent);
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
  .entity-heading {
    gap: 16px;
    flex-wrap: nowrap;
  }
  .entity-heading-badge,
  .large-badge.team-badge {
    width: 64px;
    height: 64px;
  }
  .entity-heading h1 {
    font-size: clamp(24px, 6vw, 32px);
  }
  .entity-heading :deep(.share-control button) {
    width: 44px;
    padding: 0;
  }
  .entity-heading :deep(.share-control button span) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
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
  .team-overview {
    grid-template-columns: 1fr;
  }
  .section-back {
    margin-bottom: 24px;
  }
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
.section-swap-enter-active {
  transition: opacity 0.22s ease;
}
.section-swap-leave-active {
  transition: opacity 0.12s ease;
}
@media (max-width: 700px) {
  .entity-heading {
    row-gap: 24px;
  }
  .info-panel {
    padding: 22px;
  }
}
.profile-stats {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0 32px;
}
.profile-stats > div {
  border: 1px solid var(--ui-border, #35402f);
  border-radius: 8px;
  padding: 22px;
  background: var(--ui-surface, #1c2219);
}
.profile-stats dt {
  font-size: 11px;
  color: var(--ui-muted, #a1ae97);
}
.profile-stats dd {
  font-size: 30px;
  color: var(--ui-success, #c4e6a4);
  margin: 12px 0 0;
}
.profile-next {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 22px;
  font-size: 12px;
}
.profile-muted {
  color: var(--ui-muted, #97a28e);
  font-size: 12px;
  margin-top: 22px;
}
.team-form {
  display: flex;
  gap: 8px;
  margin: 22px 0;
  flex-wrap: wrap;
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
.team-form .result-pill {
  width: 34px;
  height: 34px;
  min-width: 34px;
  padding: 0;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 11px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.profile-section-title {
  font-size: 20px;
  margin: 30px 0 18px;
}
.profile-results {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}
.profile-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 14px;
  align-items: center;
  padding: 18px 16px;
  background: var(--ui-surface, #171818);
  border: 1px solid var(--ui-border, #2a2d2d);
  border-radius: 6px;
  font-size: 12px;
  color: var(--ui-text, #dfe4de);
  transition:
    border-color 0.15s,
    background 0.15s;
}
.profile-result-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  gap: 5px;
}
.profile-result-opponent {
  color: var(--ui-text, #eef1ee);
  font-size: 14px;
  font-weight: 500;
}
.profile-result time {
  font-size: 10px;
  color: var(--ui-muted, #9a9a9a);
}
.profile-result:hover {
  border-color: var(--ui-border, #4f4f4f);
  background: var(--ui-hover, #1a1b1c);
}
.profile-score-block {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.profile-result strong {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 18px;
  color: var(--ui-text, #edf3ee);
  font-weight: 600;
}
.profile-score-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.profile-score-stack strong {
  font-size: 18px;
  color: var(--ui-text, #edf3ee);
  font-weight: 600;
}
.profile-score-stack small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 18px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.1));
  font-size: 9px;
  color: var(--ui-success, #b3d58f);
  font-weight: 600;
  align-self: center;
}
.profile-result .result-pill {
  justify-self: end;
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  border: 1px solid currentColor;
  border-radius: 50%;
}
.roster-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.shirt-number {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  background: var(--ui-success-soft, #1f2629);
  color: var(--ui-text, #edf4ef);
  flex-shrink: 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--ui-border, #3a4248);
}
.captain-tag {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  color: var(--ui-text, #dfe4de);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  border: 1px solid var(--ui-border, #4a504b);
  border-radius: 999px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.08));
  color: var(--ui-success, #c8dca8);
  margin-left: 10px;
}
@media (max-width: 1000px) {
  .roster-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .profile-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .roster-grid {
    grid-template-columns: 1fr;
  }
  .profile-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .profile-stats > div {
    padding: 18px;
  }
  .profile-result {
    grid-template-columns: 1fr auto;
    gap: 14px;
    padding: 18px;
  }
  .profile-result time {
    grid-column: 1/-1;
  }
  .profile-result .result-pill {
    justify-self: start;
  }
}

.team-roster-player:hover {
  border-color: var(--ui-border, #505d63);
  background: var(--ui-hover, #1b2125);
  box-shadow: 0 8px 18px var(--ui-shadow, rgba(0, 0, 0, 0.08));
}
.team-roster-player {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--ui-border, #2a3135);
  padding: 18px 16px;
  background: var(--ui-surface, #171b1d);
  border-radius: 12px;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  color: var(--ui-text, #edf3f2);
}
.team-roster-player strong {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.team-roster-player small {
  display: block;
  font-size: 10px;
  color: var(--ui-muted, #9ca7a1);
  margin-top: 6px;
}
.team-roster-player > span:last-child {
  margin-left: auto;
  color: var(--ui-text, #d6ddd8);
}
.profile-result strong small {
  display: block;
  margin-top: 5px;
  color: var(--ui-success, #9db86a);
  font-size: 10px;
  font-weight: 500;
}
.news-panel {
  margin-top: 28px;
}
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}
.full-news-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.news-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 18px 16px;
  background: var(--ui-surface, rgba(18, 22, 27, 0.7));
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px var(--ui-shadow, rgba(0, 0, 0, 0.08));
}
.news-cover {
  display: block;
  margin: -16px -16px 4px;
  overflow: hidden;
  border-radius: 6px 6px 0 0;
  aspect-ratio: 16 / 9;
}
.news-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}
.news-card:hover .news-cover img {
  transform: scale(1.035);
}
.news-tag {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  color: var(--accent);
  border: 1px solid var(--ui-border, rgba(189, 237, 117, 0.2));
}
.news-card h3 {
  font-size: 16px;
  line-height: 1.3;
  letter-spacing: -0.03em;
}
.news-card p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--muted);
}
.news-card time {
  margin-top: auto;
  font-size: 10px;
  color: var(--muted);
}
@media (max-width: 820px) {
  .news-grid {
    grid-template-columns: 1fr;
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
  .team-roster-player,
  .profile-result {
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .team-roster-player:hover,
  .profile-result:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px var(--shadow);
  }
}
</style>
