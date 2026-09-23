<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>
<template>
  <div class="section-empty" role="status">
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
html[data-theme="light"] .section-empty {
  color: var(--muted) !important;
}
h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (max-width: 700px) {
  h2 {
    font-size: 19px;
  }
}
.section-empty {
  padding: 32px;
  border: 1px solid var(--ui-border, #30382b);
  border-radius: 8px;
  background: var(--ui-surface, #191e18);
  color: var(--ui-muted, #96a38e);
  font-size: 12px;
}
.section-empty h2 {
  font-size: 18px;
  color: var(--ui-text, #e2e9dc);
  margin-bottom: 12px;
}
.section-empty :slotted(button) {
  color: var(--accent);
  margin-top: 12px;
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
