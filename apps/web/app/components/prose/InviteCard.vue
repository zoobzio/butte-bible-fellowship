<script setup lang="ts">
defineOptions({ name: "InviteCard" });
</script>

<template>
  <div class="invite-card">
    <slot />
  </div>
</template>

<style>
.invite-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  border-radius: var(--shape-lg);
  border: 1px var(--stroke-solid) var(--rule);
  background:
    linear-gradient(
      150deg,
      color-mix(in oklab, var(--secondary-container) 40%, transparent),
      transparent 70%
    ),
    var(--surface-container);
  box-shadow: var(--elevation-low);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.invite-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--gradient-signature);
}

.invite-card:hover {
  border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}

.invite-card h3 {
  margin: 0 0 var(--space-3);
}

.invite-card p {
  margin: 0;
  line-height: 1.7;
  max-width: none;
  color: var(--on-surface);
}

.invite-card p + p {
  margin-top: var(--space-3);
}
</style>
