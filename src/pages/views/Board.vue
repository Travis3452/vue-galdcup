<template>
  <div class="min-h-screen bg-indigo-50 py-10 flex justify-center">
    <div class="w-[95%] max-w-7xl bg-white border-2 border-gray-200 rounded-lg shadow-md flex flex-col">
      <BoardInfo />
      <VoteSession />
      <PostList />
    </div>
  </div>
</template>

<script setup>
import BoardInfo from '@/components/board/pages/BoardInfo.vue'
import VoteSession from '@/components/board/pages/VoteSession.vue'
import PostList from '@/components/board/pages/PostList.vue'
</script>