<template>
  <div class="flex flex-col min-h-screen">
    <!-- 상단 NavBar -->
    <NavBar v-if="!$route.meta.noLayout" />

    <!-- 메인 콘텐츠 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 하단 Footer -->
    <Footer v-if="!$route.meta.noLayout" />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<style scoped>
main {
  flex: 1;
  padding: 20px;
  background-color: #f9fafb; /* 밝은 배경 */
}
</style>