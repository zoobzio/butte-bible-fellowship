<script setup lang="ts">
defineOptions({ name: "ConnectCard" });
</script>

<template>
  <div class="connect-card">
    <slot />
  </div>
</template>

<style>
.connect-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  border-radius: var(--shape-lg);
  background: var(--surface-container);
  border: 1px var(--stroke-solid) var(--rule);
  box-shadow: var(--elevation-low);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.connect-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--gradient-signature);
}

.connect-card:hover {
  border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}

.connect-card h2 {
  display: block;
  margin: 0 0 var(--space-4);
  padding-bottom: var(--space-3);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--headline-size) * 0.9));
  border-bottom: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 45%, transparent);
}

.connect-card h2::before {
  content: none;
}

/* Structured, ledger-like rows: label column, value column, hairline rules. */
.connect-card p {
  margin: 0;
  padding-block: var(--space-3);
  line-height: 1.7;
  max-width: none;
  border-top: 1px var(--stroke-solid) var(--rule);
}

.connect-card p:has(strong) {
  display: grid;
  grid-template-columns: minmax(4.5em, auto) 1fr;
  align-items: baseline;
  column-gap: var(--space-4);
}

.connect-card p:first-of-type {
  border-top: none;
  padding-top: 0;
}

.connect-card p:last-child {
  padding-bottom: 0;
}

.connect-card p:not(:has(strong)) {
  font-variant-numeric: tabular-nums;
  line-height: 2.1;
  color: var(--on-surface-high-contrast);
}

.connect-card strong {
  color: var(--primary);
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  font-size: var(--body-size);
  letter-spacing: calc(var(--type-label-letter-spacing) * 1.5);
  margin-right: 0;
}
</style>
