<script setup lang="ts">
const props = defineProps<{ title: string; text?: string }>();
const status = ref("");
async function share() {
  const data = {
    title: props.title,
    text: props.text,
    url: window.location.href,
  };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(data.url);
      status.value = "Enlace copiado";
    }
  } catch (error) {
    if ((error as Error).name !== "AbortError") status.value = "No se pudo compartir el enlace";
  }
}
</script>
<template>
  <span class="share-control"
    ><button type="button" @click="share">Compartir</button
    ><span class="sr-only" role="status" aria-live="polite">{{ status }}</span
    ><small v-if="status" aria-hidden="true">{{ status }}</small></span
  >
</template>
<style scoped>
.share-control {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.share-control button {
  min-height: 40px;
  padding: 8px 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--panel-bg);
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
.share-control button:hover {
  border-color: var(--accent);
}
small {
  color: var(--muted);
  font-size: 11px;
}
</style>
