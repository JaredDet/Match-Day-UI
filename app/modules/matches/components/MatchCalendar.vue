<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { calendarDateKey, calendarMonthDays } from "~/modules/matches/utils/calendar";
import { time, type Match } from "~/modules/matches/utils/matches";
const props = defineProps<{
  modelValue: string;
  today: string;
  matches: Match[];
}>();
const emit = defineEmits<{ "update:modelValue": [date: string] }>();
const view = ref<"days" | "months" | "years">("days");
const cursor = ref(new Date(`${props.modelValue}T12:00:00`));
const focusDate = ref(props.modelValue);
const weekCursor = ref(props.modelValue);
const weekDays = computed(() => {
  const start = new Date(`${weekCursor.value}T12:00:00`);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: calendarDateKey(date),
      day: date.getDate(),
      weekday: date.toLocaleDateString("es", { weekday: "short" }),
    };
  });
});
function moveWeek(amount: number) {
  const date = new Date(`${weekCursor.value}T12:00:00`);
  date.setDate(date.getDate() + amount * 7);
  weekCursor.value = calendarDateKey(date);
}
watch(
  () => props.modelValue,
  (value) => {
    weekCursor.value = value;
  },
);
const hovered = ref<string | null>(null);
const yearStart = ref(cursor.value.getFullYear() - 5);
const panel = useTemplateRef<HTMLElement>("calendarPanel");
const months = Array.from({ length: 12 }, (_, i) =>
  new Date(2026, i, 1).toLocaleDateString("es", { month: "long" }),
);
const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const days = computed(() =>
  calendarMonthDays(cursor.value.getFullYear(), cursor.value.getMonth()),
);
const years = computed(() =>
  Array.from({ length: 12 }, (_, i) => yearStart.value + i),
);
const dateLabel = computed(() =>
  new Date(`${props.modelValue}T12:00:00`).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
);
const matchesByDay = computed(() => {
  const result: Record<string, Match[]> = {};
  for (const match of props.matches) {
    const key = new Date(match.scheduled_at).toLocaleDateString("en-CA", {
      timeZone: "America/Santiago",
    });
    (result[key] ||= []).push(match);
  }
  for (const value of Object.values(result))
    value.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  return result;
});
function dayMatches(key: string) {
  return matchesByDay.value[key] || [];
}
function label(key: string) {
  return `${new Date(`${key}T12:00:00`).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}: ${dayMatches(key).length} partidos`;
}
function reset() {
  cursor.value = new Date(`${props.modelValue}T12:00:00`);
  focusDate.value = props.modelValue;
  view.value = "days";
  hovered.value = null;
}
watch(() => props.modelValue, reset);
function browse(amount: number) {
  hovered.value = null;
  if (view.value === "years") yearStart.value += amount * 12;
  else
    cursor.value = new Date(
      cursor.value.getFullYear() + (view.value === "months" ? amount : 0),
      cursor.value.getMonth() + (view.value === "days" ? amount : 0),
      1,
      12,
    );
  focusDate.value = calendarDateKey(cursor.value);
}
function selectDay(key: string, close?: () => void) {
  emit("update:modelValue", key);
  weekCursor.value = key;
  hovered.value = null;
  close?.();
}
function selectMonth(month: number) {
  cursor.value = new Date(cursor.value.getFullYear(), month, 1, 12);
  focusDate.value = calendarDateKey(cursor.value);
  view.value = "days";
}
function selectYear(year: number) {
  cursor.value = new Date(year, cursor.value.getMonth(), 1, 12);
  view.value = "months";
}
function goToday() {
  selectDay(props.today);
  cursor.value = new Date(`${props.today}T12:00:00`);
  focusDate.value = props.today;
  view.value = "days";
  hovered.value = props.today;
}
async function navigateDay(event: KeyboardEvent, key: string) {
  const date = new Date(`${key}T12:00:00`);
  const moves: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
    Home: -((date.getDay() + 6) % 7),
    End: 6 - ((date.getDay() + 6) % 7),
  };
  if (event.key === "Escape" && hovered.value) {
    hovered.value = null;
    event.stopPropagation();
    return;
  }
  if (event.key in moves) date.setDate(date.getDate() + moves[event.key]!);
  else if (event.key === "PageUp" || event.key === "PageDown") {
    date.setDate(1);
    date.setMonth(date.getMonth() + (event.key === "PageUp" ? -1 : 1));
  } else return;
  event.preventDefault();
  focusDate.value = calendarDateKey(date);
  cursor.value = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  await nextTick();
  panel.value
    ?.querySelector<HTMLButtonElement>(`[data-date="${focusDate.value}"]`)
    ?.focus();
}
</script>
<template>
  <div class="calendar-toolbar">
    <div class="match-calendar">
      <Popover>
        <PopoverButton as="template" @click="reset">
          <button class="calendar-trigger">
            <CalendarDaysIcon aria-hidden="true" />
            <span
              ><small>Elige una fecha</small
              ><strong>{{ dateLabel }}</strong></span
            >
            <ChevronDownIcon class="calendar-caret" aria-hidden="true" />
          </button>
        </PopoverButton>
        <Transition name="calendar-reveal">
          <PopoverPanel v-slot="{ close: closePanel }" as="div">
            <div class="calendar-popover">
              <div ref="calendarPanel" class="calendar-content">
                <header class="calendar-top">
                  <button
                    :aria-label="
                      view === 'days'
                        ? 'Mes anterior'
                        : view === 'months'
                          ? 'Año anterior'
                          : 'Años anteriores'
                    "
                    @click="browse(-1)"
                  >
                    <ChevronLeftIcon aria-hidden="true" />
                  </button>
                  <div class="calendar-heading">
                    <button
                      v-if="view === 'days'"
                      aria-label="Elegir mes"
                      @click="
                        view = 'months';
                        hovered = null;
                      "
                    >
                      {{ months[cursor.getMonth()] }}</button
                    ><button
                      :aria-label="
                        view === 'years' ? 'Volver a elegir mes' : 'Elegir año'
                      "
                      @click="
                        view = view === 'years' ? 'months' : 'years';
                        yearStart = cursor.getFullYear() - 5;
                        hovered = null;
                      "
                    >
                      {{
                        view === "years"
                          ? `${yearStart}–${yearStart + 11}`
                          : cursor.getFullYear()
                      }}
                    </button>
                  </div>
                  <button
                    :aria-label="
                      view === 'days'
                        ? 'Mes siguiente'
                        : view === 'months'
                          ? 'Año siguiente'
                          : 'Años siguientes'
                    "
                    @click="browse(1)"
                  >
                    <ChevronRightIcon aria-hidden="true" /></button
                  ><button class="calendar-today" @click="goToday">Hoy</button>
                </header>
                <div v-if="view === 'days'">
                  <div class="calendar-weekdays">
                    <span v-for="weekday in weekdays" :key="weekday">{{
                      weekday
                    }}</span>
                  </div>
                  <div
                    class="calendar-grid"
                    role="group"
                    aria-label="Días del mes"
                  >
                    <div
                      v-for="(day, index) in days"
                      :key="day.key"
                      class="calendar-cell"
                      @mouseenter="hovered = day.key"
                      @mouseleave="hovered = null"
                    >
                      <button
                        :data-date="day.key"
                        class="calendar-day"
                        :class="{
                          selected: day.key === modelValue,
                          outside: !day.inMonth,
                          today: day.key === today,
                          populated: dayMatches(day.key).length,
                        }"
                        :aria-label="label(day.key)"
                        :aria-pressed="day.key === modelValue"
                        :aria-current="day.key === today ? 'date' : undefined"
                        :aria-describedby="
                          hovered === day.key
                            ? `calendar-preview-${day.key}`
                            : undefined
                        "
                        :tabindex="day.key === focusDate ? 0 : -1"
                        @focus="
                          hovered = day.key;
                          focusDate = day.key;
                        "
                        @blur="hovered = null"
                        @keydown="navigateDay($event, day.key)"
                        @click="selectDay(day.key, closePanel)"
                      >
                        <span>{{ day.day }}</span
                        ><template v-if="dayMatches(day.key).length"
                          ><strong>{{ dayMatches(day.key).length }}</strong
                          ><small>{{
                            dayMatches(day.key).length === 1
                              ? "partido"
                              : "partidos"
                          }}</small></template
                        >
                      </button>
                      <div
                        v-if="hovered === day.key"
                        :id="`calendar-preview-${day.key}`"
                        role="tooltip"
                        class="calendar-tooltip"
                        :style="{
                          left: `${Math.min(0, 2 - (index % 7)) * 100}%`,
                          right: 'auto',
                        }"
                        :class="{
                          'align-right': index % 7 >= 4,
                          'align-bottom': index < 7,
                        }"
                      >
                        <strong>{{
                          new Date(`${day.key}T12:00:00`).toLocaleDateString(
                            "es",
                            { day: "numeric", month: "long" },
                          )
                        }}</strong>
                        <ul v-if="dayMatches(day.key).length">
                          <li
                            v-for="match in dayMatches(day.key).slice(0, 3)"
                            :key="match.id"
                          >
                            <time>{{ time(match.scheduled_at) }}</time
                            ><span
                              >{{ match.home_team.name
                              }}<span class="calendar-vs"> vs. </span
                              >{{ match.away_team.name }}</span
                            >
                          </li>
                        </ul>
                        <p v-else>No hay partidos programados</p>
                        <p
                          v-if="dayMatches(day.key).length > 3"
                          class="calendar-more"
                        >
                          +{{ dayMatches(day.key).length - 3 }} más
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="view === 'months'"
                  class="calendar-choices"
                  aria-label="Seleccionar mes"
                >
                  <button
                    v-for="(month, index) in months"
                    :key="month"
                    :class="{ current: index === cursor.getMonth() }"
                    @click="selectMonth(index)"
                  >
                    {{ month }}
                  </button>
                </div>
                <div
                  v-else
                  class="calendar-choices"
                  aria-label="Seleccionar año"
                >
                  <button
                    v-for="year in years"
                    :key="year"
                    :class="{ current: year === cursor.getFullYear() }"
                    @click="selectYear(year)"
                  >
                    {{ year }}
                  </button>
                </div>
                <footer class="calendar-bottom">
                  <span>Horario de Santiago</span
                  ><button @click="closePanel()">Ver jornada</button>
                </footer>
              </div>
            </div>
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
    <nav class="week-navigation" aria-label="Jornadas de la semana">
      <button
        class="week-arrow"
        aria-label="Semana anterior"
        @click="moveWeek(-1)"
      >
        <ChevronLeftIcon aria-hidden="true" />
      </button>
      <div class="week-days">
        <button
          v-for="day in weekDays"
          :key="day.key"
          :data-week-date="day.key"
          class="week-day"
          :class="{ selected: day.key === modelValue }"
          :aria-label="label(day.key)"
          :aria-pressed="day.key === modelValue"
          @click="selectDay(day.key)"
        >
          <span>{{ day.weekday }}</span
          ><strong>{{ day.day }}</strong
          ><i v-if="dayMatches(day.key).length" />
        </button>
      </div>
      <button
        class="week-arrow"
        aria-label="Semana siguiente"
        @click="moveWeek(1)"
      >
        <ChevronRightIcon aria-hidden="true" />
      </button>
    </nav>
    <button class="calendar-today" @click="goToday">Hoy</button>
  </div>
