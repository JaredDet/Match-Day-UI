<script setup lang="ts">
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue";

import { MoonIcon, StarIcon, SunIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const favoritesOnly = useState("matchday-favorites-only", () => false);
const themeMode = useState("matchday-theme", () => "dark");

const isDarkTheme = computed(() => themeMode.value === "dark");

function syncTheme(mode: string) {
  if (import.meta.client && typeof document !== "undefined") {
    document.documentElement.dataset.theme = mode;
  }
}

watch(
  themeMode,
  (mode) => {
    syncTheme(mode);
  },
  { immediate: true },
);

onMounted(() => {
  syncTheme(themeMode.value);
});

function toggleTheme() {
  themeMode.value = isDarkTheme.value ? "light" : "dark";
}

async function showHome(onlyFavorites: boolean) {
  favoritesOnly.value = onlyFavorites;
  await navigateTo("/");
}
</script>
<template>
  <header class="header">
    <NuxtLink class="brand" to="/" aria-label="Matchday, inicio">
      <span class="brand-icon">m<span>↗</span></span>
      matchday<span class="brand-dot">.</span>
    </NuxtLink>
    <nav aria-label="Navegación principal">
      <NuxtLink
        class="nav-item"
        :class="{ active: route.path === '/for-you' }"
        to="/for-you"
        >Para ti</NuxtLink
      >
      <button
        :class="{ active: route.path === '/' && !favoritesOnly }"
        @click="showHome(false)"
      >
        Partidos
      </button>
      <button
        :class="{ active: route.path === '/' && favoritesOnly }"
        @click="showHome(true)"
      >
        Mis favoritos
        <AnimatedHeroIcon
          :icon="StarIcon"
          motion="pop"
          class="ui-icon nav-star"
          aria-hidden="true"
        />
      </button>
      <NuxtLink
        class="nav-item"
        :class="{ active: route.path.startsWith('/news') }"
        to="/news"
        >Noticias</NuxtLink
      >
      <NuxtLink
        class="nav-item"
        :class="{ active: route.path.startsWith('/tournaments') }"
        to="/tournaments"
        >Torneos</NuxtLink
      >
      <NuxtLink
        class="nav-item"
        :class="{
          active:
            route.path.startsWith('/teams') ||
            route.path.startsWith('/players'),
        }"
        to="/teams"
        >Equipos</NuxtLink
      >
      <NuxtLink
        class="nav-item"
        :class="{ active: route.path === '/matches/manage' }"
        to="/matches/manage"
        >Operar partidos</NuxtLink
      >
    </nav>
    <button
      class="theme-switch"
      type="button"
      :aria-label="
        isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      "
      @click="toggleTheme"
    >
      <span
        class="theme-switch-track"
        :class="{ 'is-light': !isDarkTheme, 'is-dark': isDarkTheme }"
      >
        <SunIcon class="theme-icon sun" aria-hidden="true" />
        <MoonIcon class="theme-icon moon" aria-hidden="true" />
        <span class="theme-thumb" aria-hidden="true" />
      </span>
    </button>
  </header>
</template>

