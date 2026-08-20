<script lang="ts">
import Card from "@zoobzio/foundation/components/common/card.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "VisitCallout" });
</script>

<template>
  <Card class="visit-callout">
    <slot />
  </Card>
</template>
