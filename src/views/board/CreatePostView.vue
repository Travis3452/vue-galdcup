<template>
  <section class="post-form-page">
    <div class="page-heading"><div><p class="eyebrow">우리의 생각을 나누는 공간</p><h1>게시글 작성</h1><p class="page-description">다른 취향도 존중하며 자유롭게 이야기해 주세요.</p></div></div>
    <form class="surface panel-padding" @submit.prevent="createPost">
      <div class="post-form-fields">
        <div><label for="post-category" class="field-label">카테고리 <span class="muted">(필수)</span></label><select id="post-category" v-model="selectedCategoryId" class="form-control" :disabled="submitting || loading" required><option :value="null" disabled>선택해 주세요</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></div>
        <div class="min-w-0"><label for="post-title" class="field-label">제목 <span class="muted">(필수)</span></label><input id="post-title" v-model="title" class="form-control" maxlength="50" :disabled="submitting || loading" required placeholder="어떤 이야기를 나누고 싶으신가요?" aria-describedby="post-title-help" @input="errorMessage = ''" /><p id="post-title-help" class="field-help">{{ title.length }} / 50자</p></div>
      </div>
      <div class="mt-6"><p class="field-label">본문 <span class="muted">(필수)</span></p>
        <p v-if="loading || uploading" role="status" class="field-help mb-3">{{ uploading ? '이미지를 업로드하고 있습니다…' : '작성 화면을 준비하고 있습니다…' }}</p>
        <div class="post-editor"><div ref="editorRef"></div></div>
        <p class="field-help">본문 {{ contentLength.toLocaleString() }} / 2,000자 (서식 포함) · 이미지 최대 10MB</p>
      </div>
      <button v-if="!ready && !loading" type="button" class="ui-button ui-button-secondary mt-4" @click="initialize">작성 화면 다시 준비</button>
      <p v-if="errorMessage" role="alert" class="field-error">{{ errorMessage }}</p>
      <div class="form-actions"><button type="button" class="ui-button ui-button-secondary" :disabled="submitting" @click="router.back()">취소</button>
        <button type="submit" class="ui-button" :disabled="submitting || loading || uploading || !ready || !title.trim() || !selectedCategoryId"><span v-if="submitting" class="state-spinner" aria-hidden="true"></span>{{ submitting ? '등록 중…' : '등록하기' }}</button>
      </div>
    </form>
  </section>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { usePostForm } from '@/composables/usePostForm'
import { notify } from '@/services/notifications'
const route = useRoute()
const router = useRouter()
const boardId = Number(route.params.boardId)

const { title, categories, selectedCategoryId, editorRef, submitting, loading, ready, uploading,
  errorMessage, contentLength, submit: createPost, initialize } = usePostForm({
  boardId,
  onSaved: async () => {
    notify('게시글이 등록되었습니다.')
    await router.push(`/boards/${boardId}`)
  },
})
</script>
<style scoped>
.post-form-page { max-width:944px; margin-inline:auto; min-width:0; }
.post-form-fields { display:grid; grid-template-columns:minmax(0,1fr); gap:20px; }
@media(min-width:768px) { .post-form-fields { grid-template-columns:180px minmax(0,1fr); } }
</style>
