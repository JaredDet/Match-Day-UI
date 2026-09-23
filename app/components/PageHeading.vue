<script setup lang="ts">
defineProps<{ title: string; kicker?: string; description?: string; backTo?: string; backLabel?: string }>()
</script>
<template>
  <header class="page-heading">
    <NuxtLink v-if="backTo" :to="backTo" class="section-back">← {{ backLabel ?? 'Volver' }}</NuxtLink>
    <div class="entity-heading"><div><span v-if="kicker" class="section-kicker">{{ kicker }}</span><h1>{{ title }}<span>.</span></h1><p v-if="description">{{ description }}</p></div><slot /></div>
  </header>
</template>

<style scoped>
html[data-theme="light"] .entity-heading {
  background: var(--panel-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--border) !important;
}
html[data-theme="light"] .section-back,
html[data-theme="light"] .entity-heading h1,
html[data-theme="light"] .entity-heading p,
html[data-theme="light"] .section-kicker {
  color: var(--text-color) !important;
}
.section-back,
.entity-heading,
.entity-heading h1,
.entity-heading p,
.section-kicker {
  color: var(--text-color);
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
@media (max-width: 700px) {
  h1 {
    font-size: 34px;
    margin: 8px 0;
  }
}
.section-back {
  display: inline-block;
  font-size: 12px;
  color: var(--ui-muted, #a0aa9d);
  margin-bottom: 32px;
}
.section-back:hover {
  color: var(--accent);
}
.entity-heading {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 28px;
  padding: 18px 20px 18px 18px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--ui-border, rgba(255, 255, 255, 0.06));
  background: var(--ui-surface, rgba(15, 18, 22, 0.96));
}
.entity-heading h1 {
  font-size: clamp(28px, 4vw, 44px);
  margin: 8px 0;
}
.entity-heading h1 > span {
  color: var(--accent);
}
.entity-heading p {
  color: var(--ui-muted, #929b93);
  font-size: 12px;
}
.section-kicker {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ui-success, #b9d499);
  text-transform: uppercase;
}
@media (max-width: 700px) {
  .entity-heading {
    gap: 16px;
    flex-wrap: wrap;
  }
  .section-back {
    margin-bottom: 24px;
  }
}
@media (max-width: 700px) {
  .entity-heading {
    row-gap: 24px;
  }
}.page-heading{margin-bottom:24px}.page-heading .entity-heading{margin-bottom:0}

@media (prefers-reduced-motion: no-preference) {
  button, a, input { transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  button:not(:disabled):active, .primary-action:active { transform: translateY(1px); }
  input:focus-visible { box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, .12)); }
}
</style>

