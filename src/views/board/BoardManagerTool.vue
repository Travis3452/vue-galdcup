<template>
  <details v-if="isBoardManager" class="surface manager-panel">
    <summary><span class="manager-summary-icon" aria-hidden="true">⚙</span><span><strong>매니저 도구</strong><span class="manager-description">투표와 갈드컵 설정을 관리합니다.</span></span><span class="manager-toggle" aria-hidden="true">⌄</span></summary>
    <div class="manager-tools">
      <section><h3>투표 관리</h3><p class="field-help">{{ isVoteActive ? '진행 중인 투표를 마감하고 결과를 공개할 수 있습니다.' : '새로운 주제로 투표를 만들어 보세요.' }}</p><button v-if="isVoteActive" type="button" class="ui-button ui-button-secondary mt-4" :disabled="pending" @click="handleFinishVote">현재 투표 마감</button><button v-else type="button" class="ui-button mt-4" :disabled="pending" @click="handleCreateVote">새 투표 만들기</button></section>
      <section><h3>갈드컵 설정</h3><p class="field-help">정책, 매니저, 카테고리를 관리할 수 있습니다.</p><div class="flex flex-wrap gap-2 mt-4"><button type="button" class="ui-button ui-button-secondary" @click="showPolicyModal = true">설정 열기</button><button type="button" class="ui-button ui-button-danger-outline" :disabled="pending" @click="confirmDeleteBoard">갈드컵 삭제</button></div></section>
    </div>
    <BoardPolicyModal v-if="showPolicyModal" @close="showPolicyModal = false" />
  </details>
</template>
<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios' 
import { useBoardStore } from '@/stores/board'
import { useClock } from '@/composables/useClock'
import { notify } from '@/services/notifications'
import { getErrorMessage } from '@/utils/request'
const BoardPolicyModal = defineAsyncComponent(() => import('@/views/board/BoardPolicyView.vue'))

const router = useRouter()
const pending = ref(false)
const now = useClock()
const boardStore = useBoardStore()

const showPolicyModal = ref(false)

const board = computed(() => boardStore.currentBoard)
const boardId = computed(() => boardStore.currentBoard?.id)
const voteSession = computed(() => boardStore.activeVoteSession)

const isVoteActive = computed(() => {
  if (!voteSession.value) return false;
  if (voteSession.value.isFinished) return false;
  
  const endTime = new Date(voteSession.value.endTime).getTime();
  return now.value < endTime;
});

const isBoardManager = computed(() => boardStore.isBoardManager)

const handleCreateVote = () => {
  router.push({ name: 'CreateVoteSession', params: { boardId: boardId.value } })
}

const handleFinishVote = async () => {
  if (pending.value || !voteSession.value) return;
  if (!confirm("현재 진행 중인 투표를 즉시 마감하시겠습니까?")) return;
  pending.value = true;
  try {
    await api.post(`/boards/${boardId.value}/vote-session/${voteSession.value.id}/finish`);
    notify("투표가 종료되었습니다.");
    await boardStore.fetchActiveVoteSession(boardId.value);
  } catch (error) {
    notify(getErrorMessage(error, "마감 처리에 실패했습니다."), "error");
  } finally { pending.value = false; }
}

async function deleteBoard() {
  if (pending.value) return
  pending.value = true
  try {
    await api.delete(`/boards/${boardId.value}`)
    notify('게시판이 삭제되었습니다.')
    router.push('/')
  } catch (err) {
    notify(getErrorMessage(err, '게시판을 삭제하지 못했습니다.'), 'error')
  } finally { pending.value = false }
}

function confirmDeleteBoard() {
  if (!confirm('⚠️ 정말 삭제하시겠습니까?')) return
  const input = prompt(`확인을 위해 주제를 입력하세요: ${board.value?.topic}`)
  if (input === board.value?.topic) deleteBoard()
}
</script>
<style scoped>
.manager-panel { background:var(--ui-primary-soft); border-color:var(--ui-primary-border); }
.manager-panel > summary { display:flex; align-items:center; gap:12px; padding:16px 20px; cursor:pointer; list-style:none; }
.manager-panel > summary::-webkit-details-marker { display:none; }
.manager-panel > summary:focus-visible { outline:3px solid var(--ui-primary); outline-offset:3px; border-radius:12px; }
.manager-panel summary strong { font-size:14px; color:var(--ui-primary); }
.manager-description { display:block; margin-top:3px; font-size:12px; color:var(--ui-text-muted); }
.manager-summary-icon { display:grid; place-items:center; width:36px; height:36px; flex:0 0 auto; border-radius:10px; color:var(--ui-primary); background:var(--ui-surface); font-size:20px; }
.manager-toggle { margin-left:auto; font-size:20px; }
.manager-panel[open] .manager-toggle { transform:rotate(180deg); }
.manager-tools { display:grid; gap:24px; padding:20px; border-top:1px solid var(--ui-primary-border); background:var(--ui-surface); border-radius:0 0 16px 16px; }
.manager-tools h3 { font-size:14px; font-weight:650; }
@media(min-width:768px) { .manager-tools { grid-template-columns:repeat(2,minmax(0,1fr)); } }
</style>
