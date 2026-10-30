<template>
  <header class="surface panel-padding board-header">
    <div v-if="isLoading" role="status" class="board-header-loading"><div class="h-7 w-2/3 bg-slate-100 rounded animate-pulse"></div><div class="h-4 w-full bg-slate-100 rounded animate-pulse"></div><span class="sr-only">갈드컵 정보를 불러오는 중입니다.</span></div>
    <template v-else>
      <div class="board-heading-row">
        <div class="min-w-0"><router-link :to="`/boards/${boardId}`"><component :is="$route.name === 'Board' ? 'h1' : 'h2'">{{ board?.topic }}</component></router-link><p v-if="board?.description" class="board-description">{{ board.description }}</p></div>
        <div class="board-header-meta"><span>매니저 <strong>{{ boardPolicy?.boardManager?.nickname || '없음' }}</strong></span><span>개설일 {{ formatDate(board?.createdAt) }}</span></div>
      </div>
      <button v-if="board && !boardPolicy?.boardManager" type="button" class="ui-button ui-button-secondary mt-5" :disabled="isApplying" @click="applyForBoardManager">{{ isApplying ? '신청 중…' : '갈드컵 매니저 신청' }}</button>
    </template>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import api from '@/axios'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const isApplying = ref(false)

const board = computed(() => boardStore.currentBoard)
const boardPolicy = computed(() => boardStore.currentPolicy)
const boardId = computed(() => boardStore.currentBoard?.id)
const isLoading = computed(() => boardStore.isLoading)

/** * 관리자 권한 신청 API 호출 (일반 유저용 기능이므로 유지) */
async function applyForBoardManager() {
  if (isApplying.value || !boardId.value) return
  isApplying.value = true
  try {
    const res = await api.post(`/boards/${boardId.value}/apply`)
    
    if (res.data.status === 'APPROVED') {
      alert('관리자가 공석이기 때문에 즉시 관리자로 임명되었습니다!')
      await boardStore.fetchBoardDetails(String(boardId.value))
    } else {
      alert('권한 위임 신청이 접수되었습니다. 기존 관리자의 승인을 기다려주세요.')
    }
  } catch (err) {
    alert(err.response?.data?.message || '권한 위임 신청 실패')
  } finally { isApplying.value = false }
}

/** 날짜 포맷 헬퍼 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>
<style scoped>
.board-header { padding:4px 0 26px; border:0; border-bottom:1px solid var(--ui-border); border-radius:0; background:transparent; box-shadow:none; }
.board-heading-row { display:flex; flex-direction:column; gap:16px; }
.board-heading-row :is(h1,h2) { font-size:clamp(28px,3.5vw,42px); font-weight:800; letter-spacing:-.05em; }
.board-description { max-width:760px; margin-top:12px; color:var(--ui-text-muted); font-size:14px; line-height:1.8; }
.board-header-meta { display:flex; flex-wrap:wrap; gap:8px 20px; color:var(--ui-text-muted); font-size:12px; }
.board-header-meta strong { margin-left:5px; color:var(--ui-secondary); font-weight:600; }
.board-header-loading { display:grid; gap:20px; padding-block:12px; }
@media(min-width:1024px) { .board-heading-row { flex-direction:row; justify-content:space-between; } .board-header-meta { flex-direction:column; flex:0 0 auto; padding-top:4px; text-align:right; } }
</style>
