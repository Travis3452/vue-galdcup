<template>
  <div class="min-h-screen bg-white flex flex-col p-8">
    <!-- 제목 입력 -->
    <input
      v-model="title"
      class="w-full p-4 text-lg border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="제목을 입력하세요."
      aria-label="제목 입력"
    />

    <!-- 에디터 -->
    <div
      ref="editorRef"
      class="flex-1 border border-gray-300 rounded-lg shadow-md bg-white mb-6 overflow-y-auto"
      aria-label="게시글 내용 에디터"
    ></div>

    <!-- 버튼 영역 -->
    <div class="flex justify-end gap-3 mt-4">
      <button
        class="px-5 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:bg-indigo-300 disabled:shadow-none"
        @click="createPost"
        :disabled="submitting"
      >
        {{ submitting ? '작성 중...' : '작성완료' }}
      </button>
      <router-link
        :to="`/boards/${boardId}`"
        class="px-5 py-2 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-indigo-700 border border-gray-300"
      >
        취소
      </router-link>
    </div>

    <!-- 에러 메시지 -->
    <p v-if="errorMessage" class="text-red-600 mt-4 font-semibold">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import useCreatePost from '@/pages/scripts/CreatePost.js'

const {
  title,
  editorRef,
  boardId,
  submitting,
  errorMessage,
  createPost,
  initQuill
} = useCreatePost()

onMounted(() => {
  initQuill()
})
</script>

<style scoped>
:deep(.ql-toolbar) {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

:deep(.ql-container .ql-editor) {
  min-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #111827;
}
</style>