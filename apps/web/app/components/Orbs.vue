<script lang="ts">
import { computed, nextTick, useRoute, useTemplateRef, watch } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { useOrbDrift } from "~/composables/orbs";
</script>

<script setup lang="ts">
const route = useRoute();

const { path } = useRouteLocale();

const isHome = computed(() => path.value === "/");

const left = useTemplateRef<HTMLSpanElement>("left");
const right = useTemplateRef<HTMLSpanElement>("right");

const { schedule } = useOrbDrift({ left, right });

watch(
  () => route.path,
  () => nextTick(schedule),
);
</script>

<template>
  <div
    class="orb-field"
    :class="{ 'orb-field-home': isHome }"
    aria-hidden="true"
  >
    <span ref="left" class="orb orb-left" />
    <span ref="right" class="orb orb-right" />
  </div>
</template>
