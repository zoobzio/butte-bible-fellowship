<script lang="ts">
import type { FooterLine } from "~/types/footer";

import { NuxtLink } from "#components";
import { useAppConfig, useNuxtApp } from "#imports";

import ColorMode from "#layers/bbf/app/components/ColorMode.vue";
import LanguagePicker from "#layers/bbf/app/components/LanguagePicker.vue";
import ThemePicker from "#layers/bbf/app/components/ThemePicker.vue";
import ThemeSettings from "#layers/bbf/app/components/ThemeSettings.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const { footer } = useAppConfig();
const { $t } = useNuxtApp();

const year = new Date().getFullYear();

const text = (line: FooterLine) => {
  return "label" in line ? $t(line.label) : line.text;
};
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-grid">
      <div class="site-footer-verse">
        <p>
          <strong>{{ $t.site.name() }}</strong>
        </p>
        <blockquote>
          <p>
            {{ $t.footer.verse() }}
            <em>{{ $t.footer.reference() }}</em>
          </p>
        </blockquote>
      </div>
      <div
        v-for="(column, index) in footer.columns"
        :key="index"
        class="site-footer-col"
      >
        <p>
          <strong>{{ $t(column.title) }}</strong>
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
        <ThemeSettings />
      </div>
      <span>{{ $t.footer.copyright({ year }) }}</span>
    </div>
  </footer>
</template>

<style>
.site-footer {
  position: relative;
  margin-top: var(--space-9);
  padding: clamp(var(--space-7), 7vw, var(--space-8)) 0 var(--space-6);
  background:
    linear-gradient(
      color-mix(in oklab, var(--primary-container) 34%, transparent),
      transparent
    ),
    var(--surface-container);
}

.site-footer::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: var(--gradient-signature);
  opacity: 0.85;
}

.site-footer-grid {
  display: flex;
  gap: var(--space-6) var(--space-8);
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.site-footer-col {
  flex: none;
}

.site-footer-verse {
  flex: 0 1 50%;
  align-self: start;
  margin: 0 auto 0 0;
}

.site-footer-verse > p {
  margin: 0;
}

.site-footer-verse > blockquote {
  margin: var(--space-6) 0 0;
}

.site-footer-col > p {
  margin: 0 0 var(--space-2);
  line-height: 1.7;
  color: var(--on-surface-muted);
  max-width: none;
}

.site-footer-col strong,
.site-footer-verse strong {
  display: block;
  margin-bottom: var(--space-3);
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--body-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

@media (max-width: 60rem) {
  .site-footer-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-6);
  }
  .site-footer-verse {
    grid-column: 1 / -1;
  }
}

@media (max-width: 44rem) {
  .site-footer-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.site-footer-legal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: min(100% - var(--site-gutter), var(--site-width));
  max-width: none;
  margin: var(--space-7) auto 0;
  padding-top: var(--space-4);
  border-top: 1px var(--stroke-solid) var(--rule);
  font: var(--type-label);
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2.5);
  color: var(--on-surface-muted);
  text-align: right;
}

.site-footer-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
