<template>
  <div class="page-container page-container-narrow">
    <nav class="breadcrumb" aria-label="현재 위치"><router-link to="/">홈</router-link><span aria-hidden="true">/</span><span>갈드컵 만들기</span></nav>
    <div class="page-heading"><div><p class="eyebrow">새로운 이야기의 시작</p><h1>갈드컵 만들기</h1><p class="page-description">함께 이야기하고 싶은 주제를 열어보세요.<br />갈드컵 안에서 투표를 만들고 게시글을 나눌 수 있습니다.</p></div></div>
    <form class="surface panel-padding" @submit.prevent="handleCreateBoard">
      <div class="form-section"><div><label for="board-topic" class="field-label">갈드컵 주제 <span class="muted">(필수)</span></label><input id="board-topic" v-model="topic" type="text" class="form-control" placeholder="예: 짜장면 vs 짬뽕" :disabled="isSubmitting" required aria-describedby="board-topic-help" /><p id="board-topic-help" class="field-help">처음 방문한 사람도 이해할 수 있는 주제로 작성해 주세요.</p></div>
      <div><div class="flex flex-wrap items-center justify-between gap-2"><label for="board-description" class="field-label">상세 설명 <span class="muted">(필수)</span></label><span class="text-xs muted">{{ description.length }} / 200자</span></div><textarea id="board-description" v-model="description" class="form-control" rows="5" maxlength="200" :disabled="isSubmitting" required placeholder="어떤 이야기를 나누는 곳인지 5자 이상 소개해 주세요." aria-describedby="board-description-help"></textarea><p id="board-description-help" class="field-help">주제의 배경이나 함께 지켜주었으면 하는 점을 적어주세요.</p></div></div>
      <p v-if="errorMessage" role="alert" class="field-error">{{ errorMessage }}</p>
      <div class="form-actions"><button type="button" class="ui-button ui-button-secondary" :disabled="isSubmitting" @click="router.back()">취소</button><button type="submit" class="ui-button" :disabled="isSubmitting || description.length < 5 || !topic.trim()">{{ isSubmitting ? '만드는 중…' : '갈드컵 만들기' }}</button></div>
    </form>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'

const router = useRouter()

const topic = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

watch([topic, description], () => {
  errorMessage.value = ''
})

async function handleCreateBoard() {
  if (isSubmitting.value) return
  errorMessage.value = ''
  
  if (!topic.value.trim()) {
    errorMessage.value = '주제를 입력해주세요.'
    return
  }
  if (description.value.length < 5) {
    errorMessage.value = '설명을 5자 이상 입력해주세요.'
    return
  }

  isSubmitting.value = true
  try {
    const res = await api.post('/boards', {
      topic: topic.value.trim(),
      description: description.value.trim()
    })
    const newBoardId = res.data.id || res.data
    router.push(`/boards/${newBoardId}`)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '생성에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
