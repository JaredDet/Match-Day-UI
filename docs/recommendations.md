# Recomendaciones por navegación

La ruta `/for-you` muestra noticias, partidos, torneos y contenido para descubrir. El visitante no necesita cuenta ni declara preferencias: el sistema aprende de las páginas que consulta y del tiempo activo que dedica a cada contenido.

## Captura de actividad

`useNavigationTracking` reconoce las rutas de detalle de equipos, jugadores, noticias, partidos y torneos. Al abrir una ruta elegible:

1. Genera un `navigation_id` nuevo.
2. Solicita el detalle con `X-Navigation-Intent: detail-view` y `X-Navigation-Id`.
3. El backend valida que el contenido exista y pueda generar una señal.
4. El backend responde con el contenido y una cookie anónima firmada.

La cookie la administra el navegador mediante `credentials: include`. No se copia a `localStorage` ni se expone una identidad de otros visitantes.

## Tiempo activo

Mientras la pestaña está visible, la ventana conserva el foco y hubo interacción reciente, el frontend acumula tiempo y envía un heartbeat cada 15 segundos a:

```text
POST /api/recommendations/activity/heartbeat/
```

El cuerpo incluye `navigation_id`, tipo, identificador del contenido y segundos activos acumulados. El valor es monotónico y se limita a 120 segundos por navegación. Al ocultar, cambiar de ruta o cerrar la página se intenta enviar un último heartbeat con `sendBeacon`.

Las escrituras utilizan la cookie firmada y CSRF. El cliente obtiene la cookie CSRF desde `GET /api/recommendations/` cuando todavía no existe.

## Generación

El frontend no calcula el perfil. Un proceso independiente del backend:

- consume actividad reciente pendiente;
- pondera equipos y torneos consultados;
- compara vectores de comportamiento mediante similitud coseno;
- utiliza visitantes similares para descubrir contenido no consultado;
- aplica sugerencias generales cuando todavía no existe actividad suficiente;
- guarda un snapshot con caducidad.

El resultado diferencia afinidad directa por equipo, interés por torneo, visitantes similares, contenido reciente, partidos en vivo y descubrimiento.

## Consulta y borrado

El repositorio de recomendaciones consulta:

```text
GET /api/recommendations/
```

La respuesta contiene `personalized`, fechas de generación y caducidad, además de las secciones `news`, `matches`, `tournaments` y `discovery`. Las tarjetas muestran el motivo entregado por la API y enlazan al detalle correspondiente.

El visitante puede eliminar su actividad mediante:

```text
DELETE /api/recommendations/history/
```

El backend elimina actividad, perfil y snapshot, y ordena al navegador borrar la cookie firmada. La navegación posterior comienza un historial anónimo nuevo.

## Capas del frontend

- `domain/recommendation-repository.ts`: DTOs y contrato del repositorio.
- `infrastructure/api-recommendation-repository.ts`: endpoints, CSRF y `sendBeacon`.
- `composables/useNavigationTracking.ts`: ciclo de vida de la visita y tiempo activo.
- `composables/useRecommendations.ts`: estado de consulta y adaptación para las vistas.
- `components/`: tarjetas y carriles compartidos.
- `views/RecommendationsView.vue`: pantalla de descubrimiento.

El flujo completo también aparece en `docs/diagrams/design/api-flow-sequence.puml` y en los diagramas de recomendaciones del backend.

## Verificación

```bash
pnpm test
pnpm format:check
pnpm build
```

Las pruebas comprueban la composición de repositorios, el uso de cookies y CSRF, la captura de visitas y heartbeats, y las reglas puras de afinidad y descubrimiento que se conservan como referencia del comportamiento esperado.
