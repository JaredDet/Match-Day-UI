export interface DemoNews {
  id: string;
  title: string;
  team_id: string | null;
  cover_image: string | null;
  content: { children: string[] };
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  scheduled_at: string | null;
  published_at: string | null;
}
export const news: DemoNews[] = [
  {
    id: "jornada",
    title: "Una nueva jornada para seguir juntos",
    team_id: null,
    cover_image: "/images/news/jornada.webp",
    content: {
      children: [
        "La <b>Copa Matchday</b> entra en su etapa decisiva. Cada encuentro empieza a dibujar el camino hacia la final y ya no queda espacio para regalar puntos.",
        "La jornada reúne cruces con historias distintas: equipos que buscan confirmar su buen momento y otros que necesitan reaccionar. <i>La intensidad será protagonista desde el primer minuto.</i>",
        "Además de los resultados, podrás seguir las formaciones, los goleadores y todos los movimientos que cambien el desarrollo de cada partido.",
        "Revisa el calendario y acompaña a los clubes durante una fecha que puede marcar el rumbo definitivo del torneo.",
      ],
    },
    status: "PUBLISHED",
    scheduled_at: null,
    published_at: "2026-09-18T16:00:00Z",
  },
  {
    id: "santiago",
    title: "Atlético Santiago prepara su próximo encuentro",
    team_id: "0",
    cover_image: "/images/news/entrenamiento.webp",
    content: {
      children: [
        "Atlético Santiago completó una nueva sesión pensando en su próximo rival. El cuerpo técnico trabajó movimientos con balón y transiciones rápidas.",
        "La prioridad estuvo en recuperar al plantel sin perder ritmo competitivo. <b>El juego colectivo</b> ocupó buena parte del entrenamiento.",
        "También hubo ejercicios de definición y pelota detenida. El entrenador pidió precisión y concentración para aprovechar cada oportunidad.",
        "<i>El equipo publicará su convocatoria definitiva antes del encuentro.</i> Hasta entonces, el grupo continuará trabajando con normalidad.",
      ],
    },
    status: "PUBLISHED",
    scheduled_at: null,
    published_at: "2026-09-16T15:00:00Z",
  },
  {
    id: "norte",
    title: "Deportivo Norte presenta las novedades del plantel",
    team_id: "1",
    cover_image: "/images/news/celebracion.webp",
    content: {
      children: [
        "Deportivo Norte compartió las principales novedades de su preparación para esta temporada y confirmó que el plantel ya trabaja con todos sus integrantes.",
        "Las últimas sesiones combinaron carga física y conceptos tácticos. <b>El objetivo es llegar con un equipo equilibrado</b> al comienzo de la competencia.",
        "Los jugadores destacaron el ambiente del grupo y la respuesta de los más jóvenes. <i>La competencia interna será una de las claves del año.</i>",
        "El club continuará informando sobre la evolución del plantel y la programación de sus próximos compromisos.",
      ],
    },
    status: "PUBLISHED",
    scheduled_at: null,
    published_at: "2026-09-12T18:00:00Z",
  },
  {
    id: "grupos",
    title: "El camino de los grupos a las eliminatorias",
    team_id: null,
    cover_image: null,
    content: {
      children: [
        "Los <b>dos primeros equipos de cada grupo</b> avanzan a octavos de final. Esa regla convierte cada jornada en una oportunidad decisiva para sumar.",
        "La tabla considera puntos, diferencia de goles, goles a favor, enfrentamientos directos y disciplina. Si el empate persiste, la organización registra el desempate.",
        "Los clasificados pasan a cruces de eliminación directa a partido único. <i>Desde ese momento, cada error puede cerrar la temporada.</i>",
        "En Matchday puedes revisar la clasificación de cada grupo y seguir después el cuadro completo hasta la final.",
      ],
    },
    status: "PUBLISHED",
    scheduled_at: null,
    published_at: "2026-09-08T16:00:00Z",
  },
  {
    id: "programada",
    title: "La previa de la final",
    team_id: null,
    cover_image: null,
    content: { children: ["Próximamente, toda la previa."] },
    status: "SCHEDULED",
    scheduled_at: "2026-10-01T16:00:00Z",
    published_at: null,
  },
  {
    id: "borrador",
    title: "Balance de temporada",
    team_id: null,
    cover_image: null,
    content: { children: [] },
    status: "DRAFT",
    scheduled_at: null,
    published_at: null,
  },
];
export const publishedNews = news
  .filter((item) => item.status === "PUBLISHED")
  .sort((a, b) => b.published_at!.localeCompare(a.published_at!));
export const newsDate = (date: string) =>
  new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
