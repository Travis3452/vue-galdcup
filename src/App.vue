<template>
  <div class="flex flex-col min-h-screen">
    <NavBar v-if="!$route.meta.noLayout" />

    <main class="flex-1">
      <router-view />
    </main>

    <Footer v-if="!$route.meta.noLayout" />
  </div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>