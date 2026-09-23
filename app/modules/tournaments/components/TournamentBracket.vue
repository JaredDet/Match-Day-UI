<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import CupTie from "~/modules/tournaments/components/CupTie.vue";
import { createBracket } from "~/modules/tournaments/data/competition";;
const size = ref(16);
const cup = computed(() => createBracket(size.value));
const viewport = useTemplateRef<HTMLElement>("viewport");
const bracketSection = useTemplateRef<HTMLElement>("bracketSection");
const left = ref(false),
  right = ref(false);
const active = ref(0);
let jumpTimer: ReturnType<typeof setTimeout> | undefined;
const jumpingTo = ref<number | null>(null);
const arrowStyle = reactive({
  previousLeft: "18px",
  nextRight: "18px",
  top: "50vh",
});
function measure() {
  const el = viewport.value;
  if (!el) return;
  left.value = el.scrollLeft > 2;
  right.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  if (jumpingTo.value === null) active.value = Math.min(cup.value.rounds.length - 1, Math.round(el.scrollLeft / 344));
}
function move(direction: number) {
  viewport.value?.scrollBy({ left: direction * 344, behavior: "smooth" });
}
function jump(index: number) {
  active.value = index;
  jumpingTo.value = index;
  viewport.value?.scrollTo({ left: index * 344, behavior: "smooth" });
  if (jumpTimer) clearTimeout(jumpTimer);
  jumpTimer = setTimeout(() => { jumpingTo.value = null; active.value = index; }, 500);
}
function syncArrowPosition() {
  const section = bracketSection.value;
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const gap = 18;
  const middle = rect.top + rect.height / 2;

  arrowStyle.top = `${middle}px`;
  arrowStyle.previousLeft = `${Math.max(gap, rect.left + gap)}px`;
  arrowStyle.nextRight = `${Math.max(gap, window.innerWidth - rect.right + gap)}px`;
}
watch(size, async () => {
  await nextTick();
  viewport.value?.scrollTo({ left: 0, top: 0 });
  measure();
});
let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(() => {
    measure();
    syncArrowPosition();
  });
  if (viewport.value) observer.observe(viewport.value);
  window.addEventListener("scroll", syncArrowPosition, { passive: true });
  window.addEventListener("resize", syncArrowPosition);
  measure();
  syncArrowPosition();
});
onBeforeUnmount(() => {
  if (jumpTimer) clearTimeout(jumpTimer);
  observer?.disconnect();
  window.removeEventListener("scroll", syncArrowPosition);
  window.removeEventListener("resize", syncArrowPosition);
});
</script>
<template>
  <div ref="bracketSection" class="cup-browser">
    <div class="cup-toolbar"><span>16 clasificados · Eliminación directa</span><span>Desliza para recorrer las rondas</span></div>
    <nav class="cup-rounds" aria-label="Ir a una ronda">
      <button
        v-for="(round, index) in cup.rounds"
        :key="round.name"
        :class="{ active: active === index }"
        @click="jump(index)"
      >
        {{ round.name }}
      </button>
    </nav>
    <div class="cup-camera">
      <div
        ref="viewport"
        class="cup-viewport"
        tabindex="0"
        aria-label="Cuadro de eliminatorias, desplazable"
        @scroll="measure"
        @keydown.left.prevent="move(-1)"
        @keydown.right.prevent="move(1)"
      >
        <button
          class="camera-arrow previous"
          aria-label="Ver rondas anteriores"
          :disabled="!left"
          :style="{ left: arrowStyle.previousLeft, top: arrowStyle.top }"
          @click="move(-1)"
        >
          <ChevronLeftIcon />
        </button>
        <div :key="size" class="cup-canvas">
          <section
            v-for="(round, index) in cup.rounds"
            :key="round.name"
            class="cup-column"
          >
            <h3>{{ round.name }}</h3>
            <div
              class="cup-slots"
              :style="{ height: `${cup.rounds[0]!.ties.length * 172}px` }"
            >
              <div
                v-for="(tie, tieIndex) in round.ties"
                :key="tie.id"
                class="cup-slot"
                :class="{
                  connected: index < cup.rounds.length - 1,
                  upper: tieIndex % 2 === 0,
                }"
              >
                <CupTie :tie="tie" />
              </div>
            </div>
            <div v-if="index === cup.rounds.length - 1" class="third-place">
              <h3>Tercer lugar</h3>
              <CupTie :tie="cup.third" />
            </div>
          </section>
        </div>
        <button
          class="camera-arrow next"
          aria-label="Ver rondas siguientes"
          :disabled="!right"
          :style="{ right: arrowStyle.nextRight, top: arrowStyle.top }"
          @click="move(1)"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
    <p class="cup-hint">
      {{
        size === 16
          ? "Clasificados de los ocho grupos."
          : "Cuadro ampliado de prueba, independiente de la fase de grupos."
      }}
      El tercer puesto enfrenta a los perdedores de semifinales.
    </p>
  </div>
</template>

<style scoped>

button:hover {
  color: var(--accent);
}




