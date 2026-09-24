<script setup lang="ts">
import { ShareIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{ title: string; text?: string }>();
const status = ref("");
async function copyUrl(url: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const field = document.createElement("textarea");
  field.value = url;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("No se pudo copiar el enlace");
}
async function share() {
  const data = {
    title: props.title,
    text: props.text,
    url: window.location.href,
  };
  status.value = "";
  try {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    await copyUrl(data.url);
    status.value = "Enlace copiado";
  } catch (error) {
    status.value = "No se pudo copiar el enlace";
  }
}
</script>
<template>
  <span class="share-control"
    ><button type="button" aria-label="Compartir esta página" @click="share">
      <ShareIcon aria-hidden="true" /><span>Compartir</span></button
    ><small v-if="status" role="status" aria-live="polite">{{ status }}</small></span
  >
</template>
<style scoped>
.share-control {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.share-control button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 8px 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--panel-bg);
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
.share-control svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
.share-control button:hover {
  border-color: var(--accent);
}
small {
  color: var(--muted);
  font-size: 11px;
}
</style>
