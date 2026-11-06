<script lang="ts">
import { Icon, Menu } from "#components";
import { defineMenu, navigateTo, useAuth, useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "AccountMenu" });

const { $t } = useNuxtApp();

const auth = useAuth();

const signOut = async () => {
  await auth.logout();
  await navigateTo("/login");
};

/* Who is signed in, and the way out, behind their name at the bar's end. */
const menu = defineMenu(() => ({
  label: $t.admin.account.menu(),
  groups: [
    {
      key: "account",
      label: auth.current?.name ? auth.current.email : undefined,
      items: [
        {
          key: "sign-out",
          label: $t.admin.account.signOut(),
          icon: "log-out" as const,
        },
      ],
    },
  ],
  align: "end" as const,
  onSelect: (item: { key: string }) => {
    if (item.key === "sign-out") signOut();
  },
}));
</script>

<template>
  <Menu v-if="auth.current" v-bind="menu">
    <button type="button" class="theme-toggle account-toggle">
      <Icon name="user" class="icon" aria-hidden="true" />
      <span class="account-toggle-name">
        {{ auth.current.name || auth.current.email || $t.admin.account.menu() }}
      </span>
    </button>
  </Menu>
</template>

<style>
.theme-toggle.account-toggle {
  padding-inline: var(--space-3);
}

.account-toggle-name {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 44rem) {
  .account-toggle-name {
    max-width: 8rem;
  }
}
</style>
