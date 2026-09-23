<template>
  <footer>
    <NuxtLink class="brand" to="/"> matchday<span class="brand-dot">.</span> </NuxtLink>
    <span>Hecho para quienes viven el fútbol.</span>
    <NuxtLink class="kickoff-link" to="/">EL PARTIDO EMPIEZA AQUÍ →</NuxtLink>
  </footer>
</template>

<style scoped>
html[data-theme="light"] .brand {
  color: var(--text-color) !important;
}
footer {
  color: var(--text-color);
}
.brand {
  display: flex;
  align-items: center;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -1.4px;
  color: var(--header-text);
}
.brand-dot {
  color: var(--accent);
}
footer {
  max-width: 1192px;
  margin: auto;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 25px 0 32px;
  color: var(--ui-muted, #76808d);
}
footer .brand {
  font-size: 22px;
  color: var(--ui-text, #b2bac6);
}
footer > span {
  font-size: 10px;
}
.kickoff-link {
  margin-left: auto;
  font-size: 8px;
  letter-spacing: 1.5px;
  color: var(--muted);
  transition: color 0.2s;
}
.kickoff-link:hover {
  color: var(--accent);
}
@media (min-width: 1450px) {
  footer {
    max-width: 1272px;
  }
}
@media (max-width: 1050px) {
  footer {
    margin: 0 30px;
  }
}
@media (max-width: 700px) {
  .brand {
    font-size: 24px;
  }
  footer {
    margin: 0 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .kickoff-link {
    width: 100%;
    margin: 0;
  }
}
</style>