<style scoped>
html[data-theme="light"] .header,
html[data-theme="light"] .header nav button,
html[data-theme="light"] .brand,
html[data-theme="light"] .nav-item {
  color: var(--text-color) !important;
}
html[data-theme="light"] .header nav button {
  color: var(--muted) !important;
}
.header nav,
.header nav button,
.header .brand,
.header .nav-item {
  color: var(--text-color);
}
button:hover {
  color: var(--accent);
}
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 80px;
  padding: 0 44px;
  display: flex;
  align-items: center;
  gap: 70px;
  border-bottom: 1px solid var(--border);
  background: var(--header-bg);
  backdrop-filter: blur(8px);
  transition:
    background 0.28s ease,
    border-color 0.28s ease;
}
.brand {
  display: flex;
  align-items: center;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -1.4px;
  color: var(--header-text);
}
.brand-dot {
  color: var(--accent);
}
.brand-icon {
  background: var(--accent-fill);
  color: #10160c;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  font-size: 24px;
  font-style: italic;
  line-height: 25px;
  text-align: center;
  position: relative;
  margin-right: 10px;
}
.brand-icon span {
  display: none;
}
.header nav {
  display: flex;
  gap: 32px;
  align-self: stretch;
}
.header nav button,
.header nav .nav-item {
  font-size: 13px;
  color: var(--muted);
  position: relative;
  padding: 0 3px;
  height: 100%;
  display: inline-flex;
  align-items: center;
}
.header nav button.active,
.header nav .nav-item.active {
  color: var(--header-text);
}
.theme-switch {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.theme-switch-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 62px;
  height: 32px;
  padding: 4px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(124, 93, 246, 0.28),
    rgba(18, 22, 26, 0.96)
  );
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  transition:
    background 0.28s ease,
    transform 0.28s ease,
    border-color 0.28s ease;
  overflow: hidden;
}
.theme-switch-track.is-light {
  background: linear-gradient(
    90deg,
    rgba(247, 201, 94, 0.33),
    rgba(247, 243, 234, 0.96)
  );
  border-color: rgba(143, 110, 38, 0.08);
}
.theme-switch-track.is-dark {
  background: linear-gradient(
    90deg,
    rgba(124, 93, 246, 0.3),
    rgba(18, 22, 26, 0.96)
  );
}
.theme-thumb {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9d8dfd, #6f5ae4);
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.18);
  transition:
    transform 0.28s ease,
    background 0.28s ease,
    box-shadow 0.28s ease;
}
.theme-switch-track.is-dark .theme-thumb {
  transform: translateX(0px);
  background: linear-gradient(135deg, #9d8dfd, #6f5ae4);
}
.theme-switch-track.is-light .theme-thumb {
  transform: translateX(30px);
  background: linear-gradient(135deg, #f7d788, #e1a63a);
}
.theme-icon {
  position: absolute;
  width: 14px;
  height: 14px;
  z-index: 1;
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}
.theme-icon.sun {
  right: 8px;
  color: #f5c75e;
  opacity: 1;
}
.theme-icon.moon {
  left: 8px;
  color: #7c5df6;
  opacity: 0.95;
}
.theme-switch-track.is-dark .theme-icon.sun {
  opacity: 0.35;
  transform: scale(0.8);
}
.theme-switch-track.is-dark .theme-icon.moon {
  opacity: 1;
  transform: scale(1.15);
}
.theme-switch-track.is-light .theme-icon.moon {
  opacity: 0.35;
  transform: scale(0.8);
}
.theme-switch-track.is-light .theme-icon.sun {
  opacity: 1;
  transform: scale(1.15);
}
.theme-switch-track .theme-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18));
}
.header nav button.active:after,
.header nav .nav-item.active:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: -3px;
  right: -3px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #78d83f 14%,
    #d7ff83 50%,
    #78d83f 86%,
    transparent 100%
  );
  box-shadow: 0 -1px 8px color-mix(in srgb, var(--accent) 45%, transparent);
}
.nav-star {
  margin-left: 8px;
  font-size: 18px;
}
@media (max-width: 1050px) {
  .header {
    gap: 40px;
    padding: 0 30px;
  }
}
@media (max-width: 700px) {
  .header {
    height: 67px;
    padding: 0 20px;
    gap: 20px;
    justify-content: space-between;
  }
  .brand {
    font-size: 24px;
  }
  .brand-icon {
    width: 24px;
    height: 24px;
    font-size: 21px;
    line-height: 22px;
  }
  .header nav {
    gap: 19px;
  }
  .header nav button {
    font-size: 11px;
  }
  .nav-star {
    display: none;
  }
}

.ui-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}
.ui-icon.nav-star {
  display: inline-block;
  margin-left: 8px;
}

.nav-item {
  font-size: 12px;
  color: var(--ui-muted, #9299a6);
}
.nav-item:hover {
  color: var(--header-text);
}
.header nav {
  align-items: center;
  min-width: 0;
  overflow-x: visible;
}
.header nav > * {
  flex-shrink: 0;
  white-space: nowrap;
}
.header nav button {
  height: 100%;
}
@media (max-width: 700px) {
  .header {
    gap: 14px;
    padding: 0 12px;
  }
  .header nav {
    gap: 14px;
    overflow-x: auto;
    min-width: 0;
    scrollbar-width: none;
  }
  .header nav::-webkit-scrollbar {
    display: none;
  }
  .header nav > * {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .header .brand {
    flex-shrink: 0;
  }
  .header nav button,
  .header .nav-item {
    font-size: 10px;
  }
}
</style>
