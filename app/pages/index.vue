<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue'
import { ArrowUpRightIcon, MagnifyingGlassIcon, StarIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'
import { matchState, goalMinute, goalLabel, time, initials, teamColor } from '../utils/matches'
const { today, matches } = useDemoMatches()
const selectedDate = useState('matchday-date', () => today.value)
watch(selectedDate, value => { if (!value) selectedDate.value = today.value })
const filter = useState('matchday-filter', () => 'all')
const search = useState('matchday-search', () => '')
const favoritesOnly = useState('matchday-favorites-only', () => false)
const favorites = useState<string[]>('matchday-favorites', () => [])

const tabs = [{ id: 'all', label: 'Todos' }, { id: 'live', label: 'En vivo' }, { id: 'scheduled', label: 'Próximos' }, { id: 'finished', label: 'Finalizados' }]
const dateTitle = computed(() => new Date(`${selectedDate.value}T12:00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }))
const dated = computed(() => matches.value.filter(m => new Date(m.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }) === selectedDate.value))
const visible = computed(() => dated.value.filter(m => (filter.value === 'all' || m.status === filter.value) && (!favoritesOnly.value || favorites.value.includes(m.id)) && `${m.home_team.name} ${m.away_team.name}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())).sort((a, b) => ({ live: 0, scheduled: 1, finished: 2 }[a.status] - { live: 0, scheduled: 1, finished: 2 }[b.status]) || a.scheduled_at.localeCompare(b.scheduled_at)))
const nextMatchDate = computed(() => matches.value
  .map(match => new Date(match.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }))
  .filter(date => date > selectedDate.value)
  .sort()[0])
function showMatchDate(date: string) {
  search.value = ''
  filter.value = 'all'
  favoritesOnly.value = false
  selectedDate.value = date
}
const liveCount = computed(() => dated.value.filter(m => m.status === 'live').length)
const favoriteToast = ref<{ id: string; title: string; teams: string; wasSaved: boolean } | null>(null)
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined
function pauseToast() { clearTimeout(toastTimer) }
function closeToast() { pauseToast(); toastVisible.value = false }
function clearToast() { if (!toastVisible.value) favoriteToast.value = null }
function resumeToast() { pauseToast(); toastTimer = setTimeout(closeToast, 3500) }
function persistFavorites() { try { localStorage.setItem('matchday-favorites', JSON.stringify(favorites.value)) } catch {} }
function toggleFavorite(id: string) {
  const wasSaved = favorites.value.includes(id)
  favorites.value = wasSaved ? favorites.value.filter(value => value !== id) : [...favorites.value, id]
  persistFavorites()
  const match = matches.value.find(item => item.id === id)!
  favoriteToast.value = { id, title: wasSaved ? 'Partido eliminado de favoritos' : '¡Partido guardado en favoritos!', teams: `${match.home_team.name} · ${match.away_team.name}`, wasSaved }
  toastVisible.value = true
  resumeToast()
}
function undoFavorite() {
  if (!favoriteToast.value) return
  const { id, wasSaved } = favoriteToast.value
  favorites.value = wasSaved ? [...new Set([...favorites.value, id])] : favorites.value.filter(value => value !== id)
  persistFavorites()
  closeToast()
}
onBeforeUnmount(pauseToast)

function previewGoals<T>(goals: T[]) { return goals.slice(0, 2) }
function remainingGoals(goals: unknown[]) { return Math.max(0, goals.length - 2) }

onMounted(() => { try { const stored = JSON.parse(localStorage.getItem('matchday-favorites') || '[]'); if (Array.isArray(stored)) favorites.value = stored.filter(v => typeof v === 'string') } catch {} })


