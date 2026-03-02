<template>
  <div class="flex flex-col gap-6 px-6 py-6">
    <VoteSession />

    <PostList :boardId="boardId" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import PostList from '@/components/board/pages/PostList.vue'
import VoteSession from '@/components/board/pages/VoteSession.vue'

const route = useRoute()
const boardId = route.params.boardId
</script>