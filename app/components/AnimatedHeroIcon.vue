<script setup lang="ts">
import type { Component } from 'vue'
const props = withDefaults(defineProps<{ icon: Component; motion?: 'lift' | 'arrow' | 'turn' | 'pop'; active?: boolean }>(), { motion: 'lift', active: false })
const animationFrame = useTemplateRef<HTMLSpanElement>('animationFrame')
let popAnimation: Animation | undefined
watch(() => props.active, (active) => {
  if (props.motion !== 'pop') return
  popAnimation?.cancel()
  if (!animationFrame.value) return
  popAnimation = animationFrame.value.animate(active ? [
    { transform: 'scale(.65) rotate(-18deg)', offset: 0 },
    { transform: 'scale(2.4) rotate(10deg)', offset: .35 },
    { transform: 'scale(2.4) rotate(10deg)', offset: .55 },
    { transform: 'scale(.94) rotate(-4deg)', offset: .8 },
    { transform: 'scale(1.1) rotate(2deg)', offset: .92 },
    { transform: 'scale(1) rotate(0)', offset: 1 },
  ] : [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: active ? 1500 : 250, easing: 'cubic-bezier(.2,.8,.3,1)' })
}, { flush: 'post' })
onBeforeUnmount(() => popAnimation?.cancel())
</script>
<template>
  <span class="animated-hero" :class="[`hero-${motion}`, { 'hero-active': active }]" aria-hidden="true">
    <span ref="animationFrame" class="hero-animation-frame"><component :is="icon" class="hero-glyph" aria-hidden="true" /></span>
  </span>
</template>

<style scoped>





.animated-hero{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;width:18px;height:18px;flex-shrink:0}
.hero-animation-frame{display:block;width:100%;height:100%;transform-origin:top right}
.hero-glyph{display:block;width:100%;height:100%;transform-origin:center}
@media(prefers-reduced-motion:no-preference){
  .hero-glyph{transition:transform .22s ease,color .22s ease}
  .hero-lift:hover .hero-glyph,button:hover .hero-lift .hero-glyph,a:hover .hero-lift .hero-glyph{transform:translateY(-2px)}
  .hero-arrow:hover .hero-glyph,button:hover .hero-arrow .hero-glyph,a:hover .hero-arrow .hero-glyph{animation:hero-arrow .55s ease both}
  .hero-turn:hover .hero-glyph,button:hover .hero-turn .hero-glyph{transform:rotate(20deg)}
  button:active .animated-hero:not(.hero-pop) .hero-glyph{transform:scale(.9)}
}
@keyframes hero-arrow{0%,100%{transform:translateX(0)}45%{transform:translateX(3px)}}
</style>

