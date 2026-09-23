<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import ManagementPanel from "~/components/ManagementPanel.vue";
import AppSelect from "~/components/AppSelect.vue";
import NewsParagraph from "~/modules/news/components/NewsParagraph.vue";
import { useDemoNews } from "~/modules/news/composables/useDemoNews";
import { newsDate } from "~/modules/news/data/news";
import { newsPreview } from "~/modules/news/utils/preview";
import { useDemoTeams } from "~/modules/teams/composables/useDemoTeams";

const MAX_CONTENT_LENGTH = 500;
const { items, save, act, publishDue } = useDemoNews();
const { teams } = useDemoTeams();
const selected = ref(""),
  title = ref(""),
  team = ref(""),
  content = ref(""),
  date = ref(""),
  filter = ref("all"),
  message = ref(""),
  error = ref("");
const cover = ref<string | null>(null);
const contentEditor = ref<HTMLElement>();
const contentLength = ref(0),
  limitAttempted = ref(false),
  boldActive = ref(false),
  italicActive = ref(false);
let editorSelection: Range | null = null;
const visible = computed(() =>
  items.value.filter(
    (item) => filter.value === "all" || item.status === filter.value,
  ),
);
const previewParagraph = computed(
  () =>
    content.value
      .split(/\n\s*\n/)
      .find((paragraph) => newsPreview([paragraph])) ?? "",
);
const contentAtLimit = computed(
  () => contentLength.value >= MAX_CONTENT_LENGTH,
);
const savedSnapshot = ref("");
const formSnapshot = computed(() =>
  JSON.stringify([
    selected.value,
    title.value,
    team.value,
    content.value,
    cover.value,
  ]),
);
useUnsavedChanges(
  computed(() =>
    !!title.value || !!content.value
      ? formSnapshot.value !== savedSnapshot.value
      : false,
  ),
);
const labels = {
  DRAFT: "Borrador",
  SCHEDULED: "Programada",
  PUBLISHED: "Publicada",
};

