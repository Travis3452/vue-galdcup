<template>
  <div class="flex flex-col min-h-screen">
    <NavBar v-if="!$route.meta.noLayout" />

    <main class="flex-1 overflow-x-hidden">
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
/* 전역 스타일 설정 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Pretendard', sans-serif; /* 예시 폰트 */
  background-color: #f9fafb;
}

main {
  /* 팝업 페이지 등에서 스크롤 간섭을 최소화 */
  display: flex;
  flex-direction: column;
}

/* 스크롤바 커스텀 (선택사항) */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}
</style>