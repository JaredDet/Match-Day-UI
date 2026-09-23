<script setup lang="ts">
import "~/assets/css/main.css"
import AppHeader from "~/components/AppHeader.vue"
import AppFooter from "~/components/AppFooter.vue"
import { useNavigationTracking } from '~/modules/recommendations/composables/useNavigationTracking'

useNavigationTracking()
</script>

<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <div class="demo-notice"><span>DEMO</span> Datos ficticios para explorar Matchday. Los cambios solo se simulan en esta sesión.</div>
    <NuxtPage :transition="{ name: 'page' }" />
    <AppFooter />
  </div>
</template>

<style scoped>



.demo-notice{max-width:1240px;margin:16px auto 0;padding:10px 16px;border:1px solid var(--border);border-radius:10px;color:var(--muted);font-size:12px;line-height:1.6}.demo-notice span{font-weight:700;color:var(--accent,#bded75);margin-right:8px}@media(max-width:700px){.demo-notice{margin:12px 16px 0}}

.site-shell :deep(.page-enter-active) { transition: opacity 0.24s, transform 0.24s; }
.site-shell :deep(.page-leave-active) { transition: opacity 0.14s; }
.site-shell :deep(.page-enter-from) { opacity: 0; transform: translateY(8px); }
.site-shell :deep(.page-leave-to) { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .site-shell :deep(.page-enter-active),
  .site-shell :deep(.page-leave-active) { transition: none; }
}
</style>
