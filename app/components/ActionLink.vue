<script setup lang="ts">
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
defineProps<{ to: string; label?: string }>();
</script>

<template>
  <NuxtLink :to="to" class="action-link"
    ><span
      ><slot>{{ label }}</slot></span
    ><ArrowRightIcon aria-hidden="true"
  /></NuxtLink>
</template>

<style scoped>
.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: fit-content;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}
svg {
  width: 18px;
  color: var(--accent);
  transition: transform 0.2s ease;
}
.action-link:hover {
  border-color: var(--accent);
}
.action-link:hover svg {
  transform: translateX(4px);
}
</style>
