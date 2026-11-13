<script lang="ts">
import { computed, definePageMeta, useHead, useNuxtApp } from "#imports";

import ConnectCard from "~/components/ConnectCard.vue";
import ConnectGrid from "~/components/ConnectGrid.vue";
import MapEmbed from "~/components/MapEmbed.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import { useConnect } from "~/composables/contact";
import { useStaff } from "~/composables/staff";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();
const connect = useConnect();

useHead(() => ({ title: $t.connect.head() }));

const { data } = await useStaff();
const staff = computed(() => data.value ?? []);
</script>

<template>
  <div class="connect">
    <PageHeader
      :title="$t.connect.title()"
      :description="$t.connect.description()"
    />
    <section v-if="staff.length" class="connect-staff">
      <StaffCard v-for="member in staff" :key="member.id" :member="member" />
    </section>
    <article class="prose">
      <ConnectGrid>
        <ConnectCard>
          <h2>{{ $t.connect.visit() }}</h2>
          <p>
            <strong>{{ $t.connect.address() }}</strong> {{ connect.address }}
          </p>
          <p>
            <strong>{{ $t.connect.phone() }}</strong>
            <a :href="connect.phone.href">{{ connect.phone.text }}</a>
          </p>
          <p>
            <strong>{{ $t.connect.fax() }}</strong> {{ connect.fax }}
          </p>
          <p>
            <strong>{{ $t.connect.email() }}</strong>
            <a :href="connect.email.href">{{ connect.email.text }}</a>
          </p>
        </ConnectCard>
        <ConnectCard>
          <h2>{{ $t.connect.hours() }}</h2>
          <p>{{ $t.connect.open() }}</p>
          <p>{{ $t.connect.friday() }}</p>
          <p>{{ $t.connect.closed() }}</p>
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
