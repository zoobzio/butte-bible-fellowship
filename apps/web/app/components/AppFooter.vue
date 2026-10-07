<script lang="ts">
import type { FooterLine } from "~/types/footer";

import { NuxtLink } from "#components";
import { useAppConfig, useNuxtApp } from "#imports";

import ColorMode from "~/components/ColorMode.vue";
import LanguagePicker from "~/components/LanguagePicker.vue";
import ThemePicker from "~/components/ThemePicker.vue";
import ThemeSettings from "~/components/ThemeSettings.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });

const { footer } = useAppConfig();
const { $t } = useNuxtApp();

const year = new Date().getFullYear();

/** A line's text: its message in the active locale, or its text as written. */
const text = (line: FooterLine) => {
  return "label" in line ? $t(line.label) : line.text;
};
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-grid">
      <!-- The verse's column is headed by the church's name, as the others
           are by their titles. The reference is marked up as Markdown marks
           one up in a page's own quotes, so the verse reads here as it would
           in the prose. -->
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

/* The verse takes half the footer, and the columns stand together at its
   far edge, each as wide as what it holds. */
.site-footer-grid {
  display: flex;
  gap: var(--space-6) var(--space-8);
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.site-footer-col {
  flex: none;
}

/* The verse is as tall as its words, however far the columns beside it
   run: its rule does not follow them down. */
.site-footer-verse {
  flex: 0 1 50%;
  align-self: start;
  margin: 0 auto 0 0;
}

/* The quote mark the prose hangs over a blockquote rises above it, so the
   verse stands further under its heading than a column's lines do under
   theirs: the mark clears the name. */
.site-footer-verse > p {
  margin: 0;
}

.site-footer-verse > blockquote {
  margin: var(--space-6) 0 0;
}

/* A column's lines: the verse's words are the quote's to set. */
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

/* No room for the verse beside the columns: it leads them, and they stand
   two across under it, then one under another. */
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

/* The legal strip carries the controls on the left, copyright right. */
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

/* The language, mode, theme and settings controls sit together on the
   left. */
.site-footer-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
