<script lang="ts">
import type { StaffMember } from "#shared/types/staff";

import { computed } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffCard" });

const { member } = defineProps<{ member: StaffMember }>();

// Without a photo the card shows the person's initials: the first letter of
// their first and last names.
const initials = computed(() => {
  const names = member.name.trim().split(/\s+/);
  return [names[0], names.length > 1 ? names[names.length - 1] : undefined]
    .flatMap((name) => (name ? [name[0]!.toUpperCase()] : []))
    .join("");
});
</script>

<template>
  <article class="staff-card">
    <div class="staff-card-frame">
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
      <p class="staff-card-role">{{ member.role }}</p>
      <h3>{{ member.name }}</h3>
      <p v-if="member.bio" class="staff-card-bio">{{ member.bio }}</p>
      <a v-if="member.email" :href="`mailto:${member.email}`">
        {{ member.email }}
      </a>
    </div>
  </article>
</template>

<style>
/* The sermon card's shape — a picture, and what is said about it under —
   with the picture in the arched window the about page's used to be in. */
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
    color-mix(in oklab, var(--primary) 45%, var(--outline-muted));
  border-radius: 50% 50% var(--shape-sm) var(--shape-sm) / 34% 34%
    var(--shape-sm) var(--shape-sm);
  background: var(--surface-container);
  transition:
    border-color var(--transition-base),
    transform var(--transition-base);
}

.staff-card:hover .staff-card-frame {
  border-color: color-mix(in oklab, var(--primary) 80%, transparent);
  transform: translateY(-2px);
}

/* What is in the window takes its shape: the same arch, inside the rim. */
.staff-card-photo,
.staff-card-initials {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.staff-card-initials {
  background: color-mix(in oklab, var(--primary-container) 60%, transparent);
  color: var(--primary-medium-contrast);
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
  color: var(--primary-medium-contrast);
}

.staff-card h3 {
  margin: 0;
  font: var(--type-title);
  font-family: var(--font-display);
  font-style: normal;
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.staff-card-bio {
  margin: 0;
  font-size: var(--label-size);
  line-height: 1.7;
  color: var(--on-surface-medium-contrast);
}

.staff-card a {
  font-size: var(--label-size);
}
</style>
