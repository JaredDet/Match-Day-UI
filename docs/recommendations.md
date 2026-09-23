# Recomendaciones por navegación

La ruta `/for-you` muestra «Para ti» con noticias, partidos, torneos y descubrimiento.
Funciona en modo demo: no llama a la API, no necesita cuentas y no pide seleccionar
intereses. Tampoco utiliza los favoritos como entrada del recomendador.

## Señales y cálculo

- Se reconocen páginas de detalle existentes de equipos, jugadores, noticias
  publicadas, partidos y torneos. Listados, administración, formularios, páginas
  inexistentes y «Para ti» no generan señales.
- Se exige una permanencia inicial de cinco segundos. El muestreo ocurre cada
  cinco segundos, con la pestaña visible, la ventana enfocada y actividad de
  ratón, teclado o desplazamiento durante los últimos treinta segundos.
- Las recargas o visitas separadas por menos de treinta minutos no aumentan
  el contador de visitas del mismo contenido. Se acumulan como máximo tres
  visitas y dos minutos activos por contenido y día UTC.
- Cada día aporta visitas y tiempo activo. Su peso se reduce a la mitad cada
  siete días. El historial de más de treinta días se descarta.
- Consultar jugadores, noticias o partidos aporta interés a sus equipos. Las
  relaciones existentes de inscripción y de partidos vinculados permiten
  relacionar contenido con torneos. No se inventa la pertenencia de un partido
  a un torneo cuando no hay una relación registrada.
- La puntuación combina afinidad por equipo y torneo, proximidad de la fecha y
  un refuerzo de partidos en juego. Consultar un contenido reduce ligeramente
  su prioridad frente a contenido relacionado aún no visto.
- Descubrimiento reserva hasta cuatro tarjetas no visitadas y distintas de las
  otras secciones, priorizando menor afinidad. No usa filtrado colaborativo ni
  afirma que otros usuarios hayan visto un contenido.

Sin historial válido se muestran sugerencias generales y una explicación de que
se adaptarán al navegar. Cada tarjeta indica el motivo de su recomendación.

## Estado y privacidad

`localStorage` conserva únicamente clave de contenido, día, número de visitas,
segundos activos y última actividad bajo `matchday-navigation-v1`. No conserva
consultas de búsqueda, formularios, coordenadas, teclas ni URL completas. Hay un
límite de 500 entradas; se validan los datos al leerlos y se descartan fechas
inválidas, futuras o caducadas. Si el almacenamiento está bloqueado, funciona
en memoria durante la sesión. La purga del almacenamiento ocurre al abrir la
aplicación o registrar actividad; no hay un proceso cuando el navegador está cerrado.

«Borrar historial de recomendaciones» elimina tanto el estado en memoria como
la copia local. Las visitas posteriores vuelven a generar recomendaciones.
Las claves de entidades demo que desaparecen al recargar dejan de influir.
El historial no se sincroniza entre dispositivos ni se envía al backend.

## Organización y pruebas

`modules/recommendations` separa tipos, cálculo puro, catálogo de contenido,
seguimiento de navegación, estado, tarjeta y vista. `pages/for-you.vue` es solo
la entrada de ruta. El seguimiento se instala una vez en `app.vue` y libera
temporizador y listeners al desmontarse. Los componentes son dueños de su CSS
y utilizan los valores globales para ambos temas.

Ejecutar desde `matchday-ui` con Node 24:

```sh
node --test tests/recommendations.test.mjs
pnpm build
```

Las pruebas cubren afinidad implícita, límites de visitas y tiempo, recencia,
validación del historial, inicio sin datos, descubrimiento sin duplicados y
relaciones con torneos. Para verificar interacción: abrir un equipo durante
más de cinco segundos con la ventana activa, visitar «Para ti», comprobar los
motivos de las tarjetas, recargar y borrar el historial. Las herramientas de
desarrollo con foco pueden detener el cómputo de tiempo activo.
