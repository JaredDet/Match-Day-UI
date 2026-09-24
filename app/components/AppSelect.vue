<script setup lang="ts">
import { Fragment, type VNode } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";

defineOptions({ inheritAttrs: false });
const props = defineProps<{ disabled?: boolean; required?: boolean }>();
const value = defineModel<string>({ required: true });
const slots = useSlots();

interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
}

function nodeText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(nodeText).join("");
  if (value && typeof value === "object" && "children" in value)
    return nodeText((value as VNode).children);
  return "";
}

function collectOptions(nodes: VNode[], result: SelectOption[] = []) {
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      collectOptions(node.children as VNode[], result);
      continue;
    }
    if (node.type !== "option") continue;
    result.push({
      value: String(node.props?.value ?? ""),
      label: nodeText(node.children).trim(),
      disabled: Boolean(node.props?.disabled),
    });
  }
  return result;
}

const options = computed(() => collectOptions(slots.default?.() ?? []));
const selectedLabel = computed(
  () => options.value.find((option) => option.value === value.value)?.label ?? "Seleccionar",
);
</script>

<template>
  <Listbox v-model="value" :disabled="props.disabled" as="div" class="matchday-select-control">
    <ListboxButton
      v-slot="{ open }"
      v-bind="$attrs"
      as="div"
      class="select-button"
      :aria-required="props.required || undefined"
      @click.stop
    >
      <span class="selected-label">{{ selectedLabel }}</span>
      <ChevronDownIcon class="select-chevron" :class="{ open }" aria-hidden="true" />
    </ListboxButton>
    <TransitionRoot
      as="template"
      enter="options-enter"
      enter-from="options-enter-from"
      enter-to="options-enter-to"
      leave="options-leave"
      leave-from="options-leave-from"
      leave-to="options-leave-to"
    >
      <ListboxOptions class="matchday-select-options" @click.stop>
        <ListboxOption
          v-for="option in options"
          :key="option.value"
          v-slot="{ active, selected, disabled: optionDisabled }"
          :value="option.value"
          :disabled="option.disabled"
          as="template"
        >
          <li
            class="matchday-select-option"
            :class="{ active, selected, disabled: optionDisabled }"
          >
            <span>{{ option.label }}</span>
            <CheckIcon v-if="selected" aria-hidden="true" />
          </li>
        </ListboxOption>
      </ListboxOptions>
    </TransitionRoot>
  </Listbox>
</template>

<style scoped>
:global(.matchday-select-control) {
  position: relative;
  width: 100%;
  min-width: 0;
  vertical-align: middle;
}
.select-button {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 44px 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-color);
  text-align: left;
}
.selected-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-chevron {
  position: absolute;
  inset-inline-end: 14px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
.select-chevron.open {
  transform: translateY(-50%) rotate(180deg);
  color: var(--accent);
}
.select-button:hover:not([aria-disabled="true"]) {
  border-color: var(--accent);
}
.select-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.select-button[aria-disabled="true"] {
  cursor: not-allowed;
  color: var(--muted);
  opacity: 0.65;
}
:global(.matchday-select-options) {
  position: absolute;
  z-index: 80;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: 260px;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel-bg);
  color: var(--text-color);
  list-style: none;
  box-shadow: 0 18px 42px var(--shadow);
}
:global(.matchday-select-option) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 38px;
  padding: 9px 11px;
  border-radius: 7px;
  cursor: pointer;
}
:global(.matchday-select-option svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
:global(.matchday-select-option.active) {
  background: var(--ui-success-soft);
  color: var(--accent);
}
:global(.matchday-select-option.selected) {
  color: var(--accent);
  font-weight: 600;
}
:global(.matchday-select-option.disabled) {
  cursor: not-allowed;
  color: var(--muted);
  opacity: 0.5;
}
:global(.options-enter),
:global(.options-leave) {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}
:global(.options-enter-from),
:global(.options-leave-to) {
  opacity: 0;
  transform: translateY(-5px) scale(0.985);
}
:global(.options-enter-to),
:global(.options-leave-from) {
  opacity: 1;
  transform: translateY(0) scale(1);
}
@media (prefers-reduced-motion: no-preference) {
  .select-button,
  .select-chevron,
  :global(.matchday-select-option) {
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s ease;
  }
}
</style>
