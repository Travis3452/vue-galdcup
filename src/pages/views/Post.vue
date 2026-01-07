<template>
  <!-- 방금 주신 template 그대로 유지 -->
  <div class="min-h-screen bg-indigo-50 py-10 flex justify-center">
    <div class="w-[90%] max-w-4xl bg-white border-2 border-gray-200 rounded-lg shadow-md p-8">
      <!-- 게시글 -->
      <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ post?.title }}</h1>
      <div class="flex justify-between items-center text-sm text-gray-600 border-b pb-3 mb-6">
        <span>👤 {{ post?.authorNickname }}</span>
        <div class="flex items-center space-x-4">
          <span>⏰ {{ formatDate(post?.createdAt) }}</span>
          <span>👁️ 조회수 {{ post?.view }}</span>
          <template v-if="store.id && post?.authorId === store.id">
            <button @click="editPost" class="px-3 py-1 bg-yellow-500 text-white rounded text-xs">수정</button>
            <button @click="deletePost" class="px-3 py-1 bg-red-500 text-white rounded text-xs">삭제</button>
          </template>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div class="prose max-w-none text-gray-800 mb-8 min-h-[300px]" v-html="post?.content"></div>

      <!-- 좋아요/싫어요 버튼 -->
      <div class="flex justify-center items-center space-x-6 mb-6">
        <button @click="reactToPost('LIKE')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          👍 좋아요 {{ post?.likeCount }}
        </button>
        <button @click="reactToPost('DISLIKE')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          👎 싫어요 {{ post?.dislikeCount }}
        </button>
      </div>

      <!-- 댓글 영역 -->
      <!-- (댓글/대댓글 template 그대로 유지) -->
      <!-- ... -->
    </div>
  </div>
</template>

<script setup>
import usePost from '@/pages/scripts/Post.js'

const {
  store,
  post,
  comments,
  replies,
  newComment,
  newReplies,
  currentPage,
  totalPages,
  hasNextPage,
  activeReplyBox,
  visiblePages,
  formatDate,
  fetchPost,
  fetchComments,
  createComment,
  createReply,
  toggleReplyBox,
  prevPage,
  nextPage,
  goToPage,
  editComment,
  deleteComment,
  editReply,
  deleteReply,
  editPost,
  deletePost,
  reactToPost
} = usePost()
</script>