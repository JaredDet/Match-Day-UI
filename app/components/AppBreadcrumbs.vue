<script setup lang="ts">
defineProps<{ items: Array<{ label: string; to?: string }> }>();
</script>
<template>
  <nav class="breadcrumbs" aria-label="Migas de pan">
    <ol>
      <li v-for="(item, index) in items" :key="`${item.label}-${index}`">
        <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink
        ><span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
<style scoped>
.breadcrumbs {
  max-width: 1280px;
  margin: 20px auto 0;
  color: var(--muted);
  font-size: 12px;
}
.breadcrumbs ol {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  list-style: none;
  padding: 0;
}
.breadcrumbs li {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.breadcrumbs li + li:before {
  content: "/";
  color: var(--border);
}
.breadcrumbs a {
  color: var(--muted);
}
.breadcrumbs a:hover {
  color: var(--accent);
}
.breadcrumbs span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 700px) {
  .breadcrumbs {
    margin: 16px 18px 0;
  }
}
</style>
