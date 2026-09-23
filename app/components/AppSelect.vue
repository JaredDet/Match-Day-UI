<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

defineOptions({ inheritAttrs: false });
const value = defineModel<string>({ required: true });
</script>

<template>
  <span class="select-control">
    <select v-model="value" v-bind="$attrs">
      <slot />
    </select>
    <ChevronDownIcon class="select-chevron" aria-hidden="true" />
  </span>
</template>

<style scoped>
.select-control {
  position: relative;
  display: inline-grid;
  width: 100%;
  min-width: 0;
  vertical-align: middle;
}
select {
  appearance: none;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 44px 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-color);
  font: inherit;
  cursor: pointer;
}
.select-chevron {
  position: absolute;
  inset-inline-end: 14px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--muted);
}
select:hover:not(:disabled) {
  border-color: var(--accent);
}
select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
select:disabled {
  cursor: not-allowed;
  color: var(--muted);
}
select:disabled + .select-chevron {
  opacity: 0.5;
}
@media (prefers-reduced-motion: no-preference) {
  select {
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
  .select-chevron {
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }
  .select-control:focus-within .select-chevron {
    color: var(--accent);
  }
  .select-control:hover .select-chevron {
    transform: translateY(calc(-50% + 1px));
  }
}
</style>
