<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import ManagementPanel from "~/components/ManagementPanel.vue";
import AppSelect from "~/components/AppSelect.vue";
import NewsContentEditor from "~/modules/news/components/NewsContentEditor.vue";
import { useNewsManagement } from "~/modules/news/composables/useNewsManagement";
import { newsDate } from "~/modules/news/data/news";
import {
  NEWS_CONTENT_MAX_LENGTH,
  NEWS_PREVIEW_MAX_LENGTH,
  newsPreview,
} from "~/modules/news/utils/preview";
import { useTeams } from "~/modules/teams/composables/useTeams";

const { items, get, save, act } = useNewsManagement();
const { teams } = useTeams();
const selected = ref(""),
  title = ref(""),
  preview = ref(""),
  team = ref(""),
  content = ref(""),
  date = ref(""),
  filter = ref("all"),
  message = ref(""),
  error = ref("");
const cover = ref<string | null>(null);
const contentLength = ref(0);
const visible = computed(() =>
  items.value.filter((item) => filter.value === "all" || item.status === filter.value),
);
const previewParagraph = computed(
  () =>
    preview.value.trim() ||
    content.value
      .split(/\n\s*\n/)
      .find((paragraph) => !/^<h[1-4]>/.test(paragraph) && newsPreview([paragraph])) ||
    "",
);
const savedSnapshot = ref("");
const formSnapshot = computed(() =>
  JSON.stringify([
    selected.value,
    title.value,
    preview.value,
    team.value,
    content.value,
    cover.value,
  ]),
);
useUnsavedChanges(
  computed(() =>
    !!title.value || !!content.value ? formSnapshot.value !== savedSnapshot.value : false,
  ),
);
const labels = {
  DRAFT: "Borrador",
  SCHEDULED: "Programada",
  PUBLISHED: "Publicada",
};

async function run(action: () => Promise<unknown>, success: string) {
  error.value = "";
  message.value = "";
  try {
    await action();
    message.value = success;
  } catch (exception) {
    error.value = (exception as Error).message;
  }
}
async function edit(id = "") {
  const item = id ? await get(id) : undefined;
  selected.value = id;
  title.value = item?.title ?? "";
  preview.value = item?.preview ?? "";
  team.value = item?.team_id ?? "";
  content.value = item?.content.children.join("\n\n") ?? "";
  cover.value = item?.cover_image ?? null;
  error.value = "";
  message.value = "";
  await nextTick();
  savedSnapshot.value = formSnapshot.value;
}
async function submit() {
  if (!contentLength.value) {
    error.value = "Escribe el contenido de la noticia antes de guardarla.";
    return;
  }
  if (contentLength.value > NEWS_CONTENT_MAX_LENGTH) {
    error.value = `El contenido no puede superar los ${NEWS_CONTENT_MAX_LENGTH} caracteres.`;
    return;
  }
  await run(async () => {
    await save(
      {
        title: title.value,
        preview: preview.value,
        team_id: team.value || null,
        cover_image: cover.value,
        content: { children: content.value.split(/\n\s*\n/) },
      },
      selected.value || undefined,
    );
    await edit();
  }, "Borrador guardado.");
}
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    error.value = "Elige una imagen JPG, PNG o WebP de hasta 5 MB .";
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
      kicker="GESTIÓN"
      back-to="/news"
      back-label="Ver publicaciones"
      description="Prepara borradores, programa noticias y publica contenido."
    />
    <p v-if="error" role="alert" class="feedback error">{{ error }}</p>
    <p v-if="message" role="status" class="feedback">{{ message }}</p>
    <div class="columns">
      <ManagementPanel :title="selected ? 'Editar borrador' : 'Nueva noticia'">
        <form @submit.prevent="submit">
          <label>Título<input v-model="title" maxlength="200" required /></label>
          <label
            >Preview (opcional)<textarea
              v-model="preview"
              :maxlength="NEWS_PREVIEW_MAX_LENGTH"
              rows="3"
              placeholder="Si la dejas vacía, usaremos el primer párrafo."
            />
          </label>
          <label
            >Equipo<AppSelect v-model="team" :disabled="!!selected"
              ><option value="">Noticia general</option>
              <option v-for="club in teams" :key="club.id" :value="club.id">
                {{ club.name }}
              </option></AppSelect
            ></label
          >
          <NewsContentEditor
            v-model="content"
            :limit="NEWS_CONTENT_MAX_LENGTH"
            @count="contentLength = $event"
          />
          <label
            >Portada<input type="file" accept="image/png,image/jpeg,image/webp" @change="upload"
          /></label>
          <img v-if="cover" :src="cover" alt="Vista previa de portada" /><button
            v-if="cover"
            type="button"
            @click="cover = null"
          >
            Quitar portada
          </button>
          <div class="notice formatted-preview">
            <strong>Vista previa:</strong>
            <p v-if="previewParagraph">{{ newsPreview([previewParagraph]) }}</p>
            <span v-else>Sin contenido</span>
          </div>
          <div class="actions">
            <button type="submit">Guardar borrador</button
            ><button v-if="selected" type="button" @click="edit()">Cancelar edición</button>
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
        <label>Fecha de programación<input v-model="date" type="datetime-local" /></label>
        <p>Las noticias programadas se publican mediante el monitor del backend.</p>
        <p v-if="!visible.length">No hay noticias en este estado.</p>
        <article v-for="item in visible" :key="item.id" class="item">
          <h3>{{ item.title }}</h3>
          <p>
            {{ labels[item.status]
            }}<span v-if="item.scheduled_at"> · {{ newsDate(item.scheduled_at) }}</span>
          </p>
          <div class="actions">
            <template v-if="item.status === 'DRAFT'"
              ><button @click="edit(item.id)">Editar</button
              ><button @click="run(() => act(item.id, 'schedule', date), 'Noticia programada.')">
                Programar</button
              ><button
                @click="
                  run(async () => {
                    await act(item.id, 'delete');
                    if (selected === item.id) await edit();
                  }, 'Borrador eliminado.')
                "
              >
                Eliminar
              </button></template
            ><button
              v-if="item.status === 'SCHEDULED'"
              @click="run(() => act(item.id, 'unschedule'), 'Programación cancelada.')"
            >
              Volver a borrador</button
            ><button
              v-if="item.status !== 'PUBLISHED'"
              @click="
                run(async () => {
                  await act(item.id, 'publish');
                  if (selected === item.id) await edit();
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
form > * {
  min-width: 0;
}
form {
  display: grid;
  gap: 16px;
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
}
</style>
