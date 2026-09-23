<script setup lang="ts">
import { useMatches } from "~/modules/matches/composables/useMatches";

const { matches } = useMatches();
const active = ref(0);
const slides = computed(() =>
  matches.value.slice(0, 3).map((match, index) => ({
    match,
    image: [
      "/images/news/jornada.webp",
      "/images/news/entrenamiento.webp",
      "/images/news/celebracion.webp",
    ][index],
  })),
);
let timer: ReturnType<typeof setInterval> | undefined;
function select(index: number) {
  active.value = index;
}
function step(direction: number) {
  active.value = (active.value + direction + slides.value.length) % slides.value.length;
}
onMounted(() => {
  timer = setInterval(() => step(1), 7000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section
    v-if="slides.length"
    class="featured"
    aria-roledescription="carrusel"
    aria-label="Partidos destacados"
  >
    <article
      v-for="(slide, index) in slides"
      v-show="active === index"
      :key="slide.match.id"
      class="slide"
    >
      <img :src="slide.image" alt="" />
      <div class="shade" />
      <div class="content">
        <span>PARTIDO DESTACADO · COPA MATCHDAY</span>
        <h2>{{ slide.match.home_team.name }} <em>contra</em> {{ slide.match.away_team.name }}</h2>
        <p v-if="slide.match.status === 'finished'">
          Finalizado · {{ slide.match.home_team.score }}–{{ slide.match.away_team.score }}
        </p>
        <p v-else>Próximo encuentro · Revisa la hora y las formaciones</p>
        <ActionLink :to="`/matches/${slide.match.id}`">Ver partido</ActionLink>
      </div>
    </article>
    <div class="controls">
      <button aria-label="Partido anterior" @click="step(-1)">←</button>
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="dot"
        :class="{ active: active === index }"
        :aria-label="`Mostrar destacado ${index + 1}`"
        :aria-current="active === index ? 'true' : undefined"
        @click="select(index)"
      />
      <button aria-label="Partido siguiente" @click="step(1)">→</button>
    </div>
  </section>
</template>

<style scoped>
.featured {
  position: relative;
  max-width: 1280px;
  min-height: clamp(360px, 52vw, 560px);
  margin: 28px auto 20px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  color: #fff;
}
.slide {
  position: absolute;
  inset: 0;
}
.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(5, 8, 10, 0.94) 0%,
      rgba(5, 8, 10, 0.72) 42%,
      rgba(5, 8, 10, 0.08) 78%
    ),
    linear-gradient(0deg, rgba(5, 8, 10, 0.72), transparent 55%);
}
.content {
  position: absolute;
  z-index: 1;
  left: clamp(24px, 5vw, 68px);
  bottom: clamp(54px, 8vw, 88px);
  display: grid;
  gap: 16px;
  max-width: 650px;
}
.content > span {
  font-size: 11px;
  letter-spacing: 1.8px;
  color: #caff7a;
}
.content h2 {
  max-width: 620px;
  font-size: clamp(34px, 5.4vw, 68px);
  line-height: 0.98;
  letter-spacing: -2px;
}
.content h2 em {
  display: block;
  margin: 8px 0;
  font: 500 13px/1 sans-serif;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #c0c8bc;
}
.content p {
  font-size: 14px;
  color: #e4e9e1;
}
.controls {
  position: absolute;
  z-index: 2;
  right: 24px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 9px;
}
.controls button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #ffffff4a;
  border-radius: 50%;
  background: #080b0ca8;
  color: #fff;
  cursor: pointer;
}
.controls .dot {
  width: 9px;
  height: 9px;
  border: 0;
  background: #ffffff65;
}
.controls .dot.active {
  width: 28px;
  border-radius: 8px;
  background: linear-gradient(90deg, #73d73d, #d6ff83);
}
@media (max-width: 700px) {
  .featured {
    min-height: 430px;
    margin: 18px 16px;
  }
  .shade {
    background: linear-gradient(
      0deg,
      rgba(5, 8, 10, 0.96) 0%,
      rgba(5, 8, 10, 0.48) 72%,
      rgba(5, 8, 10, 0.15)
    );
  }
  .content {
    right: 24px;
    bottom: 76px;
  }
  .content h2 {
    font-size: 36px;
  }
  .controls {
    right: 18px;
    bottom: 18px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .slide {
    animation: reveal 0.35s ease;
  }
  .controls button {
    transition:
      width 0.2s,
      background 0.2s,
      transform 0.2s;
  }
  .controls button:hover {
    transform: translateY(-2px);
  }
  @keyframes reveal {
    from {
      opacity: 0.35;
      transform: scale(1.015);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}
</style>