.cup-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  font-size: 11px;
  color: var(--ui-muted, #97a18e);
}
.cup-toolbar label {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cup-toolbar select {
  background: var(--ui-surface, #252e20);
  color: var(--ui-text, #dce8d2);
  border: 1px solid var(--ui-border, #4e6040);
  border-radius: 6px;
  min-height: 46px;
  padding: 12px 44px 12px 16px;
}
.cup-rounds {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 24px;
}
.cup-rounds button {
  white-space: nowrap;
  font-size: 11px;
  padding: 9px 14px;
  border-radius: 5px;
  background: var(--panel-bg);
  color: var(--bracket-muted);
  border: 1px solid var(--border);
}
.cup-rounds button.active {
  color: var(--accent);
  background: var(--ui-success-soft, rgba(189, 237, 117, 0.12));
  border-color: var(--ui-border, rgba(189, 237, 117, 0.22));
}
.cup-rounds button {
  white-space: nowrap;
  font-size: 11px;
  padding: 9px 14px;
  border-radius: 5px;
  background: var(--ui-surface, #20271e);
  color: var(--ui-muted, #9ca991);
}
.cup-rounds button.active {
  color: var(--ui-success, #bded75);
  background: var(--ui-hover, #344329);
}
.cup-camera {
  position: relative;
  z-index: 1;
}
.cup-viewport {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-color: var(--bracket-line) var(--bracket-panel);
  scrollbar-width: thin;
  padding: 4px 0 18px;
}
.cup-canvas {
  display: flex;
  gap: 64px;
  width: max-content;
  padding-right: 2px;
}
.cup-column {
  width: 280px;
  flex-shrink: 0;
  position: relative;
  margin-top: 4px;
}
.cup-column > h3 {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--bracket-panel-strong);
  padding: 14px;
  margin: 0;
  font-size: 12px;
  color: var(--bracket-text);
  border-radius: 5px;
}
.cup-slots {
  display: flex;
  flex-direction: column;
}
.cup-slot {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 172px;
}
.cup-slot > .cup-tie {
  width: 100%;
  z-index: 1;
}
.cup-slot.connected:after {
  content: "";
  position: absolute;
  left: 100%;
  width: 32px;
  top: 0;
  height: 50%;
  border-right: 1px solid var(--ui-border, #5b6a4e);
  border-bottom: 1px solid var(--ui-border, #5b6a4e);
}
.cup-slot.connected.upper:after {
  top: 50%;
  border-bottom: 0;
  border-top: 1px solid var(--ui-border, #5b6a4e);
}
.cup-slot.connected.upper:before {
  content: "";
  position: absolute;
  left: calc(100% + 32px);
  top: 100%;
  width: 32px;
  border-top: 1px solid var(--ui-border, #5b6a4e);
}
.third-place {
  position: absolute;
  top: calc(50% + 130px);
  width: 100%;
}
.third-place h3 {
  font-size: 12px;
  color: var(--ui-success, #a9bb98);
  margin: 0 0 12px;
}
.camera-arrow {
  position: fixed;
  z-index: 30;
  width: 32px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid var(--bracket-border);
  border-radius: 7px;
  background: var(--ui-surface, rgba(23, 31, 22, 0.92));
  color: var(--accent);
  box-shadow: 0 10px 24px var(--ui-shadow, rgba(0, 0, 0, 0.16));
  transform: translateY(-50%);
  backdrop-filter: blur(2px);
}
.camera-arrow svg {
  width: 19px;
  height: 19px;
}
.camera-arrow:disabled {
  opacity: 0.25;
  cursor: default;
}
.cup-hint {
  font-size: 11px;
  color: var(--ui-muted, #8e9e82);
  margin-top: 16px;
  line-height: 1.6;
}
@media (max-width: 650px) {
  .cup-camera {
    padding: 0 28px;
  }
  .camera-arrow {
    width: 24px;
  }
  .cup-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .cup-toolbar label {
    flex-direction: column;
    align-items: flex-start;
  }
  .cup-column {
    width: 280px;
  }
}

.cup-toolbar select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23bded75' stroke-width='1.8'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.cup-toolbar select:hover {
  border-color: var(--ui-border, #94af75);
  background-color: var(--ui-hover, #303e26);
}
.cup-toolbar select:focus {
  outline: none;
  border-color: var(--ui-border, #bded75);
}
.cup-rounds button,
.camera-arrow {
  transition:
    background-color 0.22s,
    color 0.22s,
    border-color 0.22s,
    transform 0.22s,
    opacity 0.22s;
}
.cup-rounds button:hover,
.camera-arrow:not(:disabled):hover {
  background: var(--ui-hover, #405331);
  color: var(--ui-success, #d5f5ad);
}
.camera-arrow svg {
  transition: transform 0.22s;
}
.cup-canvas {
  animation: cup-appear 0.22s ease both;
}
@keyframes cup-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  button, a, input { transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  button:not(:disabled):active, .primary-action:active { transform: translateY(1px); }
  input:focus-visible { box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, .12)); }
}
</style>

