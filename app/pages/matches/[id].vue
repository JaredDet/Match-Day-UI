<script setup lang="ts">
import MatchDetailView from "~/modules/matches/views/MatchDetailView.vue";
definePageMeta({ key: (route) => String(route.params.id) });
</script>

<template>
  <MatchDetailView />
</template>
