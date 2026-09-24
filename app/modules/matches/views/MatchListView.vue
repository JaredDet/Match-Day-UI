<script setup lang="ts">
import MatchCalendar from "~/modules/matches/components/MatchCalendar.vue";
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue";
import { useMatches } from "~/modules/matches/composables/useMatches";

import { TransitionRoot } from "@headlessui/vue";
import {
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/vue/24/solid";
import { matchState, goalMinute, goalLabel, time } from "~/modules/matches/utils/matches";
import { initials, teamColor } from "~/modules/teams/utils/identity";
const { today, matches } = useMatches();
const selectedDate = useState("matchday-date", () => today.value);
watch(selectedDate, (value) => {
  if (!value) selectedDate.value = today.value;
});
const filter = useState("matchday-filter", () => "all");
const search = useState("matchday-search", () => "");
const favoritesOnly = useState("matchday-favorites-only", () => false);
const favorites = useState<string[]>("matchday-favorites", () => []);
const route = useRoute();
watch(
  () => route.query.view,
  (view) => {
    favoritesOnly.value = view === "favorites";
    if (favoritesOnly.value) filter.value = "all";
  },
  { immediate: true },
);

const tabs = [
  { id: "all", label: "Todos" },
  { id: "live", label: "En vivo" },
  { id: "scheduled", label: "Próximos" },
  { id: "finished", label: "Finalizados" },
];
const dateTitle = computed(() =>
  new Date(`${selectedDate.value}T12:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }),
);
const dated = computed(() =>
  matches.value.filter(
    (m) =>
      new Date(m.scheduled_at).toLocaleDateString("en-CA", {
        timeZone: "America/Santiago",
      }) === selectedDate.value,
  ),
);
const visible = computed(() =>
  (favoritesOnly.value ? matches.value : dated.value)
    .filter(
      (m) =>
        (filter.value === "all" || m.status === filter.value) &&
        (!favoritesOnly.value || favorites.value.includes(m.id)) &&
        `${m.home_team.name} ${m.away_team.name}`
          .toLocaleLowerCase()
          .includes(search.value.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      favoritesOnly.value
        ? favorites.value.indexOf(b.id) - favorites.value.indexOf(a.id)
        : { live: 0, scheduled: 1, finished: 2 }[a.status] -
            { live: 0, scheduled: 1, finished: 2 }[b.status] ||
          a.scheduled_at.localeCompare(b.scheduled_at),
    ),
);
function favoriteDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Santiago",
  });
}
const nextMatchDate = computed(
  () =>
    matches.value
      .map((match) =>
        new Date(match.scheduled_at).toLocaleDateString("en-CA", {
          timeZone: "America/Santiago",
        }),
      )
      .filter((date) => date > selectedDate.value)
      .sort()[0],
);
function showMatchDate(date: string) {
  search.value = "";
  filter.value = "all";
  favoritesOnly.value = false;
  if (route.query.view) navigateTo({ path: "/" });
  selectedDate.value = date;
}
const liveCount = computed(() => dated.value.filter((m) => m.status === "live").length);
const favoriteToast = ref<{
  id: string;
  title: string;
  teams: string;
  wasSaved: boolean;
} | null>(null);
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | undefined;
function pauseToast() {
  clearTimeout(toastTimer);
}
function closeToast() {
  pauseToast();
  toastVisible.value = false;
}
function clearToast() {
  if (!toastVisible.value) favoriteToast.value = null;
}
function resumeToast() {
  pauseToast();
  toastTimer = setTimeout(closeToast, 3500);
}
function persistFavorites() {
  try {
    localStorage.setItem("matchday-favorites", JSON.stringify(favorites.value));
  } catch {}
}
function toggleFavorite(id: string) {
  const wasSaved = favorites.value.includes(id);
  favorites.value = wasSaved
    ? favorites.value.filter((value) => value !== id)
    : [...favorites.value, id];
  persistFavorites();
  const match = matches.value.find((item) => item.id === id)!;
  favoriteToast.value = {
    id,
    title: wasSaved ? "Partido eliminado de favoritos" : "¡Partido guardado en favoritos!",
    teams: `${match.home_team.name} · ${match.away_team.name}`,
    wasSaved,
  };
  toastVisible.value = true;
  resumeToast();
}
function undoFavorite() {
  if (!favoriteToast.value) return;
  const { id, wasSaved } = favoriteToast.value;
  favorites.value = wasSaved
    ? [...new Set([...favorites.value, id])]
    : favorites.value.filter((value) => value !== id);
  persistFavorites();
  closeToast();
}
onBeforeUnmount(pauseToast);

function previewGoals<T>(goals: T[]) {
  return goals.slice(0, 2);
}
function remainingGoals(goals: unknown[]) {
  return Math.max(0, goals.length - 2);
}

onMounted(() => {
  try {
    const stored = JSON.parse(localStorage.getItem("matchday-favorites") || "[]");
    if (Array.isArray(stored)) favorites.value = stored.filter((v) => typeof v === "string");
  } catch {}
});

useHead({ title: "Matchday · La jornada" });
</script>
<template>
  <main :class="{ 'favorites-page': favoritesOnly }">
    <section class="intro" aria-label="Tu centro de partidos">
      <div>
        <span class="eyebrow">{{
          favoritesOnly ? "TU SELECCIÓN" : "FÚTBOL. SIN DISTRACCIONES."
        }}</span>
        <h1>{{ favoritesOnly ? "Partidos que sigues" : "El juego está aquí" }}<span>.</span></h1>
        <p>
          {{
            favoritesOnly
              ? "Tus encuentros guardados, reunidos en un solo lugar."
              : "Todos los partidos. Toda la emoción."
          }}
        </p>
      </div>
      <button
        v-if="!favoritesOnly"
        class="live-summary"
        @click="
          filter = 'live';
          favoritesOnly = false;
        "
      >
        <span class="green-dot" /><strong>{{ liveCount }}</strong
        ><span>partidos en vivo</span
        ><AnimatedHeroIcon
          :icon="ArrowUpRightIcon"
          motion="arrow"
          class="ui-icon"
          aria-hidden="true"
        />
      </button>
    </section>

    <section id="matches" class="matches-section" aria-labelledby="matches-title">
      <div class="section-heading">
        <div>
          <h2 id="matches-title">
            {{ favoritesOnly ? "Mis favoritos" : "La jornada"
            }}<span class="count">{{ visible.length }}</span>
          </h2>
        </div>
        <label class="search"
          ><AnimatedHeroIcon
            :icon="MagnifyingGlassIcon"
            motion="lift"
            class="ui-icon"
            aria-hidden="true" /><input
            v-model="search"
            placeholder="Buscar un equipo…"
            aria-label="Buscar un equipo"
        /></label>
      </div>
      <MatchCalendar
        v-if="!favoritesOnly"
        v-model="selectedDate"
        :today="today"
        :matches="matches"
      />
      <div v-if="!favoritesOnly" class="filter-row">
        <div class="tabs" aria-label="Estado del partido">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ selected: filter === tab.id }"
            :aria-pressed="filter === tab.id"
            @click="filter = tab.id"
          >
            <span v-if="tab.id === 'live'" class="green-dot" />{{ tab.label
            }}<span v-if="tab.id === 'live'" class="tab-count">{{ liveCount }}</span>
          </button>
        </div>
        <span class="timezone">Hora de Santiago · GMT−3 / GMT−4</span>
      </div>
      <div v-if="!favoritesOnly" class="prototype-note">
        <span class="green-dot" /> Demo · Partidos y resultados ficticios
      </div>
      <div v-else class="favorites-summary">
        <StarSolidIcon aria-hidden="true" />
        <div>
          <strong>{{ favorites.length }}</strong
          ><span>{{ favorites.length === 1 ? "partido guardado" : "partidos guardados" }}</span>
        </div>
        <button @click="showMatchDate(selectedDate)">Explorar la jornada</button>
      </div>

      <div class="day-heading">
        <h3>{{ favoritesOnly ? "Guardados recientemente" : dateTitle }}</h3>
        <span>{{ visible.length }} partidos</span>
      </div>

      <div v-if="visible.length" class="match-grid">
        <article
          v-for="match in visible"
          :key="match.id"
          class="match-card"
          :class="{ 'is-live': match.status === 'live' }"
        >
          <div class="card-top">
            <span class="match-status" :class="match.status"
              ><span v-if="match.status === 'live'" class="green-dot" />{{
                matchState(match)
              }}</span
            ><button
              class="favorite"
              :class="{ saved: favorites.includes(match.id) }"
              :aria-label="`${favorites.includes(match.id) ? 'Quitar de' : 'Añadir a'} favoritos: ${match.home_team.name} contra ${match.away_team.name}`"
              :aria-pressed="favorites.includes(match.id)"
              @click="toggleFavorite(match.id)"
            >
              <AnimatedHeroIcon
                :icon="favorites.includes(match.id) ? StarSolidIcon : StarIcon"
                motion="pop"
                :active="favorites.includes(match.id)"
                class="ui-icon"
                aria-hidden="true"
              />
            </button>
            <time v-if="favoritesOnly" class="favorite-date" :datetime="match.scheduled_at">
              {{ favoriteDate(match.scheduled_at) }} · {{ time(match.scheduled_at) }}
            </time>
          </div>
          <div class="fixture">
            <div class="team">
              <TeamBadge :name="match.home_team.name" :src="match.home_team.crest" />
              <h4>{{ match.home_team.name }}</h4>
            </div>
            <div class="score">
              <template v-if="match.status === 'scheduled'"
                ><strong class="kickoff">{{ time(match.scheduled_at) }}</strong></template
              ><template v-else
                ><strong>{{ match.home_team.score }} <em>–</em> {{ match.away_team.score }}</strong
                ><span v-if="match.home_team.penalty_score != null" class="penalty-score"
                  >Pen. {{ match.home_team.penalty_score }}–{{
                    match.away_team.penalty_score
                  }}</span
                ></template
              >
            </div>
            <div class="team">
              <TeamBadge :name="match.away_team.name" :src="match.away_team.crest" />
              <h4>{{ match.away_team.name }}</h4>
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
              <li v-for="(goal, index) in previewGoals(match.home_team.goals)" :key="index">
                {{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span>
              </li>
              <li v-if="remainingGoals(match.home_team.goals)" class="more-goals">
                +{{ remainingGoals(match.home_team.goals) }} goles
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
              <li v-for="(goal, index) in previewGoals(match.away_team.goals)" :key="index">
                {{ goalLabel(goal) }} <span>{{ goalMinute(goal) }}</span>
              </li>
              <li v-if="remainingGoals(match.away_team.goals)" class="more-goals">
                +{{ remainingGoals(match.away_team.goals) }} goles
              </li>
            </ul>
          </div>
          <NuxtLink
            class="match-open"
            :aria-label="`${match.status === 'scheduled' ? 'Ver previa' : 'Ver resumen'}: ${match.home_team.name} contra ${match.away_team.name}`"
            :to="`/matches/${match.id}`"
            ><AnimatedHeroIcon
              :icon="ArrowUpRightIcon"
              motion="arrow"
              class="ui-icon open-indicator"
              aria-hidden="true"
          /></NuxtLink>
        </article>
      </div>
      <div v-else class="empty" role="status">
        <span class="empty-icon">◇</span>
        <h3>
          {{
            favoritesOnly && !favorites.length
              ? "Todavía no guardas partidos"
              : !dated.length
                ? "No hay partidos programados para este día"
                : "No hay partidos con estos filtros"
          }}
        </h3>
        <p>
          {{
            favoritesOnly && !favorites.length
              ? "Usa la estrella de un partido para encontrarlo luego en esta sección."
              : !dated.length
                ? nextMatchDate
                  ? "Puedes ir a la próxima jornada con partidos o elegir otra fecha."
                  : "Elige otra fecha para consultar sus partidos."
                : "Cambia los filtros o borra la búsqueda para ver los encuentros de esta jornada."
          }}
        </p>
        <button v-if="favoritesOnly" @click="showMatchDate(selectedDate)">
          Ver todos los partidos
        </button>
        <button v-else-if="!dated.length && nextMatchDate" @click="showMatchDate(nextMatchDate)">
          Ir a la próxima jornada con partidos
          <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" />
        </button>
        <button v-else-if="dated.length" @click="showMatchDate(selectedDate)">
          Ver todos los partidos del día
          <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" />
        </button>
        <button v-else-if="selectedDate !== today" @click="showMatchDate(today)">
          Volver a hoy
          <AnimatedHeroIcon :icon="ArrowUpRightIcon" motion="arrow" class="ui-icon inline-icon" />
        </button>
      </div>
      <div class="end-note">
        <span class="green-dot" />Cada encuentro tiene algo que contar<span class="end-line" />
      </div>
    </section>

    <Teleport to="body">
      <div class="favorite-toast-region" aria-live="polite" aria-atomic="true">
        <TransitionRoot
          as="template"
          :show="toastVisible"
          enter="toast-slide-enter"
          enter-from="toast-slide-hidden"
          enter-to="toast-slide-visible"
          leave="toast-slide-leave"
          leave-from="toast-slide-visible"
          leave-to="toast-slide-hidden"
          @after-leave="clearToast"
        >
          <div
            class="favorite-toast"
            @mouseenter="pauseToast"
            @mouseleave="resumeToast"
            @focusin="pauseToast"
            @focusout="resumeToast"
          >
            <CheckCircleIcon class="toast-check" aria-hidden="true" />
            <div class="toast-message">
              <strong>{{ favoriteToast?.title }}</strong
              ><span>{{ favoriteToast?.teams }}</span>
            </div>
            <button class="toast-undo" @click="undoFavorite">Deshacer</button>
            <button class="toast-close" aria-label="Cerrar aviso" @click="closeToast">
              <XMarkIcon aria-hidden="true" />
            </button>
          </div>
        </TransitionRoot>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
html[data-theme="light"] main,
html[data-theme="light"] .match-card,
html[data-theme="light"] .match-grid,
html[data-theme="light"] .search,
html[data-theme="light"] .count,
html[data-theme="light"] .live-summary,
html[data-theme="light"] .tabs button {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .match-card .team,
html[data-theme="light"] .match-card .status,
html[data-theme="light"] .match-card .score,
html[data-theme="light"] .search input,
html[data-theme="light"] .match-card .score {
  color: var(--text-color) !important;
}
html[data-theme="light"] .timezone,
html[data-theme="light"] .intro p,
html[data-theme="light"] .day-heading > span,
html[data-theme="light"] .match-status {
  color: var(--muted) !important;
}
html[data-theme="light"] .match-card,
html[data-theme="light"] .match-card:hover,
html[data-theme="light"] .match-card.is-live,
html[data-theme="light"] .empty {
  background: var(--panel-bg) !important;
  border-color: var(--border) !important;
  color: var(--text-color) !important;
}
html[data-theme="light"] .match-card .match-status,
html[data-theme="light"] .match-card .match-status.live,
html[data-theme="light"] .match-card .favorite,
html[data-theme="light"] .match-card .team h4,
html[data-theme="light"] .match-card .score strong,
html[data-theme="light"] .match-card .score em,
html[data-theme="light"] .match-card .score > span,
html[data-theme="light"] .scorers ul,
html[data-theme="light"] .scorers li span,
html[data-theme="light"] .end-note {
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
.search,
.search input,
.match-card .team,
.match-card .status,
.match-card .score,
.live-summary,
.count,
.tabs button {
  color: var(--text-color);
}
button:hover {
  color: var(--accent);
}
.green-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-fill);
  flex-shrink: 0;
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
}
.intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 47px 0 37px;
}
.favorites-page .intro {
  position: relative;
  overflow: hidden;
  min-height: 250px;
  background:
    radial-gradient(
      circle at 88% 30%,
      color-mix(in srgb, var(--accent) 24%, transparent),
      transparent 32%
    ),
    linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 82%, var(--accent)));
}
.favorites-page .intro::after {
  content: "★";
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-52%) rotate(8deg);
  color: color-mix(in srgb, var(--accent) 18%, transparent);
  font-size: clamp(120px, 18vw, 240px);
  line-height: 1;
}
.favorites-summary {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  margin: 24px 0 30px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.favorites-summary > svg {
  width: 28px;
  color: var(--accent);
}
.favorites-summary div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.favorites-summary strong {
  font-size: 24px;
  color: var(--accent);
}
.favorites-summary span {
  color: var(--muted);
}
.favorites-page .match-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}
.favorites-page .match-card {
  display: grid;
  grid-template-columns: minmax(190px, 0.4fr) 1fr;
  align-items: stretch;
  min-height: 170px;
  border-left: 3px solid var(--accent);
}
.favorites-page .match-card .card-top {
  grid-column: 1;
  grid-row: 1 / span 2;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  border-right: 1px solid var(--border);
}
.favorites-page .match-card .fixture {
  grid-column: 2;
  padding: 26px 36px;
}
.favorites-page .match-card .scorers {
  grid-column: 2;
}
.favorite-date {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
  text-transform: capitalize;
}
@media (max-width: 700px) {
  .favorites-page .match-card {
    display: block;
  }
  .favorites-page .match-card .card-top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-right: 0;
  }
  .favorites-summary {
    grid-template-columns: auto 1fr;
  }
  .favorites-summary > button {
    grid-column: 1 / -1;
  }
}
.eyebrow {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--accent);
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
.intro p {
  font-size: 13px;
  color: var(--muted);
}
.live-summary {
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid var(--ui-border, #35422c);
  background: var(--ui-surface, #161e14);
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--ui-text, #b6c7a5);
}
.live-summary strong {
  font-size: 22px;
  color: var(--accent);
  font-family: "Barlow Condensed", sans-serif;
}
.live-summary > span:last-child {
  margin-left: 15px;
  font-size: 19px;
  color: var(--accent);
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 21px;
}
h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  font-size: 10px;
  padding: 3px 6px;
  background: var(--ui-surface, #1d2129);
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 5px;
  letter-spacing: 0;
}
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  background: var(--ui-surface, #101218);
  border-radius: 6px;
  padding: 10px 12px;
  width: 250px;
}
.search svg {
  width: 16px;
  height: 16px;
  color: var(--ui-muted, #79818f);
}
.search input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: none;
  color: var(--ui-text, #eceef2);
  font-size: 11px;
  outline: none;
}
.search input::placeholder {
  color: var(--ui-muted, #7e8593);
}
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  margin-top: 20px;
  gap: 15px;
}
.tabs {
  display: flex;
  gap: 24px;
}
.tabs button {
  padding: 13px 0 17px;
  position: relative;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--ui-muted, #979eaa);
}
.tabs button.selected {
  color: var(--ui-text, #f4f6f9);
}
.tabs button.selected:after {
  content: "";
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: var(--accent-fill);
  left: 0;
  right: 0;
}
.tab-count {
  font-size: 9px;
  background: var(--ui-surface, #26321d);
  color: var(--accent);
  padding: 2px 5px;
  border-radius: 4px;
}
.timezone {
  font-size: 9px;
  color: var(--ui-muted, #7d8593);
}
.prototype-note {
  font-size: 9px;
  color: var(--ui-muted, #757e8d);
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.prototype-note .green-dot {
  width: 4px;
  height: 4px;
  background: var(--ui-border, #757e8d);
}
.day-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0 16px;
}
.day-heading h3 {
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--ui-text, #c9ced7);
}
.day-heading > span {
  font-size: 10px;
  color: var(--ui-muted, #7d8593);
}
.match-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
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
.favorite {
  position: absolute;
  right: 12px;
  top: 11px;
  font-size: 21px;
  padding: 3px;
  color: var(--ui-muted, #737d8a);
  line-height: 1;
}
.favorite.saved {
  color: var(--accent);
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
.scorers li.more-goals {
  color: var(--accent);
  font-size: 9px;
}
.goal-icon {
  display: block;
  width: 15px;
  height: 15px;
  margin: 2px auto 0;
  flex-shrink: 0;
}
.end-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  color: var(--ui-muted, #747d8a);
  margin: 27px 0 46px;
}
.end-note .green-dot {
  width: 4px;
  height: 4px;
  background: var(--ui-success, #687b55);
}
.end-line {
  height: 1px;
  background: var(--border);
  flex: 1;
  margin-left: 8px;
}
.empty {
  text-align: center;
  background: var(--surface);
  border: 1px dashed var(--ui-border, #333b46);
  border-radius: 9px;
  padding: 48px 20px;
}
.empty-icon {
  font-size: 35px;
  color: var(--accent);
}
.empty h3 {
  font-size: 17px;
  margin: 12px 0;
}
.empty p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.8;
}
.empty button {
  margin-top: 20px;
  background: var(--accent-fill);
  color: var(--ui-muted, #243018);
  border-radius: 5px;
  padding: 10px 14px;
  font-size: 11px;
}
@media (min-width: 1450px) {
  main {
    max-width: 1360px;
  }
  .intro {
    padding-top: 55px;
    padding-bottom: 42px;
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
  .match-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  main {
    padding: 0 18px;
  }
  .intro {
    padding: 30px 0 28px;
    gap: 18px;
    align-items: flex-start;
    flex-direction: column;
  }
  h1 {
    font-size: 34px;
    margin: 8px 0;
  }
  .eyebrow {
    font-size: 8px;
  }
  .intro p {
    font-size: 12px;
  }
  .live-summary {
    padding: 8px 12px;
    gap: 8px;
    font-size: 10px;
  }
  .live-summary strong {
    font-size: 18px;
  }
  .live-summary > span:last-child {
    font-size: 15px;
    margin-left: 7px;
  }
  .section-heading {
    gap: 12px;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 19px;
  }
  .search {
    width: 170px;
    padding: 9px 10px;
  }
  .search input {
    font-size: 10px;
  }
  .filter-row {
    display: block;
    margin-top: 14px;
  }
  .tabs {
    justify-content: space-between;
    gap: 12px;
  }
  .tabs button {
    font-size: 10px;
    padding-bottom: 13px;
  }
  .timezone {
    display: none;
  }
  .day-heading {
    margin: 22px 0 14px;
  }
  .match-grid {
    grid-template-columns: 1fr;
    gap: 14px;
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
  .end-note {
    margin-bottom: 30px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .match-card {
    transition: none;
  }
}
.score > span.penalty-score {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--ui-success-soft, #bded7512);
  white-space: nowrap;
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
.match-open {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  z-index: 1;
}
.match-open:focus-visible {
  outline: 2px solid var(--ui-border, #b3b8bf);
  outline-offset: 3px;
}
.match-card .favorite {
  z-index: 2;
}
.open-indicator {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: var(--ui-muted, #858585);
  font-size: 14px;
  opacity: 0.55;
  transition: opacity 0.15s;
}
.match-open:hover .open-indicator,
.match-open:focus-visible .open-indicator {
  opacity: 1;
  color: var(--ui-text, #ddd);
}
.match-card:focus-within {
  border-color: var(--ui-border, #686868);
}
@media (prefers-reduced-motion: reduce) {
  .open-indicator {
    transition: none;
  }
}

.ui-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}
.inline-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
}
.favorite .ui-icon {
  width: 20px;
  height: 20px;
}
.ui-icon.open-indicator {
  width: 15px;
  height: 15px;
}
.match-grid .match-card {
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}
.match-grid .match-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px var(--ui-shadow, #0003);
}
.match-grid .match-card:active {
  transform: translateY(-1px);
}

.favorite-toast-region {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: max-content;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}
.favorite-toast {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 18px;
  background: var(--ui-surface, #222724);
  border: 1px solid var(--ui-border, #4a6653);
  border-radius: 10px;
  box-shadow: 0 10px 40px var(--ui-shadow, #0006);
  pointer-events: auto;
}
.toast-check {
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  color: var(--ui-success, #9ddeae);
}
.toast-message {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.toast-message strong {
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text, #f1f3f1);
}
.toast-message span {
  font-size: 10px;
  color: var(--ui-muted, #a5b0a7);
}
.toast-undo {
  font-size: 11px;
  color: var(--ui-success, #b8edc6);
  padding: 8px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.toast-close {
  padding: 6px;
  color: var(--ui-muted, #9da69f);
}
.toast-close svg {
  width: 17px;
  height: 17px;
}
@media (max-width: 600px) {
  .favorite-toast-region {
    bottom: calc(16px + env(safe-area-inset-bottom));
    width: calc(100vw - 24px);
    max-width: none;
  }
  .favorite-toast {
    padding: 14px 12px;
    gap: 9px;
  }
  .toast-message {
    flex: 1;
  }
  .toast-message strong {
    font-size: 11px;
  }
  .toast-message span {
    font-size: 9px;
  }
  .toast-undo {
    padding: 6px;
    font-size: 10px;
  }
}

.toast-slide-enter {
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.16s ease;
}
.toast-slide-leave {
  transition:
    transform 0.16s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.12s ease;
}
.toast-slide-hidden {
  transform: translateY(calc(100% + 40px));
  opacity: 0;
}
.toast-slide-visible {
  transform: translateY(0);
  opacity: 1;
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
