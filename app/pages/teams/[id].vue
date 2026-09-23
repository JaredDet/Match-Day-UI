<script setup lang="ts">
import TeamDetailView from "~/modules/teams/views/TeamDetailView.vue"
definePageMeta({ key: route => String(route.params.id) })
</script>

<template>
  <TeamDetailView />
</template>
