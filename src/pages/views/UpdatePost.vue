<template>
  <div class="page-wrap">
    <div class="container">
      <h1 class="title">게시글 수정</h1>

      <input
        v-model="title"
        class="title-input"
        placeholder="제목을 입력하세요."
        aria-label="제목 입력"
      />

      <div ref="editorRef" class="editor" aria-label="게시글 내용 에디터"></div>

      <div class="actions">
        <button class="btn primary" @click="updatePost" :disabled="submitting">
          {{ submitting ? '수정 중...' : '수정완료' }}
        </button>
        <router-link :to="`/boards/${boardId}`" class="btn secondary">취소</router-link>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import useUpdatePost from '@/pages/scripts/UpdatePost.js'

const {
  title,
  editorRef,
  boardId,
  postId,
  submitting,
  errorMessage,
  updatePost,
  initQuill,
  loadPost
} = useUpdatePost()

onMounted(() => {
  initQuill()
  loadPost()
})
</script>

<style scoped>
.page-wrap {
  background: #eef2ff;
  padding: 48px 16px;
  box-sizing: border-box;
}
.container {
  max-width: 980px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-sizing: border-box;
}
.title {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 700;
  color: #3730a3;
}
.title-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 1px solid #e6e9ff;
  border-radius: 10px;
  margin-bottom: 18px;
  background: #fbfbff;
}
.title-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 6px rgba(99,102,241,0.06);
}
.editor {
  border: 1px solid #e6e9ff;
  border-radius: 10px;
  background: #ffffff;
  margin-bottom: 18px;
}
.editor .ql-toolbar {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background: #f8f9ff;
  border-bottom: 1px solid #eef0ff;
}
.editor .ql-container {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
:deep(.ql-editor),
:deep(.ql-editor.ql-blank),
:deep(.ql-container .ql-editor) {
  min-height: 520px !important;
  max-height: 1000px !important;
  overflow-y: auto !important;
  padding: 18px !important;
  font-size: 16px;
  line-height: 1.6;
  color: #111827;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn.primary {
  background: linear-gradient(180deg, #4f46e5, #4338ca);
  color: #fff;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.18);
}
.btn.primary:disabled {
  background: linear-gradient(180deg, #a5b4fc, #8b9cff);
  cursor: not-allowed;
  box-shadow: none;
}
.btn.secondary {
  background: #f3f4ff;
  color: #3730a3;
  border: 1px solid #e6e9ff;
}
.error {
  color: #dc2626;
  margin-top: 12px;
  font-weight: 600;
}
</style>