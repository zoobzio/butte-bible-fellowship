<script lang="ts">
import { Icon } from "#components";
import { navigateTo, useAuth, useNuxtApp } from "#imports";

import ColorMode from "#layers/bbf/app/components/ColorMode.vue";
import LanguagePicker from "#layers/bbf/app/components/LanguagePicker.vue";
import ThemePicker from "#layers/bbf/app/components/ThemePicker.vue";
import ThemeSettings from "#layers/bbf/app/components/ThemeSettings.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AccountPanel" });

const { $t } = useNuxtApp();

// Who is signed in, and the way out: the session ends, then the login page.
const auth = useAuth();
const signOut = async () => {
  await auth.logout();
  await navigateTo("/login");
};
</script>

<template>
  <div v-if="auth.current" class="account-panel">
    <div class="account-identity">
      <span v-if="auth.current.name" class="account-identity-name">
        {{ auth.current.name }}
      </span>
      <span v-if="auth.current.email" class="account-identity-email">
        {{ auth.current.email }}
      </span>
    </div>
    <!-- The language and appearance controls are the layer's, each named
         in the reader's language. -->
    <div
      class="account-controls"
      role="group"
      :aria-label="$t.admin.account.appearance()"
    >
      <LanguagePicker />
      <ColorMode />
      <ThemePicker />
      <ThemeSettings />
    </div>
    <button type="button" class="account-action" @click="signOut">
      <Icon name="log-out" class="account-action-icon" aria-hidden="true" />
      {{ $t.admin.account.signOut() }}
    </button>
  </div>
</template>

<style>
/* The panel: who is signed in, the language and appearance controls, and
   the way out, one under another, ruled off from the sections above. */
.account-panel {
  display: grid;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px var(--stroke-solid) var(--rule);
}

.account-identity {
  display: grid;
  gap: var(--space-1);
  padding: 0 var(--space-3);
}

.account-identity-name {
  font: var(--type-body);
  font-weight: var(--weight-medium);
  color: var(--on-surface-high-contrast);
}

.account-identity-email {
  overflow: hidden;
  font: var(--type-label);
  color: var(--on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The language, color mode, theme and settings controls sit together in a
   row. Each opens its panel above itself, clear of the window's foot. */
.account-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
}

.account-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--shape-sm);
  background: transparent;
  color: var(--primary);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.account-action:hover {
  background: color-mix(in oklab, var(--primary-container) 40%, transparent);
}

.account-action-icon {
  flex: none;
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}
</style>
