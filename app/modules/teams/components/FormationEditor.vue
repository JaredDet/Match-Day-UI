<script setup lang="ts">
import type { FormationPosition } from "~/modules/matches/data/formations";
import type { Position } from "~/modules/teams/types/teams";
import { positionCodes, positionNames } from "~/modules/teams/data/position-names";

const positions = defineModel<FormationPosition[]>({ required: true });
const props = withDefaults(
  defineProps<{
    compact?: boolean;
    players?: Array<{
      id: string;
      name: string;
      number: number | null;
      preferredPosition: Position | null;
    }>;
    collisionRadius?: number;
  }>(),
  { compact: false, players: () => [], collisionRadius: 30 },
);
const pitch = ref<HTMLElement>();
const draggingSlot = ref<number | null>(null);

function playerFor(slot: number) {
  return props.players[slot - 1];
}
function playerLabel(slot: number) {
  const player = playerFor(slot);
  if (!player) return `Posición ${slot}`;
  const preferredPosition = player.preferredPosition
    ? positionNames[player.preferredPosition]
    : "Sin posición asignada";
  return `${player.name}, posición preferida: ${preferredPosition}`;
}
function positionCode(position: Position | null | undefined) {
  return position ? positionCodes[position] : "";
}
function isFree(slot: number, x: number, y: number, rect: DOMRect) {
  return positions.value.every((position) => {
    if (position.slot === slot) return true;
    const dx = ((x - position.x) / 50) * rect.width;
    const dy = ((y - position.y) / 100) * rect.height;
    return Math.hypot(dx, dy) > props.collisionRadius * 2;
  });
}
function move(event: PointerEvent, slot = draggingSlot.value) {
  if (slot == null || !pitch.value) return;
  const rect = pitch.value.getBoundingClientRect();
  const position = positions.value.find((item) => item.slot === slot);
  if (!position) return;
  const x = Math.round(Math.max(2, Math.min(48, ((event.clientX - rect.left) / rect.width) * 50)));
  const y = Math.round(Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100)));
  if (isFree(slot, x, y, rect)) {
    position.x = x;
    position.y = y;
  }
}
function startDrag(event: PointerEvent, slot: number) {
  event.preventDefault();
  draggingSlot.value = slot;
  move(event, slot);
}
function stopDrag() {
  draggingSlot.value = null;
}
function moveWithKeyboard(event: KeyboardEvent, slot: number) {
  if (!pitch.value) return;
  const position = positions.value.find((item) => item.slot === slot);
  const movements: Record<string, [number, number]> = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const movement = movements[event.key];
  if (!position || !movement) return;
  event.preventDefault();
  const x = Math.max(2, Math.min(48, position.x + movement[0]));
  const y = Math.max(4, Math.min(96, position.y + movement[1]));
  if (isFree(slot, x, y, pitch.value.getBoundingClientRect())) {
    position.x = x;
    position.y = y;
  }
}
function updateCoordinate(slot: number, axis: "x" | "y", event: Event) {
  if (!pitch.value) return;
  const position = positions.value.find((item) => item.slot === slot);
  const input = event.target as HTMLInputElement;
  const value = Number(input.value);
  if (!position || !Number.isFinite(value)) return;

  const x = axis === "x" ? Math.max(2, Math.min(48, value)) : position.x;
  const y = axis === "y" ? Math.max(4, Math.min(96, value)) : position.y;
  if (isFree(slot, x, y, pitch.value.getBoundingClientRect())) {
    position.x = x;
    position.y = y;
  }
}

onMounted(() => {
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
});
onBeforeUnmount(() => {
  window.removeEventListener("pointermove", move);
  window.removeEventListener("pointerup", stopDrag);
  window.removeEventListener("pointercancel", stopDrag);
});
</script>

<template>
  <div class="formation-editor" :class="{ compact: props.compact }">
    <div ref="pitch" class="formation-pitch" aria-label="Cancha y posiciones de la formación">
      <button
        v-for="position in positions"
        :key="position.slot"
        type="button"
        class="formation-player"
        :class="{ dragging: draggingSlot === position.slot, assigned: playerFor(position.slot) }"
        :style="{ left: `${position.x * 2}%`, top: `${position.y}%` }"
        :title="playerLabel(position.slot)"
        :aria-label="`${playerLabel(position.slot)}; coordenadas X ${position.x}, Y ${position.y}`"
        @pointerdown="startDrag($event, position.slot)"
        @keydown="moveWithKeyboard($event, position.slot)"
      >
        <strong>{{ playerFor(position.slot)?.number ?? position.slot }}</strong>
        <span v-if="playerFor(position.slot)?.preferredPosition" class="position-code">{{
          positionCode(playerFor(position.slot)?.preferredPosition)
        }}</span>
        <span v-if="playerFor(position.slot)" class="player-name">{{
          playerFor(position.slot)?.name
        }}</span>
      </button>
    </div>
    <p class="position-hint">
      Las siglas indican la posición preferida; puedes mover cada jugador libremente por la cancha.
    </p>
    <div v-if="!props.compact" class="coordinate-grid">
      <fieldset v-for="position in positions" :key="position.slot">
        <legend>{{ playerLabel(position.slot) }}</legend>
        <label>
          X
          <input
            :value="position.x"
            type="number"
            min="2"
            max="48"
            @input="updateCoordinate(position.slot, 'x', $event)"
          />
        </label>
        <label>
          Y
          <input
            :value="position.y"
            type="number"
            min="4"
            max="96"
            @input="updateCoordinate(position.slot, 'y', $event)"
          />
        </label>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.formation-pitch {
  position: relative;
  aspect-ratio: 1.55;
  width: 100%;
  min-height: 320px;
  overflow: hidden;
  border: 1px solid #b8d8a8;
  border-radius: 12px;
  background: repeating-linear-gradient(90deg, #397536 0 12.5%, #44813f 12.5% 25%);
  user-select: none;
}
.formation-pitch::after {
  content: "";
  position: absolute;
  inset: 6%;
  border: 2px solid #ffffff80;
  pointer-events: none;
}
.formation-player {
  position: absolute;
  z-index: 1;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 2px solid var(--accent, #b6ff5c);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  touch-action: none;
  cursor: grab;
  background: var(--surface-strong, #20262b);
  color: white;
}
.formation-player.assigned {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  padding: 5px;
}
.formation-player strong,
.formation-player span {
  font-size: 10px;
  line-height: 1.1;
}
.formation-player .position-code {
  position: static;
  display: block;
  width: auto;
  overflow: visible;
  transform: none;
  color: var(--accent, #b6ff5c);
  font-size: 9px;
  font-weight: 700;
}
.formation-player .player-name {
  display: block;
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  width: 110px;
  transform: translateX(-50%);
  color: white;
  pointer-events: none;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.1;
  text-shadow: 0 1px 3px #000;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.formation-player.dragging {
  z-index: 3;
  cursor: grabbing;
  box-shadow: 0 0 0 24px #b6ff5c24;
}
.coordinate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.position-hint {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 12px;
}
fieldset {
  display: flex;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
fieldset input {
  width: 58px;
}
</style>
