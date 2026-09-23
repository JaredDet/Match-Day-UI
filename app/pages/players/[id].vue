<script setup lang="ts">
import PlayerDetailView from "~/modules/players/views/PlayerDetailView.vue"
definePageMeta({ key: route => String(route.params.id) })
</script>

<template>
  <PlayerDetailView />
</template>
