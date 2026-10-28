<script lang="ts">
import type { StaffMember } from "@bbf/schema/types";

import { computed, useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffCard" });

const { member, compact = false } = defineProps<{
  member: StaffMember;
  compact?: boolean;
}>();

const { $t } = useNuxtApp();

const role = computed(() => $t.roles[member.role]());

const initials = computed(() => {
  const names = member.name.trim().split(/\s+/);
  return [names[0], names.length > 1 ? names[names.length - 1] : undefined]
    .flatMap((name) => (name ? [name[0]!.toUpperCase()] : []))
    .join("");
});
</script>

<template>
  <article class="staff-card" :class="{ 'staff-card-compact': compact }">
    <div class="staff-card-frame arch">
      <img
        v-if="member.photo"
        :src="member.photo"
        alt=""
        class="staff-card-photo"
        loading="lazy"
      />
      <span v-else class="staff-card-initials" aria-hidden="true">
        {{ initials }}
      </span>
    </div>
    <div class="staff-card-meta">
      <p class="staff-card-role">{{ role }}</p>
      <h3>{{ member.name }}</h3>
      <p v-if="member.summary && !compact" class="staff-card-summary">
        {{ member.summary }}
      </p>
      <a v-if="member.email && !compact" :href="`mailto:${member.email}`">
        {{ member.email }}
      </a>
    </div>
  </article>
</template>

<style>
.staff-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.staff-card-frame {
  overflow: hidden;
  aspect-ratio: 4 / 5;
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 45%, var(--rule));
  background: var(--surface-container);
  box-shadow: var(--elevation-low);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.staff-card:hover .staff-card-frame {
  border-color: color-mix(in oklab, var(--primary) 80%, transparent);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}

.staff-card-photo,
.staff-card-initials {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.staff-card-initials {
  background: color-mix(in oklab, var(--primary-container) 60%, transparent);
  color: var(--primary);
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: clamp(var(--headline-size), 4vw, var(--display-size));
  letter-spacing: var(--type-headline-letter-spacing);
}

.staff-card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.staff-card-role {
  margin: 0;
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

.staff-card h3 {
  margin: 0;
  font: var(--type-title);
  font-family: var(--font-display);
  font-style: normal;
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.staff-card-summary {
  margin: 0;
  font-size: var(--label-size);
  line-height: 1.7;
  color: var(--on-surface);
}

.staff-card a {
  font-size: var(--label-size);
}

.staff-card-compact {
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
}

.staff-card-compact .staff-card-frame {
  flex: none;
  width: 4rem;
  margin-bottom: 0;
  padding: var(--space-1);
}

.staff-card-compact .staff-card-initials {
  font-size: var(--title-size);
}

.staff-card-compact .staff-card-meta {
  gap: 0;
}
</style>
