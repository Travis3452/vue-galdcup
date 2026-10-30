<template>
  <div class="board-content">
    <BoardManagerTool class="board-management" />
    <div class="board-vote"><VoteSession /></div>
    <section class="surface panel-padding board-posts" aria-label="게시글 목록"><PostList :boardId="String(boardId)" /></section>
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
<style scoped>
.board-content { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; align-items:start; }
.board-management, .board-vote, .board-posts { min-width:0; }
@media(min-width:768px) { .board-content { gap:24px; } }
</style>
