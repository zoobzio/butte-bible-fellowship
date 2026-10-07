<script lang="ts">
import { Icon } from "#components";
import { computed, useRouter } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { parentPath } from "~/utils/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "PageHeader" });

const { title, description, back } = defineProps<{
  title: string;
  description?: string;
  /** The label of a link back to the page that brought the reader here. */
  back?: string;
}>();

const router = useRouter();
const { path, localize } = useRouteLocale();

// Where the link leads when no page of the site brought the reader here —
// they followed a link from elsewhere, or opened the address itself: the
// page this one is under.
const up = computed(() => localize(parentPath(path.value)));

// A page of the site brought the reader here: the link steps back to it as
// the browser's own button would, so that page is found as it was left.
const leave = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.push(up.value);
  }
};
</script>

<template>
  <header class="page-header">
    <!-- A click that opens the link elsewhere — a new tab, a new window —
         is left to the browser: it has the address to open. -->
    <a
      v-if="back"
      :href="up"
      class="page-header-back"
      @click.exact.prevent="leave"
    >
      <Icon name="chevron-left" class="icon" aria-hidden="true" />
      {{ back }}
    </a>
    <h1 class="page-title">{{ title }}</h1>
    <hr />
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.default" class="page-header-slot">
      <slot />
    </div>
  </header>
</template>

<style>
/* The header fills whatever holds it: the page sets the measure. */
.page-header {
  padding-top: clamp(var(--space-7), 7vw, var(--space-9));
}

/* The way back, over the title: as quiet as a tab of the site's header. */
.page-header-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  font-size: clamp(var(--label-size), 0.4vw + 0.8rem, var(--body-size));
  letter-spacing: var(--type-label-letter-spacing);
  color: var(--on-surface-muted-medium-contrast);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.page-header-back:hover {
  color: var(--on-surface-high-contrast);
}

.page-header-back .icon {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}

.page-header > h1 {
  margin: 0;
}

.page-header > hr {
  width: var(--space-8);
  height: 2px;
  margin: var(--space-5) 0 0;
  border: 0;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
}

.page-header > p {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--title-size) * 1.35));
  line-height: 1.6;
  color: var(--on-surface-medium-contrast);
  max-width: 44ch;
  margin: var(--space-5) 0 0;
}

.page-header-slot {
  margin-top: var(--space-7);
}
</style>
