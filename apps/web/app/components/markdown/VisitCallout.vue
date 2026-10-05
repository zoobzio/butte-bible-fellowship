<script setup lang="ts">
defineOptions({ name: "VisitCallout" });
</script>

<template>
  <div class="visit-callout">
    <slot />
  </div>
</template>

<style>
.visit-callout {
  position: relative;
  overflow: hidden;
  margin: var(--space-8) 0 0;
  padding: var(--space-6) var(--space-6) var(--space-6) var(--space-7);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 40%, var(--outline-muted));
  border-radius: var(--shape-lg) var(--shape-lg) var(--shape-lg) var(--shape-lg);
  background:
    linear-gradient(
      150deg,
      color-mix(in oklab, var(--secondary-container) 40%, transparent),
      transparent 70%
    ),
    var(--surface-container);
}

.visit-callout::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
}

.visit-callout p {
  margin: 0;
  font-size: clamp(
    calc(var(--body-size) * 1.05),
    2vw,
    calc(var(--body-size) * 1.15)
  );
  line-height: 1.8;
  color: var(--on-surface-high-contrast);
  max-width: none;
}

.visit-callout strong {
  display: block;
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.6vw, var(--headline-size));
  font-weight: var(--weight-regular);
  margin-bottom: var(--space-2);
  color: var(--on-surface-high-contrast);
}
</style>
