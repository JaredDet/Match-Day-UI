<script setup lang="ts">
import "~/assets/css/main.css";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import { useNavigationTracking } from "~/modules/recommendations/composables/useNavigationTracking";

useNavigationTracking();
const route = useRoute();
const navigating = ref(false);
const nuxtApp = useNuxtApp();
nuxtApp.hook("page:start", () => {
  navigating.value = true;
});
nuxtApp.hook("page:finish", async () => {
  navigating.value = false;
  await nextTick();
  if (import.meta.client)
    document
      .querySelector<HTMLElement>("#main-content")
      ?.focus({ preventScroll: true });
});
useSeoMeta({
  ogSiteName: "Matchday",
  ogLocale: "es_CL",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--accent)" :height="3" />
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <AppHeader />
    <div class="demo-notice">
      <span>DEMO</span> Datos ficticios para explorar Matchday. Los cambios solo
      se simulan en esta sesión.
    </div>
    <div
      id="main-content"
      tabindex="-1"
      :aria-busy="navigating"
      :aria-label="`Contenido de ${route.path}`"
    >
      <span class="sr-only" aria-live="polite">{{
        navigating ? "Cargando página" : "Página cargada"
      }}</span>
      <NuxtPage :transition="{ name: 'page' }" />
    </div>
    <AppFooter />
  </div>
</template>

<style scoped>
.demo-notice {
  max-width: 1240px;
  margin: 16px auto 0;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.demo-notice span {
  font-weight: 700;
  color: var(--accent, #bded75);
  margin-right: 8px;
}
@media (max-width: 700px) {
  .demo-notice {
    margin: 12px 16px 0;
  }
}
.skip-link {
  position: fixed;
  z-index: 10000;
  top: 10px;
  left: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 700;
  transform: translateY(-160%);
}
.skip-link:focus {
  transform: translateY(0);
}
#main-content:focus {
  outline: none;
}

.site-shell :deep(.page-enter-active) {
  transition:
    opacity 0.24s,
    transform 0.24s;
}
.site-shell :deep(.page-leave-active) {
  transition: opacity 0.14s;
}
.site-shell :deep(.page-enter-from) {
  opacity: 0;
  transform: translateY(8px);
}
.site-shell :deep(.page-leave-to) {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .site-shell :deep(.page-enter-active),
  .site-shell :deep(.page-leave-active) {
    transition: none;
  }
}
</style>
