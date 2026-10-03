<script lang="ts">
import { NuxtLink } from "#components";
import { useAppConfig } from "#imports";

import ColorMode from "~/components/ColorMode.vue";
import ThemePicker from "~/components/ThemePicker.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const { site, footer } = useAppConfig();
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-grid">
      <div
        v-for="column in footer.columns"
        :key="column.title"
        class="site-footer-col"
      >
        <p>
          <strong>{{ column.title }}</strong>
        </p>
        <p v-for="line in column.lines" :key="line.label">
          <NuxtLink v-if="line.href" :to="line.href" :target="line.target">
            {{ line.label }}
          </NuxtLink>
          <template v-else>{{ line.label }}</template>
        </p>
      </div>
    </div>

    <div class="site-footer-legal">
      <div class="site-footer-controls">
        <ColorMode />
        <ThemePicker />
      </div>
      <span>© {{ new Date().getFullYear() }} {{ site.name }}</span>
    </div>
  </footer>
</template>
