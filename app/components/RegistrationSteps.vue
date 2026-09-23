<script setup lang="ts">
defineProps<{ labels: string[]; current: number }>();
</script>

<template>
  <ol class="steps" aria-label="Pasos de la inscripción">
    <li
      v-for="(label, index) in labels"
      :key="label"
      :aria-current="current === index ? 'step' : undefined"
      :class="{ active: current === index, completed: current > index }"
    >
      <span>{{ index + 1 }}</span
      >{{ label }}
    </li>
  </ol>
</template>

<style scoped>
.steps {
  display: flex;
  gap: 16px;
  padding: 0;
  margin: 0 0 28px;
  list-style: none;
  max-width: 800px;
}
li {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 14px;
}
li span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
}
.active {
  color: var(--text-color);
  border-color: var(--accent);
  font-weight: 700;
}
.active span,
.completed span {
  background: var(--accent-fill);
  color: var(--ui-muted, #17200e);
  border-color: var(--accent);
}
@media (max-width: 500px) {
  .steps {
    gap: 8px;
  }
  li {
    flex-direction: column;
    align-items: flex-start;
    font-size: 12px;
  }
}
.active span,
.completed span {
  color: var(--on-accent);
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
