<script setup lang="ts">
import Bold from "@tiptap/extension-bold";
import CharacterCount from "@tiptap/extension-character-count";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/vue-3";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    limit?: number;
  }>(),
  { limit: 500 },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  count: [value: number];
}>();
const limitAttempted = ref(false);

function backendToHtml(value: string) {
  if (!value) return "";
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function htmlToBackend(value: string) {
  return value
    .replaceAll("<strong>", "<b>")
    .replaceAll("</strong>", "</b>")
    .replaceAll("<em>", "<i>")
    .replaceAll("</em>", "</i>")
    .replace(/<p>([\s\S]*?)<\/p>/g, "$1\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/\n+$/, "");
}

const editor = useEditor({
  immediatelyRender: false,
  content: backendToHtml(props.modelValue),
  extensions: [
    Document,
    Paragraph,
    Text,
    HardBreak,
    Bold,
    Italic,
    CharacterCount.configure({ limit: props.limit }),
  ],
  editorProps: {
    attributes: {
      class: "content-editor",
      role: "textbox",
      "aria-labelledby": "news-content-label",
      "aria-describedby": "news-content-limit",
      "aria-multiline": "true",
      spellcheck: "true",
      "data-placeholder": "Escribe la noticia. Separa los párrafos con una línea en blanco.",
    },
    handleTextInput(view, from, to, text) {
      const count = view.state.doc.textContent.length - (to - from) + text.length;
      limitAttempted.value = count > props.limit;
      return false;
    },
    handlePaste(view, event) {
      const text = event.clipboardData?.getData("text/plain") ?? "";
      const { from, to } = view.state.selection;
      const count = view.state.doc.textContent.length - (to - from) + text.length;
      limitAttempted.value = count > props.limit;
      return false;
    },
  },
  onCreate: ({ editor: instance }) => {
    instance.commands.setContent(backendToHtml(props.modelValue), { emitUpdate: false });
    emit("count", instance.storage.characterCount.characters());
  },
  onSelectionUpdate: () => {
    limitAttempted.value = false;
  },
  onUpdate: ({ editor: instance }) => {
    const count = instance.storage.characterCount.characters();
    limitAttempted.value = count >= props.limit ? limitAttempted.value : false;
    emit("count", count);
    emit("update:modelValue", htmlToBackend(instance.getHTML()));
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const next = backendToHtml(value);
    if (htmlToBackend(editor.value.getHTML()) !== value)
      editor.value.commands.setContent(next, { emitUpdate: false });
    emit("count", editor.value.storage.characterCount.characters());
  },
);

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div class="editor-field">
    <span id="news-content-label">Contenido</span>
    <div v-if="editor" class="format-toolbar" aria-label="Formato del contenido">
      <button
        type="button"
        title="Negrita"
        aria-label="Aplicar negrita"
        :class="{ active: editor.isActive('bold') }"
        :aria-pressed="editor.isActive('bold')"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <strong>N</strong>
      </button>
      <button
        type="button"
        title="Cursiva"
        aria-label="Aplicar cursiva"
        :class="{ active: editor.isActive('italic') }"
        :aria-pressed="editor.isActive('italic')"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <em>C</em>
      </button>
      <span>Selecciona texto o activa el formato antes de escribir</span>
    </div>
    <EditorContent :editor="editor" :class="{ invalid: limitAttempted }" />
    <div
      id="news-content-limit"
      class="content-limit"
      :class="{
        warning: limitAttempted || (editor?.storage.characterCount.characters() ?? 0) >= limit,
      }"
      :role="limitAttempted ? 'alert' : undefined"
    >
      <span>{{
        limitAttempted
          ? "Alcanzaste el máximo permitido."
          : "Las etiquetas de formato no cuentan en el límite."
      }}</span>
      <strong>{{ editor?.storage.characterCount.characters() ?? 0 }} / {{ limit }}</strong>
    </div>
  </div>
</template>

<style scoped>
.editor-field,
.format-toolbar {
  min-width: 0;
}
.editor-field {
  display: grid;
  color: var(--muted);
  font-size: 14px;
}
.editor-field > span {
  margin-bottom: 8px;
}
.format-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: var(--surface);
}
.format-toolbar button {
  display: grid;
  place-items: center;
  width: 34px;
  min-height: 34px;
  padding: 0;
}
.format-toolbar button.active {
  border-color: var(--accent);
  background: var(--ui-success-soft);
  color: var(--accent);
  box-shadow: inset 0 -2px var(--accent);
}
.format-toolbar span {
  margin-left: 5px;
  color: var(--muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}
:deep(.content-editor) {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-height: 170px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 0 0 8px 8px;
  background: var(--panel-bg);
  color: var(--text-color);
  font: inherit;
  font-size: 16px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  word-break: break-word;
  outline: none;
  cursor: text;
}
:deep(.content-editor p) {
  margin: 0;
}
:deep(.content-editor p + p) {
  margin-top: 1em;
}
:deep(.content-editor i),
:deep(.content-editor em) {
  font-style: italic !important;
}
:deep(.content-editor p.is-editor-empty:first-child::before) {
  float: left;
  height: 0;
  color: var(--muted);
  content: attr(data-placeholder);
  pointer-events: none;
}
:deep(.content-editor:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, 0.12));
}
.invalid :deep(.content-editor) {
  border-color: var(--ui-danger, #e46f68);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-danger, #e46f68) 16%, transparent);
}
.content-limit {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}
.content-limit strong {
  flex-shrink: 0;
  color: var(--text-color);
}
.content-limit.warning,
.content-limit.warning strong {
  color: var(--ui-danger, #e46f68);
}
@media (max-width: 640px) {
  .format-toolbar span {
    display: none;
  }
}
</style>
