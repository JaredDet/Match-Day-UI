<script setup lang="ts">
import TournamentDetailView from "~/modules/tournaments/views/TournamentDetailView.vue";
definePageMeta({ key: (route) => String(route.params.id) });
</script>

<template>
  <TournamentDetailView />
</template>
