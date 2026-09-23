<script setup lang="ts">
import type { NuxtError } from "#app";
import "~/assets/css/main.css";
import AppFooter from "~/components/AppFooter.vue";
import AppHeader from "~/components/AppHeader.vue";

const props = defineProps<{ error: NuxtError }>();
const isNotFound = computed(() => props.error.statusCode === 404);
const title = computed(() =>
  isNotFound.value ? "Esta página quedó fuera de juego" : "No pudimos cargar esta página",
);
const description = computed(() =>
  isNotFound.value
    ? "La dirección no existe o el contenido fue movido. Puedes volver al inicio o revisar los partidos disponibles."
    : "Ocurrió un problema inesperado. Vuelve a intentarlo desde una sección segura de Matchday.",
);

function leaveError(path: string) {
  clearError({ redirect: path });
}

useHead({ title: computed(() => `${props.error.statusCode} · Matchday`) });
</script>

<template>
  <div class="error-shell">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <main class="error-page">
      <section class="error-card">
        <div class="error-copy">
          <div class="score" aria-hidden="true">
            <span>{{ error.statusCode }}</span>
          </div>
          <p class="kicker">
            {{ isNotFound ? "FUERA DE JUEGO" : "PARTIDO INTERRUMPIDO" }}
          </p>
          <h1>{{ title }}</h1>
          <p class="description">{{ description }}</p>
          <div class="actions">
            <button class="primary" @click="leaveError('/')">Volver al inicio</button>
            <button @click="leaveError('/tournaments')">Ver torneos</button>
          </div>
        </div>
        <div class="football-scene" aria-hidden="true">
          <div class="stadium-light light-one"></div>
          <div class="stadium-light light-two"></div>
          <div class="pitch">
            <span class="halfway"></span><span class="centre-circle"></span>
            <span class="penalty-area"></span><span class="goal"></span>
            <span class="player player-one"></span><span class="player player-two"></span
            ><span class="player player-three"></span> <span class="ball">⚽</span
            ><span class="ball-shadow"></span>
          </div>
          <p>El balón sigue rodando</p>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.error-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--page-bg);
  color: var(--text-color);
}
.error-page {
  width: 100%;
  max-width: 1280px;
  margin: auto;
  padding: 64px 24px;
  display: grid;
  place-items: center;
  flex: 1;
}
.error-card {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.85fr);
  align-items: center;
  gap: clamp(38px, 7vw, 90px);
}
.score {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 26px;
  color: var(--accent);
}
.score span {
  font-size: clamp(76px, 16vw, 148px);
  font-weight: 800;
  line-height: 0.78;
  letter-spacing: -8px;
}
.kicker {
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}
h1 {
  max-width: 600px;
  font-size: clamp(34px, 6vw, 62px);
  line-height: 1.05;
  letter-spacing: -2px;
}
.description {
  max-width: 610px;
  margin-top: 20px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}
.actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
button {
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel-bg);
  color: var(--text-color);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}
button:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.football-scene {
  position: relative;
  min-height: 420px;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.football-scene > p {
  position: absolute;
  bottom: 4px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}
.pitch {
  position: relative;
  width: min(100%, 430px);
  aspect-ratio: 4/3;
  overflow: hidden;
  border: 2px solid color-mix(in srgb, var(--accent) 58%, var(--border));
  border-radius: 28px;
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--ui-success-soft) 76%, var(--surface)),
    var(--surface)
  );
  box-shadow: 0 30px 60px var(--shadow);
  transform: perspective(700px) rotateX(7deg) rotateZ(-3deg);
}
.pitch:before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0 54px,
    color-mix(in srgb, var(--accent) 5%, transparent) 55px 108px
  );
}
.halfway {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  border-left: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
}
.centre-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 110px;
  height: 110px;
  border: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.penalty-area {
  position: absolute;
  right: -2px;
  top: 27%;
  width: 104px;
  height: 46%;
  border: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
}
.goal {
  position: absolute;
  right: -1px;
  top: 39%;
  width: 22px;
  height: 22%;
  border: 3px solid var(--text-color);
  border-right: 0;
  opacity: 0.65;
}
.player {
  position: absolute;
  width: 13px;
  height: 13px;
  border: 3px solid var(--surface);
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 3px 9px var(--shadow);
}
.player-one {
  left: 22%;
  top: 28%;
}
.player-two {
  left: 49%;
  top: 65%;
}
.player-three {
  right: 20%;
  top: 23%;
}
.ball {
  position: absolute;
  z-index: 2;
  left: 39%;
  top: 48%;
  font-size: 52px;
  line-height: 1;
  filter: drop-shadow(0 8px 8px var(--shadow));
}
.ball-shadow {
  position: absolute;
  left: 43%;
  top: 66%;
  width: 46px;
  height: 13px;
  border-radius: 50%;
  background: var(--shadow);
  filter: blur(5px);
}
.stadium-light {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--ui-success-soft);
  filter: blur(2px);
  z-index: -1;
}
.light-one {
  top: 10px;
  right: 5px;
}
.light-two {
  bottom: 25px;
  left: 0;
  width: 110px;
  height: 110px;
}
@media (max-width: 600px) {
  .error-page {
    padding: 38px 18px;
  }
  .error-card {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .score span {
    letter-spacing: -5px;
  }
  .actions {
    display: grid;
  }
  .actions button {
    width: 100%;
  }
  .football-scene {
    min-height: 300px;
  }
  .pitch {
    width: min(100%, 340px);
  }
}
@media (prefers-reduced-motion: no-preference) {
  button {
    transition:
      transform 0.2s,
      border-color 0.2s,
      background-color 0.2s;
  }
  .ball {
    animation: kick 3.2s ease-in-out infinite;
  }
  .ball-shadow {
    animation: shadow 3.2s ease-in-out infinite;
  }
  .player-one {
    animation: player-move 3.2s ease-in-out infinite;
  }
  .stadium-light {
    animation: pulse 2.4s ease-in-out infinite alternate;
  }
}
@keyframes kick {
  0%,
  15% {
    transform: translate(0, 0) rotate(0);
  }
  45% {
    transform: translate(145px, -72px) rotate(300deg);
  }
  60%,
  100% {
    transform: translate(188px, -38px) rotate(520deg);
  }
}
@keyframes shadow {
  0%,
  15% {
    transform: translate(0, 0) scale(1);
  }
  45% {
    transform: translate(132px, -4px) scale(0.45);
  }
  60%,
  100% {
    transform: translate(176px, 1px) scale(0.7);
  }
}
@keyframes player-move {
  0%,
  20% {
    transform: translate(0, 0);
  }
  55%,
  100% {
    transform: translate(36px, 30px);
  }
}
@keyframes pulse {
  to {
    transform: scale(1.12);
    opacity: 0.6;
  }
}
@media (max-width: 900px) and (min-width: 601px) {
  .error-card {
    grid-template-columns: 1fr 360px;
    gap: 32px;
  }
  .ball {
    font-size: 44px;
  }
}
</style>
