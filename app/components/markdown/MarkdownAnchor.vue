<script lang="ts">
import Anchor from "@zoobzio/foundation/components/common/anchor.vue";
</script>

<script setup lang="ts">
const { href, target } = defineProps<{
  href?: string;
  target?: "_blank" | "_self";
}>();
</script>

<template>
  <Anchor :to="href" :target="target">
    <slot />
  </Anchor>
</template>
