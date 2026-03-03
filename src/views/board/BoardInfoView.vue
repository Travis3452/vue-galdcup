<template>
  <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 mb-8 relative overflow-hidden border border-indigo-50">
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

    <div class="relative z-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-black shadow-md shrink-0">G</span>
            <router-link :to="`/boards/${boardId}`" class="group">
              <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight break-keep group-hover:text-indigo-600 transition-colors">
                {{ board?.topic }}
              </h1>
            </router-link>
          </div>
          
          <div class="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm font-medium">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">👤</span>
              <span class="text-slate-400 mr-1">매니저</span>
              <span class="text-slate-800">{{ boardPolicy?.boardManager?.nickname || '없음' }}</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">📅</span>
              <span class="text-slate-400 mr-1">생성일</span>
              <span class="text-slate-800">{{ formatDate(board?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-if="boardStore.isBoardManager" class="flex gap-2 shrink-0">
          <button
            @click="showPolicyModal = true"
            class="px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition text-sm font-bold shadow-sm"
          >
            정책 변경
          </button>
          <button
            @click="confirmDeleteBoard"
            class="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-sm font-bold shadow-sm"
          >
            삭제
          </button>
        </div>
      </div>

      <div class="relative mt-6">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
        <p class="text-sm font-medium text-slate-500 leading-relaxed pl-6 py-1">
          {{ board?.description }}
        </p>
      </div>

      <div class="mt-8" v-if="!boardPolicy?.boardManager">
        <button
          @click="applyForBoardManager"
          class="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition text-base font-bold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
        >
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
import { ref, onMounted } from 'vue'
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

const board = ref(null)
const boardPolicy = ref(null)
const showPolicyModal = ref(false)

async function fetchBoard() {
  try {
    const res = await api.get(`/boards/${boardId}`)
    board.value = res.data
  } catch (err) {
    console.error('게시판 정보 로드 실패', err)
  }
}

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
  await fetchBoard()
  await fetchBoardPolicy()
})
</script>