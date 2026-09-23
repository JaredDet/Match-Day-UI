<script setup lang="ts">
import AnimatedHeroIcon from "~/components/AnimatedHeroIcon.vue"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/vue/24/solid";
defineProps<{
  events: { kind: string; label: string; minute: number; added?: number }[];
  detailed?: boolean;
}>();
</script>
<template>
  <span v-if="events.length" class="event-badges" :class="{ detailed }">
    <span
      v-for="(event, index) in events"
      :key="index"
      class="event-badge"
      :title="`${event.label} · ${event.minute}${event.added ? '+' + event.added : ''}′`"
      :aria-label="`${event.label} · ${event.minute}${event.added ? '+' + event.added : ''}′`"
    >
      <span
        v-if="event.kind === 'yellow' || event.kind === 'red'"
        class="card-icon"
        :class="event.kind"
        aria-hidden="true"
      />
      <AnimatedHeroIcon
        :icon="event.kind === 'in' ? ArrowRightIcon : ArrowLeftIcon"
        motion="arrow"
        v-else-if="event.kind === 'in' || event.kind === 'out'"
        class="change-icon"
        :class="event.kind"
        aria-hidden="true"
      />
      <svg
        v-else-if="event.kind === 'goal'"
        class="event-ball"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" fill="#f5f5f5" />
        <path
          d="m12 7 4.8 3.5-1.8 5.6H9l-1.8-5.6L12 7ZM8.5 2.6h7L14 5h-4L8.5 2.6ZM21.1 7.8l.8 6.6-2.7-1.1-1.1-3.6 3-1.9ZM17.9 20.1l-6.2 1.8.5-2.8 3.1-2.2 2.6 3.2ZM4.4 18.5l-2.3-6.1 2.8-.4 2.3 3.1-2.8 3.4ZM3.5 6.7l3.4-3.3.8 3-2.2 3-3-.5 1-2.2Z"
          fill="#252a2e"
        />
      </svg>
      <AnimatedHeroIcon
        :icon="PlusIcon"
        motion="lift"
        v-else-if="event.kind === 'injury'"
        class="change-icon"
        aria-hidden="true"
      /><span v-else aria-hidden="true">{{
        event.kind === "injury" ? "✚" : event.kind === "assist" ? "A" : "⚽"
      }}</span>
      <span v-if="detailed" class="event-description"
        >{{ event.label }} · {{ event.minute
        }}{{ event.added ? "+" + event.added : "" }}′</span
      >
    </span>
  </span>
</template>

<style scoped>





.event-badges {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.event-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 17px;
  font-size: 12px;
  color: var(--ui-text, #eee);
}
.card-icon {
  display: inline-block;
  width: 9px;
  height: 13px;
  border-radius: 1px;
  border: 1px solid var(--ui-border, #ffffff80);
  box-shadow: 0 1px 2px var(--ui-shadow, #0006);
}
.yellow {
  background: #f5ce42;
}
.red {
  background: #e44b46;
}
.change-icon {
  width: 16px;
  height: 16px;
}
.change-icon.in {
  color: var(--ui-success, #8bd693);
}
.change-icon.out {
  color: var(--ui-danger, #f39286);
}
.detailed {
  display: flex;
  gap: 5px 12px;
  margin-top: 4px;
}
.event-description {
  font-size: 9px;
  color: var(--ui-muted, #aaa);
  line-height: 1.6;
}
.event-ball {
  display: block;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

@media (prefers-reduced-motion: no-preference) {
  button, a, input { transition: color .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
  button:not(:disabled):active, .primary-action:active { transform: translateY(1px); }
  input:focus-visible { box-shadow: 0 0 0 3px var(--ui-success-soft, rgba(189, 237, 117, .12)); }
}
</style>

