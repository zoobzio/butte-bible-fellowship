<script lang="ts">
import { NuxtLink } from "#components";
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { SITE_PAGES } from "~/constants/site";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["site:read"] } });

const { $t } = useNuxtApp();

useHead(() => ({ title: $t.admin.pages.title() }));

/*
 * The pages of the site with a table of their own, each on a card that
 * leads to its page in the admin. There is one of each, made with the
 * site: none is added here, and none removed.
 */
const pages = Object.values(SITE_PAGES);
</script>

<template>
  <PageHeader
    :title="$t.admin.pages.title()"
    :description="$t.admin.pages.description()"
  />
  <ul class="site-cards" :aria-label="$t.admin.pages.list()">
    <li v-for="page in pages" :key="page.to" class="site-cards-item">
      <NuxtLink :to="page.to" class="site-card">
        <h2 class="site-card-title">{{ $t(page.label) }}</h2>
        <p class="site-card-description">{{ $t(page.description) }}</p>
      </NuxtLink>
    </li>
  </ul>
</template>

<style>
/* As many cards to a row as fit, each as wide as the next. */
.site-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-5);
  margin: 0;
  padding: 0 0 var(--space-8);
  list-style: none;
}

/* A card is no line of a list: it keeps neither the indent nor the mark of one. */
.site-cards-item {
  display: grid;
  padding: 0;
  line-height: inherit;
}

.site-cards-item::before {
  content: none;
}

/*
 * A card is the whole of its link: the page's name over what of it is
 * changed here, the site's mark down its edge, lifted under the pointer.
 */
.site-card {
  position: relative;
  overflow: hidden;
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-lg);
  background: var(--surface-container);
  color: var(--on-surface);
  text-decoration: none;
  box-shadow: var(--elevation-low);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.site-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--gradient-signature);
}

.site-card:hover {
  border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  color: var(--on-surface);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}

.site-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.site-card-title {
  display: block;
  margin: 0;
  font: var(--type-title);
  font-family: var(--font-display);
  color: var(--on-surface-high-contrast);
}

.site-card-title::before {
  content: none;
}

.site-card-description {
  margin: 0;
  font: var(--type-body);
  color: var(--on-surface-muted);
}
</style>
