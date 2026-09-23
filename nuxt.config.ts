// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Matchday · Cada partido cuenta',
      meta: [{ name: 'description', content: 'Tu jornada de fútbol: previas, resultados y partidos en vivo en un solo lugar.' }],
    },
  },
})
