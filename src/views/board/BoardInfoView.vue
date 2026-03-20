<template>
  <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 mb-8 relative overflow-hidden border border-indigo-50">
    <div class="relative z-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div v-if="isLoading" class="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0"></div>
            <span v-else class="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-black shadow-md shrink-0">G</span>
            
            <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div v-if="isLoading" class="h-8 w-48 md:w-64 bg-slate-200 rounded animate-pulse"></div>
              <router-link v-else :to="`/boards/${boardId}`" class="group">
                <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight break-keep group-hover:text-indigo-600 transition-colors">
                  {{ board?.topic }}
                </h1>
              </router-link>
            </div>
          </div>
          
          <div class="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm font-medium">
            <div v-if="isLoading" class="h-8 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
            <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">👤</span>
              <span class="text-slate-400 mr-1">매니저</span>
              <span class="text-slate-800">{{ boardPolicy?.boardManager?.nickname || '없음' }}</span>
            </div>

            <div v-if="isLoading" class="h-8 w-40 bg-slate-200 rounded-xl animate-pulse"></div>
            <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">📅</span>
              <span class="text-slate-400 mr-1">생성일</span>
              <span class="text-slate-800">{{ formatDate(board?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex gap-2 shrink-0">
          <div class="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
          <div class="h-10 w-16 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        <div v-else-if="isBoardManager" class="flex gap-2 shrink-0">
          <button @click="showPolicyModal = true" class="px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition text-sm font-bold shadow-sm">
            정책 변경
          </button>
          <button @click="confirmDeleteBoard" class="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-sm font-bold shadow-sm">
            삭제
          </button>
        </div>
      </div>

      <div class="relative mt-6">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
        <div v-if="isLoading" class="pl-6 py-1 space-y-2">
          <div class="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <p v-else class="text-sm font-medium text-slate-500 leading-relaxed pl-6 py-1">
          {{ board?.description }}
        </p>
      </div>

      <div class="mt-8" v-if="!isLoading && !boardPolicy?.boardManager">
        <button @click="applyForBoardManager" class="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition text-base font-bold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5">
          갈드컵 매니저 권한 신청하기
        </button>
      </div>
    </div>

    <BoardPolicyModal
      v-if="showPolicyModal"
      :boardId="String(boardId)"
      :boardPolicy="boardPolicy"
      @close="showPolicyModal = false"
      @updated="boardStore.fetchBoardDetails(String(boardId))"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import BoardPolicyModal from '@/views/board/BoardPolicyView.vue'

const router = useRouter()
const userStore = useUserStore()
const boardStore = useBoardStore()

const board = computed(() => boardStore.currentBoard)
const boardPolicy = computed(() => boardStore.currentPolicy)
const boardId = computed(() => boardStore.currentBoard?.id)
const isLoading = computed(() => boardStore.isLoading)

/** * 현재 사용자가 이 게시판의 메인 관리자인지 확인 
 * (백엔드에서 이제 일반 USER 권한도 소유권이 있으면 관리 기능을 수행할 수 있습니다.)
 */
const isBoardManager = computed(() => {
  if (!boardPolicy.value?.boardManager || !userStore.id) return false
  return Number(boardPolicy.value.boardManager.id) === Number(userStore.id)
})

const showPolicyModal = ref(false)

/** 게시판 삭제 API 호출 */
async function deleteBoard() {
  try {
    // 백엔드: DELETE /api/boards/{boardId}
    await api.delete(`/boards/${boardId.value}`)
    alert('게시판이 삭제되었습니다.')
    router.push('/')
  } catch (err) {
    console.error('게시판 삭제 실패', err)
    alert(err.response?.data?.message || '게시판 삭제 실패')
  }
}

/** * 관리자 권한 신청 API 호출 
 * 변경사항: 경로가 /board-manager-requests에서 /boards로 통합됨
 */
async function applyForBoardManager() {
  try {
    // 백엔드: POST /api/boards/{boardId}/apply
    const res = await api.post(`/boards/${boardId.value}/apply`)
    
    // 만약 관리자가 없어서 즉시 승인(APPROVED)된 경우
    if (res.data.status === 'APPROVED') {
      alert('관리자가 공석이기 때문에 즉시 관리자로 임명되었습니다!')
      // 변경된 관리자 정보를 반영하기 위해 게시판 정보 재조회
      await boardStore.fetchBoardDetails(String(boardId.value))
    } else {
      alert('권한 위임 신청이 접수되었습니다. 기존 관리자의 승인을 기다려주세요.')
    }
  } catch (err) {
    console.error('권한 위임 신청 실패', err)
    alert(err.response?.data?.message || '권한 위임 신청 실패')
  }
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

/** 삭제 확인 프롬프트 */
function confirmDeleteBoard() {
  if (!confirm('정말 이 갈드컵을 삭제하시겠습니까?')) return
  const input = prompt(`보안을 위해 갈드컵 주제를 똑같이 입력하세요.\n입력 예시: ${board.value?.topic}`)
  if (input !== board.value?.topic) {
    alert('입력한 주제가 일치하지 않습니다. 삭제가 취소되었습니다.')
    return
  }
  deleteBoard()
}
</script>