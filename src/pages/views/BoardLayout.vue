<template>
  <div class="min-h-screen py-10 flex justify-center bg-slate-100">
    <div class="w-[95%] max-w-7xl bg-white border border-slate-200 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden">
      
      <BoardInfo class="!mb-0 !rounded-none !shadow-none !border-0" />

      <div class="w-full border-t-4 border-slate-100 relative z-20"></div>

      <router-view :key="$route.fullPath" class="!rounded-none !shadow-none !border-0" />
      
    </div>
  </div>
</template>

<script setup>
import BoardInfo from '@/components/board/pages/BoardInfo.vue'
</script>