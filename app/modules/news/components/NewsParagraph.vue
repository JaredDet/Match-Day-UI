<script setup lang="ts">
import { plainNewsText } from "~/modules/news/utils/preview";
const props = defineProps<{ text: string }>();
const block = computed(() => {
  const heading = props.text.match(/^<(h[1-4])>([\s\S]*)<\/\1>$/);
  return {
    tag: heading?.[1] ?? "p",
    content: heading?.[2] ?? props.text,
    styleClass: heading ? `news-${heading[1]}` : "",
  };
});
const parts = computed(() => {
  let bold = false,
    italic = false;
  return block.value.content.split(/(<\/?[bi]>)/g).flatMap((token) => {
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
  <component :is="block.tag" class="news-block" :class="block.styleClass">
    <span
      v-for="(part, index) in parts"
      :key="index"
      :class="{ bold: part.bold, italic: part.italic }"
      >{{ `${part.before ? " " : ""}${part.text}${part.after ? " " : ""}` }}</span
    >
  </component>
</template>
<style scoped>
.news-block {
  line-height: 1.8;
  color: var(--muted);
}
.news-h1,
.news-h2,
.news-h3,
.news-h4 {
  margin: 1.4em 0 0.55em;
  color: var(--text-color);
  font-weight: 700;
  line-height: 1.3;
}
.news-h1,
.news-h2 {
  color: var(--accent);
}
.news-h1 {
  font-size: 1.8rem;
}
.news-h2 {
  font-size: 1.55rem;
}
.news-h3 {
  font-size: 1.3rem;
}
.news-h4 {
  font-size: 1.1rem;
}
.bold {
  font-weight: 700;
}
.italic {
  font-style: italic;
  font-synthesis: style;
}
</style>