function run(action: () => void, success: string) {
  error.value = "";
  message.value = "";
  try {
    action();
    message.value = success;
  } catch (exception) {
    error.value = (exception as Error).message;
  }
}
function serializeEditor() {
  const editor = contentEditor.value;
  if (!editor) return;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE)
      return (node.textContent ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    if (!(node instanceof HTMLElement)) return "";
    const children = [...node.childNodes].map(walk).join("");
    if (["B", "STRONG"].includes(node.tagName)) return `<b>${children}</b>`;
    if (["I", "EM"].includes(node.tagName)) return `<i>${children}</i>`;
    if (node.tagName === "BR") return "\n";
    if (["DIV", "P"].includes(node.tagName)) return `${children}\n`;
    return children;
  };
  content.value = [...editor.childNodes]
    .map(walk)
    .join("")
    .replace(/<i><b>([\s\S]*?)<\/b><\/i>/g, "<b><i>$1</i></b>")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n+$/, "");
  contentLength.value = (editor.innerText || editor.textContent || "").replace(
    /\n+$/,
    "",
  ).length;
  if (contentLength.value < MAX_CONTENT_LENGTH) limitAttempted.value = false;
}
function removeEmptyFormatting() {
  const editor = contentEditor.value;
  if (!editor) return;
  const selection = window.getSelection();
  const emptyNodes = [...editor.querySelectorAll("b, strong, i, em")].reverse();
  for (const node of emptyNodes) {
    if (node.textContent || node.querySelector("br")) continue;
    if (selection?.rangeCount && node.contains(selection.anchorNode)) {
      const caret = document.createRange();
      caret.setStartBefore(node);
      caret.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caret);
    }
    node.remove();
  }
  if (!(editor.innerText || editor.textContent || "").length) {
    editor.innerHTML = "";
    boldActive.value = false;
    italicActive.value = false;
  }
}
function handleEditorInput(event: InputEvent) {
  if (event.inputType.startsWith("delete")) removeEmptyFormatting();
  serializeEditor();
  rememberSelection(false);
}
function renderEditor() {
  if (!contentEditor.value) return;
  contentEditor.value.innerHTML = content.value.replaceAll("\n", "<br>");
  serializeEditor();
}
async function edit(id = "") {
  const item = items.value.find((news) => news.id === id);
  selected.value = id;
  title.value = item?.title ?? "";
  team.value = item?.team_id ?? "";
  content.value = item?.content.children.join("\n\n") ?? "";
  cover.value = item?.cover_image ?? null;
  limitAttempted.value = false;
  error.value = "";
  message.value = "";
  await nextTick();
  renderEditor();
  savedSnapshot.value = formSnapshot.value;
}
function submit() {
  serializeEditor();
  if (!contentLength.value) {
    error.value = "Escribe el contenido de la noticia antes de guardarla.";
    return;
  }
  if (contentLength.value > MAX_CONTENT_LENGTH) {
    error.value = "El contenido no puede superar los 500 caracteres.";
    return;
  }
  run(() => {
    save(
      {
        title: title.value,
        team_id: team.value || null,
        cover_image: cover.value,
        content: { children: content.value.split(/\n\s*\n/) },
      },
      selected.value || undefined,
    );
    edit();
  }, "Borrador guardado.");
}
function selectionInsideEditor() {
  const editor = contentEditor.value,
    selection = window.getSelection();
  if (!editor || !selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer)
    ? { selection, range }
    : null;
}
function rememberSelection(syncButtons = true) {
  const current = selectionInsideEditor();
  if (!current) return;
  editorSelection = current.range.cloneRange();
  if (syncButtons) {
    boldActive.value = document.queryCommandState("bold");
    italicActive.value = document.queryCommandState("italic");
  }
}
function rememberKeyboardSelection(event: KeyboardEvent) {
  const navigationKeys = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ];
  rememberSelection(navigationKeys.includes(event.key));
}
function restoreSelection() {
  const selection = window.getSelection();
  if (!selection || !editorSelection) return;
  selection.removeAllRanges();
  selection.addRange(editorSelection);
}
function applyFormat(command: "bold" | "italic") {
  if (!contentEditor.value) return;
  contentEditor.value.focus();
  restoreSelection();
  const current = selectionInsideEditor();
  if (!current) return;
  if (current.range.collapsed) {
    if (command === "bold") boldActive.value = !boldActive.value;
    else italicActive.value = !italicActive.value;
  } else {
    document.execCommand(command, false);
    boldActive.value = document.queryCommandState("bold");
    italicActive.value = document.queryCommandState("italic");
  }
  rememberSelection(false);
  serializeEditor();
}
function selectedTextLength() {
  return selectionInsideEditor()?.selection.toString().length ?? 0;
}
function leaveInactiveFormat(command: "bold" | "italic") {
  const current = selectionInsideEditor();
  const editor = contentEditor.value;
  if (!current || !editor) return;
  const tags = command === "bold" ? ["B", "STRONG"] : ["I", "EM"];
  let node: Node | null = current.range.startContainer;
  while (node && node !== editor) {
    if (node instanceof HTMLElement && tags.includes(node.tagName)) {
      const caret = document.createRange();
      caret.setStartAfter(node);
      caret.collapse(true);
      current.selection.removeAllRanges();
      current.selection.addRange(caret);
      editorSelection = caret.cloneRange();
      return;
    }
    node = node.parentNode;
  }
}
function formattedHtml(value: string) {
  let html = escapeHtml(value);
  if (italicActive.value) html = `<i>${html}</i>`;
  if (boldActive.value) html = `<b>${html}</b>`;
  return html;
}
function enforceContentLimit(event: InputEvent) {
  if (!event.inputType.startsWith("insert")) return;
  const addition =
    event.data?.length ??
    (["insertParagraph", "insertLineBreak"].includes(event.inputType) ? 1 : 0);
  if (
    contentLength.value - selectedTextLength() + addition >
    MAX_CONTENT_LENGTH
  ) {
    event.preventDefault();
    limitAttempted.value = true;
    return;
  }
  if (event.inputType !== "insertText" || !event.data) return;
  event.preventDefault();
  if (!boldActive.value) leaveInactiveFormat("bold");
  if (!italicActive.value) leaveInactiveFormat("italic");
  document.execCommand("insertHTML", false, formattedHtml(event.data));
  serializeEditor();
  rememberSelection(false);
}
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");
}
function pasteContent(event: ClipboardEvent) {
  event.preventDefault();
  const pasted = event.clipboardData?.getData("text/plain") ?? "";
  const available = Math.max(
    0,
    MAX_CONTENT_LENGTH - contentLength.value + selectedTextLength(),
  );
  const accepted = pasted.slice(0, available);
  if (!boldActive.value) leaveInactiveFormat("bold");
  if (!italicActive.value) leaveInactiveFormat("italic");
  const html = formattedHtml(accepted);
  if (html) document.execCommand("insertHTML", false, html);
  if (accepted.length < pasted.length) limitAttempted.value = true;
  serializeEditor();
  rememberSelection(false);
}
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    error.value =
      "Elige una imagen JPG, PNG o WebP de hasta 5 MB para esta demo.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    cover.value = String(reader.result);
  };
  reader.onerror = () => {
    error.value = "No se pudo leer la imagen.";
  };
  reader.readAsDataURL(file);
}
useHead({ title: "Administrar noticias · Matchday" });
</script>

