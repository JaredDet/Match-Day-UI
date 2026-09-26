<script setup lang="ts">
import RecommendationCard from "./RecommendationCard.vue";
import { useRecommendations } from "~/modules/recommendations/composables/useRecommendations";
const props = withDefaults(
  defineProps<{
    title?: string;
    limit?: number;
    kinds?: Array<"news" | "match" | "tournament" | "team" | "player">;
    teamIds?: string[];
    affinityOnly?: boolean;
    compact?: boolean;
  }>(),
  {
    title: "También podría interesarte",
    limit: 3,
    kinds: () => [],
    teamIds: () => [],
    affinityOnly: false,
    compact: false,
  },
);
const route = useRoute();
const { sections } = useRecommendations();
const items = computed(() => {
  const available = [
    ...sections.value.matches,
    ...sections.value.news,
    ...sections.value.tournaments,
    ...sections.value.discovery,
  ];
  const ordered = props.kinds.length
    ? props.kinds.flatMap((kind) => available.filter((item) => item.kind === kind))
    : available;
  return ordered
    .filter(
      (item, index, all) =>
        item.path !== route.path &&
        (!props.affinityOnly ||
          item.preferredTeam ||
          item.teams.some((teamId) => props.teamIds.includes(teamId))) &&
        all.findIndex((candidate) => candidate.key === item.key) === index,
    )
    .slice(0, props.limit);
});
</script>
<template>
  <aside v-if="items.length" class="rail" :class="{ compact }" aria-label="Recomendaciones">
    <div class="rail-heading">
      <div>
        <span>PARA TI</span>
        <h2>{{ title }}</h2>
      </div>
      <ActionLink to="/for-you">Descubrir más</ActionLink>
    </div>
    <div class="rail-grid">
      <RecommendationCard v-for="item in items" :key="item.key" :item="item" />
    </div>
  </aside>
</template>
<style scoped>
.rail {
  max-width: 1280px;
  margin: 24px auto 64px;
  padding: 28px 24px;
  border-top: 1px solid var(--border);
}
.rail-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}
.rail-heading span {
  font-size: 11px;
  letter-spacing: 1.8px;
  color: var(--accent);
}
h2 {
  margin-top: 7px;
  font-size: clamp(24px, 3vw, 34px);
}
.rail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 18px;
}
.rail.compact {
  margin-top: 8px;
  padding-top: 30px;
}
.rail.compact .rail-heading h2 {
  font-size: clamp(22px, 2.5vw, 30px);
}
.rail.compact .rail-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.rail.compact :deep(.visual) {
  min-height: 120px;
}
.rail.compact :deep(.card-copy) {
  gap: 10px;
  padding: 16px;
}
.rail.compact :deep(.card-copy h3) {
  font-size: 18px;
}
@media (max-width: 800px) {
  .rail-grid {
    grid-template-columns: 1fr;
  }
  .rail-heading {
    align-items: start;
    flex-direction: column;
  }
  .rail.compact .rail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
