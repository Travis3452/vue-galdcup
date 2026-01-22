<template>
  <div class="flex flex-col gap-6 px-6 py-6">
    <!-- 투표 세션 -->
    <VoteSession />

    <!-- 게시글 목록 -->
    <PostList />
  </div>
</template>

<script setup>
import PostList from '@/components/board/pages/PostList.vue'
import VoteSession from '@/components/board/pages/VoteSession.vue'
</script>