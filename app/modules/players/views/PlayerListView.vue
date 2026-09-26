<script setup lang="ts">
import { positionNames } from "~/modules/teams/data/position-names";
import { usePlayers, useTeams } from "~/modules/teams/composables/useTeams";
const { players: catalog } = usePlayers(),
  { teams } = useTeams(),
  query = ref(""),
  team = ref("all"),
  position = ref("all");
const players = computed(() =>
  catalog.value.filter(
    (player) =>
      (team.value === "all" || player.team.id === team.value) &&
      (position.value === "all" || player.preferred_position === position.value) &&
      `${player.name} ${player.team.name}`
        .toLocaleLowerCase("es")
        .includes(query.value.trim().toLocaleLowerCase("es")),
  ),
);
useHead({ title: "Jugadores · Matchday" });
</script>
<template>
  <main class="directory">
    <PageHeading
      title="Jugadores"
      kicker="PLANTELES"
      description="Explora jugadores, posiciones y estadísticas de todos los equipos."
      ><ActionLink to="/teams/manage">Administrar planteles</ActionLink></PageHeading
    >
    <div class="filters">
      <label>Buscar<input v-model="query" type="search" placeholder="Jugador o equipo" /></label
      ><label
        >Equipo<AppSelect v-model="team"
          ><option value="all">Todos</option>
          <option v-for="item in teams" :key="item.id" :value="item.id">
            {{ item.name }}
          </option></AppSelect
        ></label
      ><label
        >Posición<AppSelect v-model="position"
          ><option value="all">Todas</option>
          <option v-for="(label, key) in positionNames" :key="key" :value="key">
            {{ label }}
          </option></AppSelect
        ></label
      >
    </div>
    <div class="player-grid">
      <NuxtLink
        v-for="player in players"
        :key="player.id"
        :to="`/players/${player.id}`"
        class="player-card"
        ><span class="number">{{ player.preferred_shirt_number ?? "—" }}</span>
        <div>
          <span class="eyebrow">{{
            player.preferred_position ? positionNames[player.preferred_position] : "Sin posición"
          }}</span>
          <h2>{{ player.name }}</h2>
          <p>{{ player.team.name }}<span v-if="player.is_captain"> · Capitán</span></p>
        </div></NuxtLink
      >
    </div>
    <EmptyState
      v-if="!players.length"
      title="No encontramos jugadores"
      description="Cambia los filtros para ampliar la búsqueda."
    />
  </main>
</template>
<style scoped>
.directory {
  max-width: 1280px;
  margin: auto;
  padding: 30px 24px 70px;
}
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
}
.filters label {
  display: grid;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}
input {
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-color);
}
.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.player-card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel-bg);
  transition:
    transform 0.2s,
    border-color 0.2s;
}
.player-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
}
.number {
  display: grid;
  place-items: center;
  width: 54px;
  height: 64px;
  border-radius: 12px;
  background: var(--accent-fill);
  color: var(--on-accent);
  font: 700 28px "Barlow Condensed";
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 1.3px;
  color: var(--accent);
  text-transform: uppercase;
}
h2 {
  margin: 5px 0;
  font-size: 20px;
}
p {
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 700px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .directory {
    padding: 24px 18px 50px;
  }
}
</style>