<template>
  <main class="news-management">
    <PageHeading
      title="Administrar noticias"
      kicker="DEMO"
      back-to="/news"
      back-label="Ver publicaciones"
      description="Prepara borradores, programa noticias y publica durante esta sesión."
    />
    <p v-if="error" role="alert" class="feedback error">{{ error }}</p>
    <p v-if="message" role="status" class="feedback">{{ message }}</p>
    <div class="columns">
      <ManagementPanel :title="selected ? 'Editar borrador' : 'Nueva noticia'">
        <form @submit.prevent="submit">
          <label
            >Título<input v-model="title" maxlength="200" required
          /></label>
          <label
            >Equipo<AppSelect v-model="team" :disabled="!!selected"
              ><option value="">Noticia general</option>
              <option v-for="club in teams" :key="club.id" :value="club.id">
                {{ club.name }}
              </option></AppSelect
            ></label
          >
          <div class="editor-field">
            <span id="news-content-label">Contenido</span>
            <div class="format-toolbar" aria-label="Formato del contenido">
              <button
                type="button"
                title="Negrita"
                aria-label="Aplicar negrita"
                :class="{ active: boldActive }"
                :aria-pressed="boldActive"
                @mousedown.prevent
                @click="applyFormat('bold')"
              >
                <strong>N</strong>
              </button>
              <button
                type="button"
                title="Cursiva"
                aria-label="Aplicar cursiva"
                :class="{ active: italicActive }"
                :aria-pressed="italicActive"
                @mousedown.prevent
                @click="applyFormat('italic')"
              >
                <em>C</em>
              </button>
              <span
                >Selecciona texto o activa el formato antes de escribir</span
              >
            </div>
            <div
              ref="contentEditor"
              class="content-editor"
              :class="{ invalid: limitAttempted }"
              contenteditable="true"
              role="textbox"
              aria-labelledby="news-content-label"
              aria-describedby="news-content-limit"
              aria-multiline="true"
              spellcheck="true"
              data-placeholder="Escribe la noticia. Separa los párrafos con una línea en blanco."
              @beforeinput="enforceContentLimit"
              @paste="pasteContent"
              @input="handleEditorInput"
              @mouseup="rememberSelection()"
              @keyup="rememberKeyboardSelection"
              @focus="rememberSelection()"
            />
            <div
              id="news-content-limit"
              class="content-limit"
              :class="{ warning: contentAtLimit || limitAttempted }"
              :role="limitAttempted ? 'alert' : undefined"
            >
              <span>{{
                limitAttempted
                  ? "Alcanzaste el máximo permitido."
                  : "Las etiquetas de formato no cuentan en el límite."
              }}</span
              ><strong>{{ contentLength }} / {{ MAX_CONTENT_LENGTH }}</strong>
            </div>
          </div>
          <label
            >Portada<input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="upload"
          /></label>
          <img v-if="cover" :src="cover" alt="Vista previa de portada" /><button
            v-if="cover"
            type="button"
            @click="cover = null"
          >
            Quitar portada
          </button>
          <div class="notice formatted-preview">
            <strong>Vista previa:</strong
            ><NewsParagraph
              v-if="previewParagraph"
              :text="previewParagraph"
            /><span v-else>Sin contenido</span>
          </div>
          <div class="actions">
            <button type="submit">Guardar borrador</button
            ><button v-if="selected" type="button" @click="edit()">
              Cancelar edición
            </button>
          </div>
        </form>
      </ManagementPanel>
      <ManagementPanel title="Publicaciones">
        <label
          >Estado<AppSelect v-model="filter"
            ><option value="all">Todos</option>
            <option v-for="(label, key) in labels" :key="key" :value="key">
              {{ label }}
            </option></AppSelect
          ></label
        >
        <label
          >Fecha de programación<input v-model="date" type="datetime-local"
        /></label>
        <button
          @click="
            run(() => {
              const count = publishDue();
              message = `${count} noticias publicadas.`;
            }, 'Revisión de noticias vencidas completada.')
          "
        >
          Publicar programadas vencidas
        </button>
        <p>
          La demo revisa las fechas al pulsar este botón; no ejecuta un monitor
          en segundo plano.
        </p>
        <p v-if="!visible.length">No hay noticias en este estado.</p>
        <article v-for="item in visible" :key="item.id" class="item">
          <h3>{{ item.title }}</h3>
          <p>
            {{ labels[item.status]
            }}<span v-if="item.scheduled_at">
              · {{ newsDate(item.scheduled_at) }}</span
            >
          </p>
          <div class="actions">
            <template v-if="item.status === 'DRAFT'"
              ><button @click="edit(item.id)">Editar</button
              ><button
                @click="
                  run(
                    () => act(item.id, 'schedule', date),
                    'Noticia programada.',
                  )
                "
              >
                Programar</button
              ><button
                @click="
                  run(() => {
                    act(item.id, 'delete');
                    if (selected === item.id) edit();
                  }, 'Borrador eliminado.')
                "
              >
                Eliminar
              </button></template
            ><button
              v-if="item.status === 'SCHEDULED'"
              @click="
                run(() => act(item.id, 'unschedule'), 'Programación cancelada.')
              "
            >
              Volver a borrador</button
            ><button
              v-if="item.status !== 'PUBLISHED'"
              @click="
                run(() => {
                  act(item.id, 'publish');
                  if (selected === item.id) edit();
                }, 'Noticia publicada.')
              "
            >
              Publicar ahora</button
            ><NuxtLink v-else :to="`/news/${item.id}`">Leer noticia</NuxtLink>
          </div>
        </article>
      </ManagementPanel>
    </div>
  </main>
