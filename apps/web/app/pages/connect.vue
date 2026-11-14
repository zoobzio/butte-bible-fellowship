<script lang="ts">
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import ConnectCard from "~/components/ConnectCard.vue";
import ConnectGrid from "~/components/ConnectGrid.vue";
import MapEmbed from "~/components/MapEmbed.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import { useConnect } from "~/composables/contact";
import { useConnectPage } from "~/composables/page";
import { useStaff } from "~/composables/staff";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

/*
 * The page's own row, as the admin wrote it: the header it opens with and
 * how to find and reach the church in its front matter, over what is
 * written on it. The headings and labels of its cards are the interface's.
 */
const { data: page } = await useConnectPage();

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

/* The tab reads as the other pages' do: the page, then the church. */
useHead(() => ({
  title: page.value && `${page.value.title} – ${$t.site.name()}`,
}));

const connect = useConnect(() => page.value);

const { data } = await useStaff();
const staff = computed(() => data.value ?? []);
</script>

<template>
  <div v-if="page && connect" class="connect">
    <PageHeader :title="page.title" :description="page.description" />
    <section v-if="staff.length" class="connect-staff">
      <StaffCard v-for="member in staff" :key="member.id" :member="member" />
    </section>
    <article class="prose">
      <MarkdownBody v-if="page.body.children.length" :page="page" />
      <ConnectGrid>
        <ConnectCard>
          <h2>{{ $t.connect.visit() }}</h2>
          <p>
            <strong>{{ $t.connect.address() }}</strong> {{ connect.address }}
          </p>
          <p v-if="connect.phone">
            <strong>{{ $t.connect.phone() }}</strong>
            <a :href="connect.phone.href">{{ connect.phone.text }}</a>
          </p>
          <p v-if="connect.fax">
            <strong>{{ $t.connect.fax() }}</strong> {{ connect.fax }}
          </p>
          <p v-if="connect.email">
            <strong>{{ $t.connect.email() }}</strong>
            <a :href="connect.email.href">{{ connect.email.text }}</a>
          </p>
        </ConnectCard>
        <ConnectCard v-if="connect.hours.length">
          <h2>{{ $t.connect.hours() }}</h2>
          <p v-for="line in connect.hours" :key="line">{{ line }}</p>
        </ConnectCard>
      </ConnectGrid>
      <MapEmbed
        :src="connect.map"
        :title="$t.connect.map({ address: connect.address })"
      />
    </article>
  </div>
</template>

<style>
.connect {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.connect-staff {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  gap: var(--space-7) var(--space-6);
  padding-top: var(--space-7);
}

.connect .prose {
  width: auto;
  margin-inline: 0;
  padding-block: 0 clamp(var(--space-7), 7vw, var(--space-9));
}

.connect .prose > .connect-grid {
  margin-top: var(--space-6);
}
</style>
