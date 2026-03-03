<template>
  <div class="min-h-screen py-10 flex justify-center bg-slate-100">
    <div 
      class="w-[95%] max-w-7xl bg-white border border-slate-200 shadow-xl flex flex-col overflow-hidden"
      :class="!$route.meta.noLayout ? 'rounded-[2.5rem]' : 'rounded-none border-0 shadow-none'"
    >
      <BoardInfo 
        v-if="!$route.meta.noLayout" 
        class="!mb-0 !rounded-none !shadow-none !border-0" 
      />

      <div v-if="!$route.meta.noLayout" class="w-full border-t-4 border-slate-100 relative z-20"></div>

      <router-view :key="$route.fullPath" class="!rounded-none !shadow-none !border-0" />
      
    </div>
  </div>
</template>

<script setup>
import BoardInfo from '@/views/board/BoardInfoView.vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<style scoped>
/* 팝업일 때는 배경색을 흰색으로 고정하고 싶다면 아래 스타일 추가 */
.min-h-screen {
  transition: background-color 0.3s;
}
</style>