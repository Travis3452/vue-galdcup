<template>
  <div class="flex flex-col gap-8 md:gap-12 px-4 md:px-8 py-6 md:py-8 w-full">
    
    <BoardManagerTool />

    <VoteSession />

    <div class="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2 md:my-4"></div>

    <PostList :boardId="String(boardId)" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BoardManagerTool from '@/views/board/BoardManagerTool.vue'
import VoteSession from '@/views/board/VoteSessionView.vue'
import PostList from '@/views/board/PostListView.vue'

const route = useRoute()
const boardId = computed(() => route.params.boardId)
</script>