</template>

<style scoped>
.news-management {
  max-width: 1280px;
  margin: auto;
  padding: 30px 24px 60px;
  color: var(--text-color);
}
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 24px;
}
.columns > *,
form,
form > *,
.editor-field,
.format-toolbar {
  min-width: 0;
}
form {
  display: grid;
  gap: 16px;
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
.content-editor {
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
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  outline: none;
  cursor: text;
}
.content-editor :deep(i),
.content-editor :deep(em) {
  font-style: italic !important;
}
.content-editor:empty:before {
  content: attr(data-placeholder);
  color: var(--muted);
  pointer-events: none;
}
.content-editor:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, 0.12));
}
.content-editor.invalid {
  border-color: var(--ui-danger, #e46f68);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--ui-danger, #e46f68) 16%, transparent);
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
.formatted-preview {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 6px;
  overflow: hidden;
  color: var(--text-color);
}
.formatted-preview :deep(p) {
  min-width: 0;
  margin: 0;
  color: var(--text-color);
  line-height: 1.65;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.formatted-preview > span {
  color: var(--muted);
}
.item {
  padding: 18px 0;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 12px;
}
.feedback {
  padding: 14px;
  margin: 16px 0;
  border: 1px solid var(--border);
  border-radius: 10px;
}
.error {
  color: var(--ui-danger, #ffaaa3);
}
@media (max-width: 850px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 700px) {
  .format-toolbar span {
    display: none;
  }
}
</style>
