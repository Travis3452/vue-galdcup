<template>
  <div class="min-h-screen py-10 flex justify-center">
    <div class="w-[95%] max-w-7xl bg-white border-2 border-gray-200 rounded-lg shadow-md flex flex-col">
      <!-- 항상 유지되는 컴포넌트 -->
      <BoardInfo />

      <!-- 라우트에 따라 교체되는 컴포넌트 -->
      <router-view :key="$route.fullPath" />
    </div>
  </div>
</template>

<script setup>
import BoardInfo from '@/components/board/pages/BoardInfo.vue'
</script>