<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt: string;
    eager?: boolean;
    width?: number;
    height?: number;
    fit?: "cover" | "contain";
    fill?: boolean;
  }>(),
  {
    src: null,
    eager: false,
    width: undefined,
    height: undefined,
    fit: "cover",
    fill: false,
  },
);
const failed = ref(false);
const dimensions = computed(() =>
  props.fill
    ? {
        position: "absolute" as const,
        inset: "0",
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        height: "100%",
        minHeight: "100%",
        maxHeight: "100%",
      }
    : {
        width: props.width ? `${props.width}px` : undefined,
        minWidth: props.width ? `${props.width}px` : undefined,
        maxWidth: props.width ? `${props.width}px` : undefined,
        height: props.height ? `${props.height}px` : undefined,
        minHeight: props.height ? `${props.height}px` : undefined,
        maxHeight: props.height ? `${props.height}px` : undefined,
      },
);
watch(
  () => props.src,
  () => {
    failed.value = false;
  },
);
</script>

<template>
  <span v-bind="$attrs" class="app-image" :class="{ fallback: !src || failed }" :style="dimensions">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      :style="{ objectFit: fit }"
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
