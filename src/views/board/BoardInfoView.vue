<template>
  <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 mb-8 relative overflow-hidden border border-indigo-50">
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

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
        <div v-else-if="boardStore.isBoardManager" class="flex gap-2 shrink-0">
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
      :boardId="boardId"
      :boardPolicy="boardPolicy"
      @close="showPolicyModal = false"
      @updated="fetchBoardPolicy"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import BoardPolicyModal from '@/views/board/BoardPolicyView.vue'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const boardStore = useBoardStore()

const boardId = route.params.boardId

const board = computed(() => boardStore.currentBoard)
const boardPolicy = ref(null)
const showPolicyModal = ref(false)

// ✨ 로딩 상태 변수 추가 (기본값 true)
const isLoading = ref(true)

async function fetchBoardPolicy() {
  try {
    const res = await api.get(`/boards/${boardId}/policy`)
    boardPolicy.value = res.data

    const currentUserId = store.id
    boardStore.isBoardManager = boardPolicy.value?.boardManager?.id === currentUserId
    boardStore.isSubManager = boardPolicy.value?.subManagers?.some(sm => sm.id === currentUserId) || false
  } catch {
    boardStore.isBoardManager = false
    boardStore.isSubManager = false
  }
}

// ... 나머지 메서드(deleteBoard, applyForBoardManager 등)는 기존과 동일 ...
async function deleteBoard() {
  try {
    await api.delete(`/boards/${boardId}`)
    router.push('/')
  } catch (err) {
    console.error('게시판 삭제 실패', err)
    alert(err.response?.data?.message || '게시판 삭제 실패')
  }
}

async function applyForBoardManager() {
  try {
    await api.post(`/board-manager-requests/${boardId}/apply`)
    alert('권한 위임 신청이 접수되었습니다.')
  } catch (err) {
    console.error('권한 위임 신청 실패', err)
    alert(err.response?.data?.message || '권한 위임 신청 실패')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function confirmDeleteBoard() {
  if (!confirm('정말 이 갈드컵을 삭제하시겠습니까?')) return

  const input = prompt(`삭제하려면 갈드컵 주제를 똑같이 입력하세요.\n ex) ${board.value?.topic}`)
  if (input !== board.value?.topic) {
    alert('입력한 주제가 일치하지 않습니다. 삭제가 취소되었습니다.')
    return
  }
  deleteBoard()
}

onMounted(async () => {
  isLoading.value = true // 시작할 때 로딩 ON

  try {
    // 만약 현재 스토어에 있는 보드 정보가 없거나, 다른 게시판 정보라면 새로 가져옴
    if (!boardStore.currentBoard || String(boardStore.currentBoard.id) !== String(boardId)) {
      await boardStore.fetchBoard(boardId)
    }
    await fetchBoardPolicy()
  } catch (err) {
    console.error('데이터 로드 실패:', err)
  } finally {
    // 모든 통신이 끝나면 무조건 로딩 OFF
    isLoading.value = false
  }
})
</script>