useHead({ title: 'Matchday · La jornada' })
</script>
<template>
    <main>
      <section class="intro" aria-label="Tu centro de partidos">
        <div><span class="eyebrow">FÚTBOL. SIN DISTRACCIONES.</span><h1>El juego está aquí<span>.</span></h1><p>Todos los partidos. Toda la emoción.</p></div>
        <button class="live-summary" @click="filter = 'live'; favoritesOnly = false"><span class="green-dot" /><strong>{{ liveCount }}</strong><span>partidos en vivo</span><AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon" aria-hidden="true" /></button>
      </section>

      <section id="matches" class="matches-section" aria-labelledby="matches-title">
        <div class="section-heading"><div><h2 id="matches-title">{{ favoritesOnly ? 'Mis favoritos' : 'La jornada' }}<span class="count">{{ dated.length }}</span></h2></div><label class="search"><AnimatedHeroIcon :icon="MagnifyingGlassIcon" motion="lift" class="ui-icon" aria-hidden="true" /><input v-model="search" placeholder="Buscar un equipo…" aria-label="Buscar un equipo"></label></div>
        <MatchCalendar v-model="selectedDate" :today="today" :matches="matches" />
        <div class="filter-row"><div class="tabs" aria-label="Estado del partido"><button v-for="tab in tabs" :key="tab.id" :class="{ selected: filter === tab.id }" :aria-pressed="filter === tab.id" @click="filter = tab.id"><span v-if="tab.id === 'live'" class="green-dot" />{{ tab.label }}<span v-if="tab.id === 'live'" class="tab-count">{{ liveCount }}</span></button></div><span class="timezone">Hora de Santiago · GMT−3 / GMT−4</span></div>
        <div class="prototype-note"><span class="green-dot" /> Demo · Partidos y resultados ficticios</div>
        
        <div class="day-heading"><h3>{{ dateTitle }}</h3><span>{{ visible.length }} partidos</span></div>
        
        <div v-if="visible.length" class="match-grid">
          <article v-for="match in visible" :key="match.id" class="match-card" :class="{ 'is-live': match.status === 'live' }">
            <div class="card-top"><span class="match-status" :class="match.status"><span v-if="match.status === 'live'" class="green-dot" />{{ matchState(match) }}</span><button class="favorite" :class="{ saved: favorites.includes(match.id) }" :aria-label="`${favorites.includes(match.id) ? 'Quitar de' : 'Añadir a'} favoritos: ${match.home_team.name} contra ${match.away_team.name}`" :aria-pressed="favorites.includes(match.id)" @click="toggleFavorite(match.id)"><AnimatedHeroIcon :icon="favorites.includes(match.id) ? StarSolidIcon : StarIcon" motion="pop" :active="favorites.includes(match.id)" class="ui-icon" aria-hidden="true" /></button></div>
            <div class="fixture"><div class="team"><span class="crest" :style="{ '--team-color': teamColor(match.home_team.name) }">{{ initials(match.home_team.name) }}</span><h4>{{ match.home_team.name }}</h4></div><div class="score"><template v-if="match.status === 'scheduled'"><strong class="kickoff">{{ time(match.scheduled_at) }}</strong></template><template v-else><strong>{{ match.home_team.score }} <em>–</em> {{ match.away_team.score }}</strong><span v-if="match.home_team.penalty_score != null" class="penalty-score">Pen. {{ match.home_team.penalty_score }}–{{ match.away_team.penalty_score }}</span></template></div><div class="team"><span class="crest" :style="{ '--team-color': teamColor(match.away_team.name) }">{{ initials(match.away_team.name) }}</span><h4>{{ match.away_team.name }}</h4></div></div>
            <div v-if="match.status !== 'scheduled' && (match.home_team.goals.length || match.away_team.goals.length)" class="scorers" aria-label="Goleadores">
              <ul class="scorers-home" :aria-label="`Goles de ${match.home_team.name}`">
                <li v-for="(goal, index) in previewGoals(match.home_team.goals)" :key="index">{{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span></li>
                <li v-if="remainingGoals(match.home_team.goals)" class="more-goals">+{{ remainingGoals(match.home_team.goals) }} goles</li>
              </ul>
              <svg class="goal-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#f3f4f6"/>
                <path d="m12 7 4.8 3.5-1.8 5.6H9l-1.8-5.6L12 7ZM8.5 2.6h7L14 5h-4L8.5 2.6ZM21.1 7.8l.8 6.6-2.7-1.1-1.1-3.6 3-1.9ZM17.9 20.1l-6.2 1.8.5-2.8 3.1-2.2 2.6 3.2ZM4.4 18.5l-2.3-6.1 2.8-.4 2.3 3.1-2.8 3.4ZM3.5 6.7l3.4-3.3.8 3-2.2 3-3-.5 1-2.2Z" fill="#222831"/>
                <path d="m12 7 0-3m4.8 6.5 3.2 1m-5 4.6 1.3 3.2M9 16.1l-2 2.7m.2-8.3-2.6-1" fill="none" stroke="#222831" stroke-width=".65"/>
              </svg>
              <ul class="scorers-away" :aria-label="`Goles de ${match.away_team.name}`">
                <li v-for="(goal, index) in previewGoals(match.away_team.goals)" :key="index">{{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span></li>
                <li v-if="remainingGoals(match.away_team.goals)" class="more-goals">+{{ remainingGoals(match.away_team.goals) }} goles</li>
              </ul>
            </div>
            <NuxtLink class="match-open" :aria-label="`${match.status === 'scheduled' ? 'Ver previa' : 'Ver resumen'}: ${match.home_team.name} contra ${match.away_team.name}`" :to="`/matches/${match.id}`"><AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon open-indicator" aria-hidden="true" /></NuxtLink>
          
          </article>
        </div>
        <div v-else class="empty" role="status">
          <span class="empty-icon">◇</span>
          <h3>{{ !dated.length ? 'No hay partidos programados para este día' : 'No hay partidos con estos filtros' }}</h3>
          <p>{{ !dated.length ? (nextMatchDate ? 'Puedes ir a la próxima jornada con partidos o elegir otra fecha.' : 'Elige otra fecha para consultar sus partidos.') : 'Cambia los filtros o borra la búsqueda para ver los encuentros de esta jornada.' }}</p>
          <button v-if="!dated.length && nextMatchDate" @click="showMatchDate(nextMatchDate)">Ir a la próxima jornada con partidos <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" /></button>
          <button v-else-if="dated.length" @click="showMatchDate(selectedDate)">Ver todos los partidos del día <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" /></button>
          <button v-else-if="selectedDate !== today" @click="showMatchDate(today)">Volver a hoy <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" /></button>
        </div>
        <div class="end-note"><span class="green-dot" />Cada encuentro tiene algo que contar<span class="end-line" /></div>
      </section>

      <Teleport to="body">
        <div class="favorite-toast-region" aria-live="polite" aria-atomic="true">
          <TransitionRoot as="template" :show="toastVisible" enter="toast-slide-enter" enter-from="toast-slide-hidden" enter-to="toast-slide-visible" leave="toast-slide-leave" leave-from="toast-slide-visible" leave-to="toast-slide-hidden" @after-leave="clearToast">
            <div class="favorite-toast" @mouseenter="pauseToast" @mouseleave="resumeToast" @focusin="pauseToast" @focusout="resumeToast">
              <CheckCircleIcon class="toast-check" aria-hidden="true" />
              <div class="toast-message"><strong>{{ favoriteToast?.title }}</strong><span>{{ favoriteToast?.teams }}</span></div>
              <button class="toast-undo" @click="undoFavorite">Deshacer</button>
              <button class="toast-close" aria-label="Cerrar aviso" @click="closeToast"><XMarkIcon aria-hidden="true" /></button>
            </div>
          </TransitionRoot>
        </div>
      </Teleport>
    </main>
</template>

<style scoped>
.favorite-toast-region{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:100;width:max-content;max-width:calc(100vw - 32px);pointer-events:none}.favorite-toast{display:flex;align-items:center;gap:14px;padding:17px 18px;background:#222724;border:1px solid #4a6653;border-radius:10px;box-shadow:0 10px 40px #0006;pointer-events:auto}.toast-check{width:25px;height:25px;flex-shrink:0;color:#9ddeae}.toast-message{display:flex;flex-direction:column;gap:5px;min-width:0}.toast-message strong{font-size:12px;font-weight:500;color:#f1f3f1}.toast-message span{font-size:10px;color:#a5b0a7}.toast-undo{font-size:11px;color:#b8edc6;padding:8px;text-decoration:underline;text-underline-offset:3px}.toast-close{padding:6px;color:#9da69f}.toast-close svg{width:17px;height:17px}@media(max-width:600px){.favorite-toast-region{bottom:calc(16px + env(safe-area-inset-bottom));width:calc(100vw - 24px);max-width:none}.favorite-toast{padding:14px 12px;gap:9px}.toast-message{flex:1}.toast-message strong{font-size:11px}.toast-message span{font-size:9px}.toast-undo{padding:6px;font-size:10px}}

:global(.toast-slide-enter){transition:transform .2s cubic-bezier(.16,1,.3,1),opacity .16s ease}
:global(.toast-slide-leave){transition:transform .16s cubic-bezier(.4,0,1,1),opacity .12s ease}
:global(.toast-slide-hidden){transform:translateY(calc(100% + 40px));opacity:0}
:global(.toast-slide-visible){transform:translateY(0);opacity:1}

</style>


