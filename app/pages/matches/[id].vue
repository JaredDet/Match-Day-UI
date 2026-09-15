<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { matchState, goalMinute, goalLabel, time, initials, teamColor } from '../../utils/matches'
definePageMeta({ key: route => route.params.id as string })
const route = useRoute()
const { matches } = useDemoMatches()
const match = matches.value.find(item => item.id === route.params.id)
if (!match) throw createError({ statusCode: 404, statusMessage: 'Partido no encontrado' })
useHead({ title: `${match.home_team.name} vs. ${match.away_team.name} · Matchday` })
</script>
<template>
  <main class="match-page">
    <NuxtLink to="/" class="back-to-matches"><AnimatedHeroIcon :icon="ArrowLeftIcon" motion="arrow" class="ui-icon" aria-hidden="true" /> Volver a la jornada</NuxtLink>
    <div class="match-page-heading"><h1>{{ match.home_team.name }} <span>vs.</span> {{ match.away_team.name }}</h1><p>Vista de demostración · Datos ficticios</p></div>
        <p class="detail-date">{{ new Date(match.scheduled_at).toLocaleDateString('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'long', year: 'numeric' }) }} · {{ time(match.scheduled_at) }} · Santiago</p>
        <article class="match-card detail-summary" :class="{ 'is-live': match.status === 'live' }">
            <div class="card-top"><span class="match-status" :class="match.status"><span v-if="match.status === 'live'" class="green-dot" />{{ matchState(match) }}</span></div>
            <div class="fixture"><div class="team"><span class="crest" :style="{ '--team-color': teamColor(match.home_team.name) }">{{ initials(match.home_team.name) }}</span><h4>{{ match.home_team.name }}</h4></div><div class="score"><template v-if="match.status === 'scheduled'"><strong class="kickoff">{{ time(match.scheduled_at) }}</strong></template><template v-else><strong>{{ match.home_team.score }} <em>–</em> {{ match.away_team.score }}</strong></template></div><div class="team"><span class="crest" :style="{ '--team-color': teamColor(match.away_team.name) }">{{ initials(match.away_team.name) }}</span><h4>{{ match.away_team.name }}</h4></div></div>
            <div v-if="match.status !== 'scheduled' && (match.home_team.goals.length || match.away_team.goals.length)" class="scorers" aria-label="Goleadores">
              <ul class="scorers-home" :aria-label="`Goles de ${match.home_team.name}`">
                <li v-for="(goal, index) in match.home_team.goals" :key="index">{{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span></li>
              </ul>
              <svg class="goal-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#f3f4f6"/>
                <path d="m12 7 4.8 3.5-1.8 5.6H9l-1.8-5.6L12 7ZM8.5 2.6h7L14 5h-4L8.5 2.6ZM21.1 7.8l.8 6.6-2.7-1.1-1.1-3.6 3-1.9ZM17.9 20.1l-6.2 1.8.5-2.8 3.1-2.2 2.6 3.2ZM4.4 18.5l-2.3-6.1 2.8-.4 2.3 3.1-2.8 3.4ZM3.5 6.7l3.4-3.3.8 3-2.2 3-3-.5 1-2.2Z" fill="#222831"/>
                <path d="m12 7 0-3m4.8 6.5 3.2 1m-5 4.6 1.3 3.2M9 16.1l-2 2.7m.2-8.3-2.6-1" fill="none" stroke="#222831" stroke-width=".65"/>
              </svg>
              <ul class="scorers-away" :aria-label="`Goles de ${match.away_team.name}`">
                <li v-for="(goal, index) in match.away_team.goals" :key="index">{{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span></li>
              </ul>
            </div>
        <ShootoutSummary v-if="match.shootout" :shootout="match.shootout" :home="match.home_team.name" :away="match.away_team.name" compact />
          </article>
        <MatchDetail :match="match" />
  </main>
</template>
<style scoped>
.match-page{max-width:1080px;padding-top:26px;padding-bottom:40px}.back-to-matches{display:inline-flex;align-items:center;gap:9px;color:#aaa;font-size:12px;padding:8px 0}.back-to-matches:hover{color:#fff}.match-page-heading{margin:22px 0;text-align:center}.match-page-heading h1{font-size:24px;letter-spacing:-.5px;line-height:1.5}.match-page-heading h1 span{color:#888;font-size:17px;font-weight:400;margin:0 7px}.match-page-heading p{font-size:10px;color:#929292;margin-top:5px}.detail-date{font-size:12px;color:#999;text-align:center}.detail-summary{max-width:620px}.detail-summary:hover{border-color:#303030}
@media(max-width:700px){.match-page{padding-top:15px}.match-page-heading h1{font-size:20px}.detail-date{font-size:10px}}
</style>
