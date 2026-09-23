<script setup lang="ts">
import { plainNewsText } from "~/modules/news/utils/preview";
const props = defineProps<{ text: string }>();
const parts = computed(() => {
  let bold = false,
    italic = false;
  return props.text.split(/(<\/?[bi]>)/g).flatMap((token) => {
    if (/^<\/?[bi]>$/.test(token)) {
      if (token.includes("b")) bold = token === "<b>";
      else italic = token === "<i>";
      return [];
    }
    return [
      {
        text: plainNewsText(token),
        bold,
        italic,
        before: /^\s/.test(token),
        after: /\s$/.test(token),
      },
    ];
  });
});
</script>
<template>
  <p>
    <span
      v-for="(part, index) in parts"
      :key="index"
      :class="{ bold: part.bold, italic: part.italic }"
      >{{ `${part.before ? " " : ""}${part.text}${part.after ? " " : ""}` }}</span
    >
  </p>
</template>
<style scoped>
p {
  line-height: 1.8;
  color: var(--muted);
}
.bold {
  font-weight: 700;
}
.italic {
  font-style: italic;
  font-synthesis: style;
}
</style>
