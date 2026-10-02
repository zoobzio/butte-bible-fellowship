<script lang="ts">
import type { MenuGroup } from "~/components/Menu.vue";

import Menu from "~/components/Menu.vue";
import { Icon } from "#components";
import { useAppConfig } from "#imports";
</script>

<script setup lang="ts">
const { header } = useAppConfig();

const groups: MenuGroup[] = [{ key: "primary", items: header.links }];
</script>

<template>
  <div class="site-nav-mobile">
    <Menu :groups="groups" align="end">
      <button type="button" aria-label="Open navigation">
        <Icon name="menu" class="icon" />
      </button>
    </Menu>
  </div>
</template>
