<script setup lang="ts">
import { teamCrestDataUri } from "~/modules/teams/utils/identity";
const props = defineProps<{ name: string; src?: string | null }>();
const crestSource = computed(() => props.src || teamCrestDataUri(props.name));
</script>
<template>
  <span class="team-badge" aria-hidden="true">
    <img class="crest-image" :src="crestSource" alt="" />
  </span>
</template>

<style scoped>





.team-badge {
  display: inline-block;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  vertical-align: middle;
  overflow: visible;
}

.crest-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Follow the image's alpha contour instead of outlining its rectangular box. */
  filter:
    drop-shadow(1px 0 0 white)
    drop-shadow(-1px 0 0 white)
    drop-shadow(0 1px 0 white)
    drop-shadow(0 -1px 0 white);
}
</style>

