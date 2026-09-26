<script setup lang="ts">
defineProps<{ title: string }>();
</script>
<template>
  <section class="management-panel" :class="$attrs.class">
    <h2>{{ title }}</h2>
    <div class="fields"><slot /></div>
  </section>
</template>
<style scoped>
.management-panel {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  color: var(--text-color);
  min-width: 0;
}
.management-panel h2 {
  font-size: 22px;
  margin: 0 0 20px;
}
.fields {
  display: grid;
  gap: 16px;
}
.fields :deep(label) {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
}
.fields :deep(input:not([type="checkbox"])),
.fields :deep(textarea) {
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--panel-bg);
  color: var(--text-color);
  font: inherit;
}
.fields :deep(textarea) {
  min-height: 140px;
  resize: vertical;
}
.fields :deep(button),
.fields :deep(a) {
  width: fit-content;
  max-width: 100%;
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--accent);
  background: var(--panel-bg);
  font: inherit;
  cursor: pointer;
}
.fields :deep(button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
.fields :deep(p) {
  line-height: 1.65;
}
.fields :deep(ul) {
  display: grid;
  gap: 12px;
  padding-left: 20px;
}
.fields :deep(.actions) {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.fields :deep(.notice) {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.fields :deep(img) {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}
.fields :deep(.check) {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fields :deep(input[type="checkbox"]) {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}
@media (prefers-reduced-motion: no-preference) {
  .fields :deep(button),
  .fields :deep(a) {
    transition:
      background 0.2s,
      transform 0.2s;
  }
  .fields :deep(button:hover:not(:disabled)) {
    background: var(--ui-hover, #30372b);
    transform: translateY(-1px);
  }
}
</style>
