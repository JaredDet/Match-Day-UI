# Matchday UI

## Para ti

`/for-you` incorpora recomendaciones automáticas basadas exclusivamente en la
navegación: visitas, recencia y tiempo activo. No requiere seleccionar intereses.
El historial permanece en este navegador y se puede borrar desde la pantalla.
Detalles del cálculo, límites y pruebas en [docs/recommendations.md](docs/recommendations.md).

El frontend funciona con datos demo, sin conexión a la API. Los catálogos de
`app/modules/*/data` reflejan los conceptos del backend: noticias publicadas, temporadas,
inscripciones, grupos y eliminatorias.

- `/tournaments/register`: inscripción de equipos existentes en una temporada.
  Evita duplicados y bloquea 2026 porque ya tiene eliminatorias generadas.
  Selecciona 2027 para probar y vuelve al torneo para ver los equipos inscritos.
  Inscribir no asigna un grupo ni aplica el límite de cuatro a toda la temporada.
- `/teams/register`: formulario por pasos que crea un equipo y su plantilla en el estado demo;
  el equipo aparece en el catálogo y queda disponible para inscribirlo.
- Ambos registros tienen tres pasos, permiten volver atrás conservando los datos
  y muestran una revisión antes de confirmar. Crear equipo sigue Equipo → Plantilla
  → Confirmar; inscribir en torneo sigue Temporada → Equipo → Confirmar.
- Las inscripciones se comparten entre pantallas mediante `useState` y se reinician
  al recargar. No se envían datos al backend.
- Noticias y fichas de equipos comparten las mismas publicaciones. Los borradores
  y las noticias programadas no aparecen en las vistas públicas.

- `/news/manage`: borradores, portadas, programación y publicación demo.
- `/tournaments/manage`: temporadas, grupos, asignaciones y eliminatorias.
- `/matches/manage`: alineaciones, periodos, goles, tarjetas, cambios y tandas.

Verificación: `pnpm build` (en PowerShell, `pnpm.cmd build`). Para comprobar la
inscripción, añade un equipo en 2027, verifica que desaparece del selector y que
aparece sin grupo en la pestaña Equipos. Cambia a 2026 y comprueba el bloqueo.

## Organización del frontend

```text
app/
  pages/                  Entradas de rutas y definePageMeta
  modules/
    matches/
    teams/
    players/
    news/
    tournaments/
  components/             Cabecera, pie y componentes compartidos
  assets/css/main.css     Variables de tema, resets y accesibilidad base
```

Cada módulo agrupa sus `views`, `components`, `composables`, `data`, `types` y
`utils` cuando los necesita. Las páginas solo importan y renderizan la vista;
las rutas dinámicas conservan su clave de navegación en `definePageMeta`.

Las vistas presentan la pantalla. Los composables de registro gestionan estado
y validaciones, y comparten el borrador o las inscripciones entre pantallas.
Los datos de equipos pertenecen a `teams`, mientras los grupos y el cuadro
pertenecen a `tournaments`. Los escudos se generan en `teams/utils/identity.ts`.

Los componentes y composables propios se importan explícitamente con `~/modules/...`.
Solo los componentes de uso transversal viven en `app/components`; no se registra
globalmente todo el contenido de los módulos. Mantener las importaciones explícitas
permite ver las dependencias entre funcionalidades. Las utilidades de Vue y Nuxt
siguen usando sus autoimportaciones habituales.

Cada vista y componente define su CSS en un bloque `<style scoped>`, incluidas
sus variantes de tema y sus reglas responsive. No se comparten hojas de estilos
entre pantallas: los valores comunes se consumen mediante variables CSS.
`main.css` no contiene clases de componentes. Los componentes compartidos son
dueños de sus estilos; el contenido recibido por slots usa `:slotted` cuando
necesita una regla específica. Las transiciones de navegación quedan acotadas
al contenedor de `app.vue`.

Los desplegables usan `AppSelect`: mantiene el control nativo y sus atributos de
formulario, con una flecha a 14 px del borde y espacio reservado para el texto.
El componente es dueño de su CSS. Las nuevas transiciones de controles, tarjetas,
filtrado de noticias y pasos de inscripción respetan `prefers-reduced-motion`.

El modo claro utiliza variables `--ui-*` para texto, superficies, bordes y estados
de éxito/error/aviso. Los componentes conservan sus colores oscuros como valores
de respaldo. `--accent` sirve para texto y enlaces; `--accent-fill` y `--on-accent`
se usan en controles rellenos. Los colores del campo de juego, escudos y tarjetas
de árbitro son independientes del tema.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
