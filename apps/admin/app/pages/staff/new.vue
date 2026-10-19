<script lang="ts">
import { useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
</script>

<script setup lang="ts">
useHead({ title: "New member" });
</script>

<template>
  <PageHeader title="New member" />
  <StaffEditor :record="null" />
</template>
