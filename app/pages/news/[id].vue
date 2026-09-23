<script setup lang="ts">
import NewsDetailView from "~/modules/news/views/NewsDetailView.vue"
definePageMeta({ key: route => String(route.params.id) })
</script>

<template>
  <NewsDetailView />
</template>
