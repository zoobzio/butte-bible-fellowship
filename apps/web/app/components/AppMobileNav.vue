<script lang="ts">
import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { useAppConfig } from "#imports";
import { defineMenu } from "@zoobzio/foundation/definitions/menu";
</script>

<script setup lang="ts">
const { header } = useAppConfig();

const menu = defineMenu({
  groups: [
    {
      key: "primary",
      items: header.links.map(({ label, to }) => ({ label, link: { to } })),
    },
  ],
  align: "end",
});
</script>

<template>
  <div class="site-nav-mobile">
    <Menu v-bind="menu">
      <button type="button" aria-label="Open navigation">
        <Icon name="menu" class="icon" />
      </button>
    </Menu>
  </div>
</template>
