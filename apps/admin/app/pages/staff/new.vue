<script lang="ts">
import { definePageMeta, useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:write"] } });

useHead({ title: "New member" });
</script>

<template>
  <PageHeader title="New member" />
  <StaffEditor :record="null" />
</template>
