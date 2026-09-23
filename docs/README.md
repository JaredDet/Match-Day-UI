# Arquitectura del frontend

La documentación separa el contexto, los contenedores, los componentes internos y los flujos de ejecución.

## Diagramas

- `diagrams/architecture.puml`: contexto general de Matchday.
- `diagrams/architecture/containers.puml`: frontend, API, procesos independientes y persistencia.
- `diagrams/architecture/modules/frontend.puml`: vistas, composables, casos de uso, interfaces, repositorios y cliente HTTP.
- `diagrams/design/api-flow-sequence.puml`: consultas, comandos, CSRF y seguimiento anónimo.
- `diagrams/navigation/modules.puml`: comunicación de navegación entre los módulos funcionales.
- `diagrams/navigation/modules/matches.puml`: navegación interna de partidos.
- `diagrams/navigation/modules/news.puml`: navegación interna de noticias.
- `diagrams/navigation/modules/teams.puml`: navegación interna de equipos y jugadores.
- `diagrams/navigation/modules/tournaments.puml`: navegación interna de torneos.
- `diagrams/navigation/modules/recommendations.puml`: navegación interna de recomendaciones.

## Documentos funcionales

- [recommendations.md](recommendations.md): captura de navegación, tiempo activo, cookies, generación y consulta de recomendaciones.

Los diagramas usan la librería C4 para los niveles de arquitectura y PlantUML para las secuencias. PlantUML queda fuera de Prettier porque este no tiene un parser para `.puml`.
