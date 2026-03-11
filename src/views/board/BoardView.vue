<template>
  <div class="flex flex-col gap-6 px-6 py-6">
    <VoteSession />

    <PostList :boardId="boardId" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import PostList from '@/views/board/PostListView.vue'
import VoteSession from '@/views/board/VoteSessionView.vue'

const route = useRoute()
const boardStore = useBoardStore()

const boardId = computed(() => route.params.boardId)
</script>