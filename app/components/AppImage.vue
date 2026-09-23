<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ src?: string | null; alt: string; eager?: boolean }>(), {
  src: null,
  eager: false,
});
const failed = ref(false);
watch(
  () => props.src,
  () => {
    failed.value = false;
  },
);
</script>

<template>
  <span class="app-image" :class="{ fallback: !src || failed }">
    <img
      v-if="src && !failed"
      v-bind="$attrs"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @error="failed = true"
    />
    <span v-else class="image-fallback" role="img" :aria-label="alt || 'Imagen no disponible'">
      <span aria-hidden="true">m↗</span><small>Imagen no disponible</small>
    </span>
  </span>
</template>

<style scoped>
.app-image {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--panel-strong);
}
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 120px;
  place-content: center;
  gap: 8px;
  text-align: center;
  background: linear-gradient(135deg, var(--panel-strong), var(--ui-success-soft));
  color: var(--muted);
}
.image-fallback > span {
  color: var(--accent);
  font-size: 28px;
  font-weight: 800;
}
.image-fallback small {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>