</template>

<style scoped>
html[data-theme="light"] .day {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .day span,
html[data-theme="light"] .day strong {
  color: var(--text-color) !important;
}
footer {
  color: var(--text-color);
}
button:hover {
  color: var(--accent);
}
.day {
  width: 55px;
  height: 59px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  position: relative;
}
.day:hover {
  background: var(--ui-hover, #20252d);
}
.day span {
  font-size: 10px;
  text-transform: capitalize;
  color: var(--ui-muted, #a0a7b3);
}
.day strong {
  font-size: 18px;
  font-weight: 500;
}
.day.selected {
  background: var(--accent-fill);
  color: var(--ui-muted, #1b2412);
}
.day.selected span {
  color: var(--ui-muted, #3a492d);
}
.day i {
  position: absolute;
  bottom: 4px;
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
}
footer {
  max-width: 1192px;
  margin: auto;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 25px 0 32px;
  color: var(--ui-muted, #76808d);
}
footer > span {
  font-size: 10px;
}
footer > span:last-child {
  margin-left: auto;
  font-size: 8px;
  letter-spacing: 1.5px;
}
@media (min-width: 1450px) {
  footer {
    max-width: 1272px;
  }
}
@media (max-width: 1050px) {
  .day {
    width: 43px;
  }
  footer {
    margin: 0 30px;
  }
}
@media (max-width: 700px) {
  .day {
    flex: 1;
    min-width: 0;
    height: 54px;
  }
  footer {
    margin: 0 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  footer > span:last-child {
    width: 100%;
    margin: 0;
  }
}




.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
}
.week-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.week-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  flex: 1;
}
.week-day {
  height: 59px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 6px;
}
.week-day span {
  font-size: 10px;
  color: var(--ui-muted, #a0a7b3);
  text-transform: capitalize;
}
.week-day strong {
  font-size: 18px;
  font-weight: 500;
}
.week-day i {
  position: absolute;
  bottom: 4px;
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
}
.week-day.selected {
  background: var(--accent-fill);
  color: var(--ui-muted, #1b2412);
}
.week-day.selected span {
  color: var(--ui-muted, #3a492d);
}
.week-day:not(.selected):hover {
  background: var(--ui-hover, #303a28);
}
.week-arrow {
  padding: 8px;
  color: var(--ui-muted, #a0a7b3);
}
.week-arrow svg {
  width: 18px;
  height: 18px;
}
.calendar-toolbar .calendar-trigger {
  border-color: var(--ui-border, #bded7570);
  background: var(--ui-success-soft, #bded7508);
  min-height: 64px;
  padding: 14px 18px;
}
.calendar-toolbar .calendar-trigger:hover,
.calendar-toolbar .calendar-trigger[aria-expanded="true"] {
  border-color: var(--accent);
  background: var(--ui-success-soft, #bded7512);
}
@media (max-width: 800px) {
  .calendar-toolbar {
    flex-wrap: wrap;
    gap: 14px;
    padding: 14px 16px;
  }
  .week-navigation {
    order: 3;
    flex-basis: 100%;
  }
  .calendar-toolbar > .calendar-today {
    margin-left: auto;
  }
  .week-days {
    gap: 2px;
  }
  .week-navigation {
    gap: 2px;
  }
}

.match-calendar {
  position: relative;
  z-index: 5;
  width: fit-content;
  max-width: 100%;
}
.calendar-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  min-height: 70px;
  min-width: 245px;
  max-width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 9px;
  color: var(--text);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.calendar-trigger:hover {
  background: var(--ui-hover, #191d23);
  border-color: var(--ui-border, #525963);
}
.calendar-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.calendar-trigger > svg {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  color: var(--accent);
}
.calendar-trigger > span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.calendar-trigger small {
  font-size: 9px;
  color: var(--muted);
}
.calendar-trigger strong {
  font-size: 11px;
  font-weight: 500;
  color: var(--ui-text, #e0e4eb);
}
.calendar-trigger > .calendar-caret {
  width: 14px;
  height: 14px;
  margin-left: auto;
}
.calendar-today {
  font-size: 10px;
  background: var(--ui-surface, #282c33);
  border-radius: 4px;
  padding: 6px 10px;
  color: var(--ui-text, #d5dae0);
}
.calendar-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 370px;
  max-width: calc(100vw - 36px);
  background: var(--ui-surface, #1d2025);
  border: 1px solid var(--ui-border, #3d424b);
  border-radius: 10px;
  box-shadow: 0 12px 40px var(--ui-shadow, #0007);
  padding: 14px;
  z-index: 10;
}
.calendar-top {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;
}
.calendar-top > button:not(.calendar-today) {
  width: 25px;
  height: 30px;
  display: grid;
  place-items: center;
  color: var(--ui-muted, #a8aeb8);
}
.calendar-top svg {
  width: 15px;
  height: 15px;
}
.calendar-heading {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 3px;
}
.calendar-heading button {
  text-transform: capitalize;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 3px;
  color: var(--ui-text, #f0f1f3);
}
.calendar-heading button:hover {
  color: var(--ui-success, #bde78d);
}
.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.calendar-weekdays {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ui-border, #ffffff0c);
}
.calendar-weekdays span {
  text-align: center;
  font-size: 9px;
  color: var(--ui-muted, #a6abb4);
}
.calendar-cell {
  position: relative;
  min-width: 0;
}
.calendar-day {
  width: 100%;
  height: 57px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1px;
  border-radius: 4px;
  padding: 5px 1px;
  color: var(--ui-text, #dde0e5);
  position: relative;
}
.calendar-day > span {
  font-size: 10px;
}
.calendar-day strong {
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
}
.calendar-day small {
  font-size: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.calendar-day.outside {
  color: var(--ui-muted, #6a717d);
}
.calendar-day.populated {
  background: var(--ui-surface, #ffffff04);
}
.calendar-day:hover {
  background: var(--ui-hover, #343a42);
}
.calendar-day.selected {
  background: #47794b;
  color: #fff;
}
.calendar-day.today:after {
  content: "";
  position: absolute;
  bottom: 3px;
  width: 3px;
  height: 3px;
  background: var(--ui-success-soft, #d1eab4);
  border-radius: 50%;
}
.calendar-day:focus-visible {
  outline: 2px solid var(--ui-border, #a9c98b);
  outline-offset: -2px;
}
.calendar-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 20;
  width: 255px;
  max-width: calc(100vw - 70px);
  padding: 12px;
  background: var(--ui-surface, #30353c);
  border: 1px solid var(--ui-border, #5c646f);
  border-radius: 7px;
  box-shadow: 0 6px 20px var(--ui-shadow, #0006);
  color: var(--ui-text, #e9ebee);
  pointer-events: auto;
}
.calendar-tooltip.align-right {
  left: auto;
  right: 0;
}
.calendar-tooltip.align-bottom {
  top: calc(100% + 6px);
  bottom: auto;
}
.calendar-tooltip > strong {
  font-size: 10px;
  font-weight: 500;
}
.calendar-tooltip ul {
  list-style: none;
  margin: 9px 0 0;
  padding: 0;
}
.calendar-tooltip li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 10px;
  line-height: 1.6;
  margin-top: 7px;
}
.calendar-tooltip time {
  flex-shrink: 0;
  color: var(--ui-text, #bdc5b5);
  font-size: 9px;
}
.calendar-vs {
  color: var(--ui-muted, #939daa);
}
.calendar-tooltip p {
  font-size: 10px;
  margin-top: 8px;
  color: var(--ui-text, #adb5bf);
}
.calendar-tooltip .calendar-more {
  color: var(--ui-success, #c3e8a5);
}
.calendar-choices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 0;
  min-height: 235px;
}
.calendar-choices button {
  font-size: 11px;
  text-transform: capitalize;
  border-radius: 5px;
  color: var(--ui-text, #c9ced7);
}
.calendar-choices button:hover {
  background: var(--ui-hover, #333b43);
}
.calendar-choices .current {
  color: var(--ui-success, #bbdf98);
  background: var(--ui-hover, #2b3626);
}
.calendar-bottom {
  max-width: none;
  margin: 12px 0 0;
  border-top: 1px solid var(--ui-border, #ffffff0c);
  padding: 12px 0 0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.calendar-bottom > span {
  font-size: 9px;
  color: var(--ui-muted, #8e98a4);
}
.calendar-bottom button {
  font-size: 10px;
  color: var(--ui-success, #c1e4a0);
}
@media (max-width: 600px) {
  .calendar-trigger {
    min-width: 230px;
    padding: 12px 16px;
  }
  .calendar-popover {
    padding: 11px;
    width: 350px;
  }
  .calendar-day {
    height: 54px;
  }
  .calendar-tooltip {
    width: 230px;
  }
  .calendar-heading button {
    font-size: 12px;
  }
}
.calendar-reveal-enter-active .calendar-popover,
.calendar-reveal-leave-active .calendar-popover {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  transform-origin: top left;
}
.calendar-reveal-enter-from .calendar-popover,
.calendar-reveal-leave-to .calendar-popover {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
.week-day,
.calendar-day {
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}
.calendar-caret {
  transition: transform 0.2s ease;
}
.calendar-trigger[aria-expanded="true"] .calendar-caret {
  transform: rotate(180deg);
}
html[data-theme="light"] .week-day.selected,
html[data-theme="light"] .week-day.selected span,
html[data-theme="light"] .day.selected,
html[data-theme="light"] .day.selected span { color: var(--on-accent) !important; background: var(--accent-fill) !important; }
html[data-theme="light"] .calendar-day.selected { background: #35651d; color: #fff; }
html[data-theme="light"] .calendar-day.selected.today:after { background: #fff; }
html[data-theme="light"] .calendar-day.outside { color: #677365; }


@media (prefers-reduced-motion: no-preference) {
  button, a, input { transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  button:not(:disabled):active, .primary-action:active { transform: translateY(1px); }
  input:focus-visible { box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, .12)); }
}
</style>

