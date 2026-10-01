<script lang="ts">
import ColorModeToggle from "~/components/ColorModeToggle.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppFooter" });
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-grid">
      <div class="site-footer-col">
        <p><strong>Butte Bible Fellowship</strong></p>
        <p>The Church on Pillsbury Road</p>
        <p>Sunday worship · 10:00am</p>
      </div>

      <div class="site-footer-col">
        <p><strong>Contact</strong></p>
        <p>2255 Pillsbury Road, Chico, California 95926</p>
        <p><a href="tel:5308920521">530-892-0521</a></p>
        <p>
          <a href="mailto:office@bbfchurchchico.org">
            office@bbfchurchchico.org
          </a>
        </p>
      </div>

      <div class="site-footer-col">
        <p><strong>Online</strong></p>
        <p>
          <a href="https://www.facebook.com/bbfchurchchico/" target="_blank">
            Facebook
          </a>
        </p>
        <p>
          <a
            href="https://www.youtube.com/@ButteBibleFellowshipChico"
            target="_blank"
          >
            YouTube
          </a>
        </p>
      </div>
    </div>

    <div class="site-footer-legal">
      <ColorModeToggle />
      <span>© {{ new Date().getFullYear() }} Butte Bible Fellowship</span>
    </div>
  </footer>
</template>
