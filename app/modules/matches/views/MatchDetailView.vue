<script setup lang="ts">
import OperatedMatchReport from "~/modules/matches/components/OperatedMatchReport.vue";
import type { MatchOperation } from "~/modules/matches/types/operations";
import { useRepositories } from "~/core/api/repository-context";
const operations = useState<Record<string, MatchOperation>>("api-match-operations", () => ({}));
import MatchDetail from "~/modules/matches/components/MatchDetail.vue";
import ShootoutSummary from "~/modules/matches/components/ShootoutSummary.vue";
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue";

import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { matchState, goalMinute, goalLabel, time } from "~/modules/matches/utils/matches";
import { initials, teamColor } from "~/modules/teams/utils/identity";
const route = useRoute();
const repository = useRepositories().matches;
const { data: match } = await useAsyncData(`match-detail-${route.params.id}`, () =>
  repository.get(String(route.params.id)),
);
if (!match.value)
  throw createError({
    statusCode: 404,
    statusMessage: "Partido no encontrado",
  });
const matchTitle = `${match.value!.home_team.name} vs. ${match.value!.away_team.name}`;
const isBreak = computed(
  () =>
    match.value?.current_period === "halftime" ||
    match.value?.current_period === "extra_time_halftime",
);
const matchDescription = `Resultado, eventos, formaciones y estadísticas de ${matchTitle}.`;
useSeoMeta({
  title: `${matchTitle} · Matchday`,
  description: matchDescription,
  ogTitle: matchTitle,
  ogDescription: matchDescription,
  ogType: "website",
  twitterTitle: matchTitle,
  twitterDescription: matchDescription,
});
</script>
<template>
  <main class="match-page">
    <AppBreadcrumbs :items="[{ label: 'Partidos', to: '/' }, { label: matchTitle }]" />
    <NuxtLink to="/" class="back-to-matches"
      ><AnimatedHeroIcon :icon="ArrowLeftIcon" motion="arrow" class="ui-icon" aria-hidden="true" />
      Volver a la jornada</NuxtLink
    >
    <div class="match-page-heading">
      <h1>{{ match.home_team.name }} <span>vs.</span> {{ match.away_team.name }}</h1>
      <p>Acta, alineaciones y estadísticas del encuentro</p>
      <ShareButton :title="matchTitle" :text="matchDescription" />
    </div>
    <p class="detail-date">
      {{
        new Date(match.scheduled_at).toLocaleDateString("es-CL", {
          timeZone: "America/Santiago",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      }}
      <template v-if="!isBreak"> · {{ time(match.scheduled_at) }}</template> · Santiago
    </p>
    <article class="match-card detail-summary" :class="{ 'is-live': match.status === 'live' }">
      <div class="card-top">
        <span class="match-status" :class="match.status"
          ><span v-if="match.status === 'live'" class="green-dot" />{{ matchState(match) }}</span
        >
      </div>
      <div class="fixture">
        <div class="team">
          <TeamBadge :name="match.home_team.name" :src="match.home_team.crest" />
          <h4>
            <NuxtLink :to="`/teams/${match.home_team.id}`">{{ match.home_team.name }}</NuxtLink>
          </h4>
        </div>
        <div class="score">
          <template v-if="match.status === 'scheduled'"
            ><strong class="kickoff">{{ time(match.scheduled_at) }}</strong></template
          ><template v-else
            ><strong
              >{{ match.home_team.score }} <em>–</em> {{ match.away_team.score }}</strong
            ></template
          >
        </div>
        <div class="team">
          <TeamBadge :name="match.away_team.name" :src="match.away_team.crest" />
          <h4>
            <NuxtLink :to="`/teams/${match.away_team.id}`">{{ match.away_team.name }}</NuxtLink>
          </h4>
        </div>
      </div>
      <div
        v-if="
          match.status !== 'scheduled' &&
          (match.home_team.goals.length || match.away_team.goals.length)
        "
        class="scorers"
        aria-label="Goleadores"
      >
        <ul class="scorers-home" :aria-label="`Goles de ${match.home_team.name}`">
          <li v-for="(goal, index) in match.home_team.goals" :key="index">
            {{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span>
          </li>
        </ul>
        <svg class="goal-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#f3f4f6" />
          <path
            d="m12 7 4.8 3.5-1.8 5.6H9l-1.8-5.6L12 7ZM8.5 2.6h7L14 5h-4L8.5 2.6ZM21.1 7.8l.8 6.6-2.7-1.1-1.1-3.6 3-1.9ZM17.9 20.1l-6.2 1.8.5-2.8 3.1-2.2 2.6 3.2ZM4.4 18.5l-2.3-6.1 2.8-.4 2.3 3.1-2.8 3.4ZM3.5 6.7l3.4-3.3.8 3-2.2 3-3-.5 1-2.2Z"
            fill="#222831"
          />
          <path
            d="m12 7 0-3m4.8 6.5 3.2 1m-5 4.6 1.3 3.2M9 16.1l-2 2.7m.2-8.3-2.6-1"
            fill="none"
            stroke="#222831"
            stroke-width=".65"
          />
        </svg>
        <ul class="scorers-away" :aria-label="`Goles de ${match.away_team.name}`">
          <li v-for="(goal, index) in match.away_team.goals" :key="index">
            {{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span>
          </li>
        </ul>
      </div>
      <ShootoutSummary
        v-if="match.shootout"
        :shootout="match.shootout"
        :home="match.home_team.name"
        :away="match.away_team.name"
        compact
      />
    </article>
    <NuxtLink :to="`/matches/manage/${match.id}`" class="back-to-matches">Operar partido</NuxtLink
    ><OperatedMatchReport v-if="operations[match.id]" :match-id="match.id" /><MatchDetail
      v-else
      :match="match"
    />
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .match-card {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .match-card .team,
html[data-theme="light"] .match-card .status,
html[data-theme="light"] .match-card .score,
html[data-theme="light"] .match-card .score {
  color: var(--text-color) !important;
}
html[data-theme="light"] .match-status {
  color: var(--muted) !important;
}
html[data-theme="light"] .match-card,
html[data-theme="light"] .match-card:hover,
html[data-theme="light"] .match-card.is-live {
  background: var(--panel-bg) !important;
  border-color: var(--border) !important;
  color: var(--text-color) !important;
}
html[data-theme="light"] .match-card .match-status,
html[data-theme="light"] .match-card .match-status.live,
html[data-theme="light"] .match-card .team h4,
html[data-theme="light"] .match-card .score strong,
html[data-theme="light"] .match-card .score em,
html[data-theme="light"] .match-card .score > span,
html[data-theme="light"] .scorers ul,
html[data-theme="light"] .scorers li span {
  color: var(--text-color) !important;
}
html[data-theme="light"] .match-card .score strong.kickoff,
html[data-theme="light"] .match-card .score em,
html[data-theme="light"] .match-card .match-status .green-dot,
html[data-theme="light"] .goal-icon {
  opacity: 1;
}
html[data-theme="light"] .match-card .score strong.kickoff {
  color: var(--muted) !important;
}
html[data-theme="light"] .match-card .crest {
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.08);
}
html[data-theme="light"] .match-card:hover {
  background: var(--surface) !important;
  border-color: var(--border) !important;
}
main,
.match-card,
.match-card .team,
.match-card .status,
.match-card .score {
  color: var(--text-color);
}
.green-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
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
.match-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition:
    border-color 0.18s,
    background 0.18s;
}
.match-card:hover {
  border-color: var(--ui-border, #49515d);
  background: var(--ui-hover, #161a21);
}
.match-card.is-live {
  border-top: 2px solid var(--ui-border, #91b95b);
}
.card-top {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 49px;
  padding: 12px 38px;
}
.match-status {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--ui-muted, #8f98a6);
}
.match-status.live {
  color: var(--accent);
}
.match-status .green-dot {
  width: 5px;
  height: 5px;
  box-shadow: 0 0 8px var(--ui-shadow, #bded7522);
}
.fixture {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px minmax(0, 1fr);
  align-items: start;
  gap: 2px;
  padding: 9px 15px 22px;
}
.team {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  min-width: 0;
}
.crest {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: var(--team-color);
  color: #fff;
  border: 2px solid rgb(255 255 255 / 80%);
  border-radius: 5px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
  box-shadow: none;
}
.team h4 {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  margin-top: 11px;
  max-width: 110px;
  color: var(--ui-text, #dce0e7);
}
.score {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 0;
  gap: 5px;
}
.score strong {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 43px;
  line-height: 1.15;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}
.score em {
  font-size: 24px;
  font-style: normal;
  color: var(--ui-muted, #626b79);
  font-weight: 400;
  vertical-align: 4px;
}
.match-card .score strong.kickoff {
  font-size: 22px;
  letter-spacing: 0;
  margin-top: 11px;
  transform: scaleY(1.15);
  transform-origin: center;
  color: var(--ui-text, #c2c9d4);
}
.score > span {
  font-size: 9px;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.scorers {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1fr);
  gap: 9px;
  padding: 0 20px 20px;
  align-items: start;
}
.scorers ul {
  min-height: 38px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ui-muted, #8f98a7);
  font-size: 10px;
  line-height: 1.9;
}
.scorers-home {
  text-align: right;
}
.scorers-away {
  text-align: left;
}
.scorers li {
  overflow-wrap: anywhere;
}
.scorers li span {
  white-space: nowrap;
  color: var(--ui-muted, #747f8e);
  font-variant-numeric: tabular-nums;
}
.goal-icon {
  display: block;
  width: 15px;
  height: 15px;
  margin: 2px auto 0;
  flex-shrink: 0;
}
@media (min-width: 1450px) {
  main {
    max-width: 1360px;
  }
  .fixture {
    padding-top: 15px;
    padding-bottom: 26px;
  }
  .match-card .score strong {
    font-size: 46px;
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
  .fixture {
    grid-template-columns: minmax(0, 1fr) 100px minmax(0, 1fr);
    padding: 10px 24px 23px;
  }
  .team h4 {
    font-size: 12px;
  }
  .score strong {
    font-size: 45px;
  }
  .scorers {
    padding: 0 26px 20px;
    gap: 12px;
  }
  .scorers ul {
    font-size: 11px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .match-card {
    transition: none;
  }
}
.match-card {
  border: 1px solid var(--ui-border, #303030);
  border-radius: 6px;
  background: var(--ui-surface, #1c1c1c);
  box-shadow: none;
  transition: border-color 0.15s;
}
.match-card.is-live {
  border-top: 1px solid var(--ui-border, #303030);
}
.match-card:hover {
  border-color: var(--ui-border, #505050);
  background: var(--ui-hover, #1c1c1c);
  box-shadow: none;
  transform: none;
}
.match-card .card-top {
  min-height: 53px;
}
.match-card .match-status {
  color: var(--ui-muted, #aaa);
}
.match-card .match-status.live {
  color: var(--ui-success, #c6d8b5);
  background: none;
  border: 0;
  border-radius: 0;
  padding: 0;
  font-size: 10px;
}
.match-card .match-status .green-dot {
  background: var(--ui-success, #99b57f);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .match-card {
    transition: none;
  }
}
.match-card {
  position: relative;
}
.match-card:focus-within {
  border-color: var(--ui-border, #686868);
}
.detail-date {
  text-align: center;
  margin: 16px 0;
}
.detail-summary {
  max-width: 620px;
  margin: 0 auto 30px;
}
.detail-summary .fixture {
  grid-template-columns: 1fr 110px 1fr;
}
.detail-summary .scorers {
  max-width: 450px;
  width: 100%;
  margin: auto;
}
.detail-summary .team h4 {
  max-width: none;
}
.detail-summary .score strong {
  font-size: 43px;
}
@media (max-width: 700px) {
  .detail-summary .fixture {
    padding-left: 10px;
    padding-right: 10px;
  }
  .detail-summary .team h4 {
    font-size: 11px;
  }
}

.ui-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}

.match-page {
  max-width: 1080px;
  padding-top: 26px;
  padding-bottom: 40px;
}
.back-to-matches {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--ui-muted, #aaa);
  font-size: 12px;
  padding: 8px 0;
}
.back-to-matches:hover {
  color: var(--ui-text, #fff);
}
.match-page-heading {
  position: relative;
  margin: 22px 0;
  padding: 0 132px;
  text-align: center;
}
.match-page-heading :deep(.share-control) {
  position: absolute;
  top: 8px;
  right: 0;
}
.match-page-heading :deep(.share-control small) {
  position: absolute;
  top: calc(100% + 7px);
  right: 0;
  white-space: nowrap;
}
.match-page-heading h1 {
  font-size: 24px;
  letter-spacing: -0.5px;
  line-height: 1.5;
}
.match-page-heading h1 span {
  color: var(--ui-muted, #888);
  font-size: 17px;
  font-weight: 400;
  margin: 0 7px;
}
.match-page-heading p {
  font-size: 10px;
  color: var(--ui-muted, #929292);
  margin-top: 5px;
}
.detail-date {
  font-size: 12px;
  color: var(--ui-muted, #999);
  text-align: center;
}
.detail-summary {
  max-width: 620px;
}
.detail-summary:hover {
  border-color: var(--ui-border, #303030);
}
@media (max-width: 700px) {
  .match-page {
    padding-top: 15px;
  }
  .match-page-heading h1 {
    font-size: 20px;
  }
  .match-page-heading {
    padding: 0 50px;
  }
  .match-page-heading :deep(.share-control) {
    top: 5px;
  }
  .match-page-heading :deep(.share-control button) {
    width: 42px;
    padding: 0;
  }
  .match-page-heading :deep(.share-control button span) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .detail-date {
    font-size: 10px;
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
