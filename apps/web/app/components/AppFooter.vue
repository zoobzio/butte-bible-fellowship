<script lang="ts">
import type { FooterLine } from "~/types/footer";

import { NuxtLink } from "#components";
import { useAppConfig, useT } from "#imports";

import ColorMode from "~/components/ColorMode.vue";
import LanguagePicker from "~/components/LanguagePicker.vue";
import ThemePicker from "~/components/ThemePicker.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const { footer } = useAppConfig();
const t = useT();

const year = new Date().getFullYear();

/** A line's text: its message in the active locale, or its text as written. */
const text = (line: FooterLine) => {
  return "label" in line ? t(line.label) : line.text;
};
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-grid">
      <div
        v-for="(column, index) in footer.columns"
        :key="index"
        class="site-footer-col"
      >
        <p>
          <strong>{{ t(column.title) }}</strong>
        </p>
        <p v-for="(line, position) in column.lines" :key="position">
          <NuxtLink v-if="line.href" :to="line.href" :target="line.target">
            {{ text(line) }}
          </NuxtLink>
          <template v-else>{{ text(line) }}</template>
        </p>
      </div>
    </div>

    <div class="site-footer-legal">
      <div class="site-footer-controls">
        <LanguagePicker />
        <ColorMode />
        <ThemePicker />
      </div>
      <span>{{ t.footer.copyright({ year }) }}</span>
    </div>
  </footer>
</template>
