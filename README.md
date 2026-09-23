# Matchday UI

Frontend Nuxt de Matchday conectado a la API Django. Las pantallas públicas y de gestión consumen equipos, jugadores, partidos, noticias, torneos y recomendaciones mediante repositorios tipados.

## Configuración

```bash
cp .env.example .env
pnpm install
pnpm dev
```

`NUXT_PUBLIC_API_BASE` indica la raíz de la API y por defecto vale `http://localhost:8000/api`. El navegador incluye las cookies anónimas y CSRF con `credentials: include`. El backend debe incluir el origen del frontend en `DJANGO_CORS_ALLOWED_ORIGINS` y `DJANGO_CSRF_TRUSTED_ORIGINS`.

## Organización

```text
app/
  core/api/                 Cliente HTTP y contexto de repositorios
  plugins/repositories.ts   Composición de implementaciones API
  pages/                    Entradas mínimas de rutas
  modules/<módulo>/
    domain/                 Interfaces de repositorio y DTOs
    application/            Casos de uso de escritura
    infrastructure/         Adaptadores de la API
    composables/            Estado de consulta para las vistas
    views/                   Pantallas
    components/             Componentes del módulo
```

Las vistas no conocen `$fetch` ni las rutas HTTP. Consultan interfaces mediante `useRepositories()` o invocan casos de uso. El plugin decide qué adaptador satisface cada interfaz.

Las recomendaciones no requieren cuenta. El frontend registra vistas de detalle, acumula tiempo activo cada 15 segundos y envía el último heartbeat al ocultar o cerrar la página. La cookie firmada pertenece al navegador; no se guarda en `localStorage`. Consulta [docs/recommendations.md](docs/recommendations.md) para ver el flujo completo.

Los diagramas de contexto, contenedores, componentes, secuencia y navegación entre pantallas están descritos en [docs/README.md](docs/README.md).

## Calidad local

```bash
pnpm format
pnpm format:check
pnpm test
pnpm build
```

Prettier mantiene el formato de Vue, TypeScript, JavaScript, CSS, JSON, Markdown y YAML. Husky ejecuta `lint-staged` antes de cada commit y corrige solamente los archivos preparados. `.editorconfig` y `.gitattributes` fijan UTF-8, indentación de dos espacios, salto final real y finales de línea LF.

## Integración continua

GitHub Actions ejecuta en cada `push` y `pull_request`:

1. `pnpm install --frozen-lockfile`.
2. `pnpm format:check`.
3. `pnpm test`.
4. `pnpm build`.

El workflow está en `.github/workflows/quality.yml`.
