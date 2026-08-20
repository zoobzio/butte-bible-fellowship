<script lang="ts">
import Footer from "@zoobzio/foundation/components/common/footer.vue";
import Group from "@zoobzio/foundation/components/common/group.vue";
import P from "@zoobzio/foundation/components/common/p.vue";
import Span from "@zoobzio/foundation/components/common/span.vue";
import Strong from "@zoobzio/foundation/components/common/strong.vue";
import Anchor from "@zoobzio/foundation/components/common/anchor.vue";

import ColorModeToggle from "~/components/ColorModeToggle.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });
</script>

<template>
  <Footer class="site-footer">
    <Group class="site-footer-grid">
      <Group class="site-footer-col">
        <P><Strong>Butte Bible Fellowship</Strong></P>
        <P>The Church on Pillsbury Road</P>
        <P>Sunday worship · 10:00am</P>
      </Group>

      <Group class="site-footer-col">
        <P><Strong>Contact</Strong></P>
        <P>2255 Pillsbury Road, Chico, California 95926</P>
        <P><Anchor to="tel:5308920521" external label="530-892-0521" /></P>
        <P>
          <Anchor
            to="mailto:office@bbfchurchchico.org"
            external
            label="office@bbfchurchchico.org"
          />
        </P>
      </Group>

      <Group class="site-footer-col">
        <P><Strong>Online</Strong></P>
        <P>
          <Anchor
            to="https://www.facebook.com/bbfchurchchico/"
            external
            target="_blank"
            label="Facebook"
          />
        </P>
        <P>
          <Anchor
            to="https://www.youtube.com/@ButteBibleFellowshipChico"
            external
            target="_blank"
            label="YouTube"
          />
        </P>
      </Group>
    </Group>

    <Group class="site-footer-legal">
      <ColorModeToggle />
      <Span>© {{ new Date().getFullYear() }} Butte Bible Fellowship</Span>
    </Group>
  </Footer>
</template>
