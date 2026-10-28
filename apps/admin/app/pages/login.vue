<script lang="ts">
import { Body, Icon } from "#components";
import {
  definePageMeta,
  useHead,
  useLocale,
  useNuxtApp,
  useRoute,
} from "#imports";
</script>

<script setup lang="ts">
definePageMeta({ layout: false });

const { $t } = useNuxtApp();
const { locale } = useLocale();
useHead(() => ({
  title: $t.admin.login.title(),
  htmlAttrs: { lang: locale.value },
}));

const route = useRoute();
const redirect =
  typeof route.query.redirect === "string" ? route.query.redirect : "/";
const href = `/api/auth/login?${new URLSearchParams({ redirect })}`;
</script>

<template>
  <Body>
    <main class="admin-login">
      <Icon name="logo" class="admin-login-logo" aria-hidden="true" />
      <h1 class="admin-login-title">{{ $t.site.name() }}</h1>
      <p class="admin-login-tag">{{ $t.admin.site.tag() }}</p>
      <a :href="href" class="admin-login-action">{{
        $t.admin.login.google()
      }}</a>
    </main>
  </Body>
</template>

<style>
.admin-login {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--space-3);
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.admin-login-logo {
  display: block;
  width: var(--space-9);
  height: var(--space-9);
  color: var(--primary);
}

.admin-login-title {
  margin: 0;
  font: var(--type-headline);
  font-family: var(--font-display);
  letter-spacing: var(--type-headline-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.admin-login-tag {
  margin: 0 0 var(--space-4);
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

.admin-login-action {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--shape-sm);
  background: var(--primary);
  color: var(--on-primary);
  font: var(--type-body);
  font-weight: var(--weight-medium);
  text-decoration: none;
}
</style>
