<script setup lang="ts">
import type { FormationPosition } from "~/modules/matches/data/formations";

const positions = defineModel<FormationPosition[]>({ required: true });
const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
function move(event: PointerEvent, slot: number) {
  const pitch = event.currentTarget as HTMLElement;
  const rect = pitch.getBoundingClientRect();
  const position = positions.value.find((item) => item.slot === slot);
  if (!position) return;
  position.x = Math.round(
    Math.max(2, Math.min(48, ((event.clientX - rect.left) / rect.width) * 50)),
  );
  position.y = Math.round(
    Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100)),
  );
}
</script>

<template>
  <div class="formation-editor" :class="{ compact: props.compact }">
    <div class="formation-pitch" aria-label="Editor visual de la formación">
      <button
        v-for="position in positions"
        :key="position.slot"
        type="button"
        class="formation-player"
        :style="{ left: `${position.x * 2}%`, top: `${position.y}%` }"
        :aria-label="`Posición ${position.slot}: x ${position.x}, y ${position.y}`"
        @pointerdown="move($event, position.slot)"
      >
        {{ position.slot }}
      </button>
    </div>
    <div v-if="!props.compact" class="coordinate-grid">
      <fieldset v-for="position in positions" :key="position.slot">
        <legend>Posición {{ position.slot }}</legend>
        <label>X <input v-model.number="position.x" type="number" min="0" max="50" /></label>
        <label>Y <input v-model.number="position.y" type="number" min="0" max="100" /></label>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.formation-pitch {
  position: relative;
  aspect-ratio: 1.55;
  max-width: 720px;
  overflow: hidden;
  border: 1px solid #b8d8a8;
  border-radius: 12px;
  background: repeating-linear-gradient(90deg, #397536 0 12.5%, #44813f 12.5% 25%);
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
  border-radius: 50%;
  transform: translate(-50%, -50%);
  touch-action: none;
  cursor: move;
  background: var(--surface-strong, #20262b);
  color: white;
  border: 2px solid var(--accent, #b6ff5c);
}
.coordinate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 16px;
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
.compact .formation-pitch {
  max-width: 420px;
}
</style>
