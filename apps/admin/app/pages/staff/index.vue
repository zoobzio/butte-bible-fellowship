<script lang="ts">
import { useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useStaffTable } from "~/composables/staff";
</script>

<script setup lang="ts">
useHead({ title: "Staff" });

const { widget, link } = useStaffTable();
</script>

<template>
  <PageHeader title="Staff" to="/staff/new" action="New member" />
  <RecordTable :widget="widget" :link="link" title="name" />
</template>
