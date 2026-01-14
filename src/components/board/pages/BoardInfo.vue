<template>
  <div class="border-b-2 border-gray-200 px-6 py-6 bg-indigo-50 rounded-t-lg">
    <h1 class="text-3xl font-extrabold text-black flex items-center gap-2 justify-center">
      <span class="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">G</span>
      <span>{{ board?.topic }}</span>
    </h1>

    <p class="text-base text-gray-700 mt-2 italic text-center">{{ board?.description }}</p>

    <!-- 상태 + 생성일 -->
    <div class="text-sm text-gray-500 mt-2 text-center">
      상태:
      <span :class="board?.status === 'OPEN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
        {{ board?.status }}
      </span>
      · 생성일: {{ formatDate(board?.createdAt) }}
    </div>

    <!-- 관리자 표시 -->
    <div v-if="boardPolicy?.boardManager" class="text-sm text-gray-700 mt-2 text-center">
      관리자:
      <span class="font-semibold text-indigo-700">{{ boardPolicy.boardManager.nickname }}</span>
      <span class="ml-2 text-xs text-gray-500">({{ boardPolicy.boardManager.role }})</span>
    </div>

    <!-- 서브 매니저 표시 -->
    <div class="text-sm text-gray-700 mt-2 text-center">
      서브 매니저:
      <template v-if="boardPolicy?.subManagers?.length">
        <span v-for="(sm, idx) in boardPolicy.subManagers" :key="sm.id" class="font-semibold text-indigo-700">
          {{ sm.nickname }}<span v-if="idx < boardPolicy.subManagers.length - 1">, </span>
        </span>
      </template>
      <template v-else>없음</template>
    </div>

    <!-- 권한 위임 신청 / 정책 변경 / 삭제 버튼 -->
    <div class="flex justify-center gap-4 mt-6">
      <button
        v-if="!boardPolicy?.boardManager"
        @click="applyForBoardManager"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold"
      >
        권한 위임 신청
      </button>

      <template v-if="boardPolicy?.boardManager && currentUserId === boardPolicy.boardManager.id">
        <button
          @click="openPolicyModal"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm font-semibold"
        >
          정책 변경
        </button>

        <button
          @click="confirmDeleteBoard"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
        >
          게시판 삭제
        </button>
      </template>
    </div>

    <!-- 정책 변경 모달 -->
    <div v-if="showPolicyModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-30" @click="closePolicyModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-[90%] max-w-xl p-6 z-60">
        <h3 class="text-lg font-semibold mb-4">게시판 정책 변경</h3>

        <div class="mb-3">
          <label class="block text-sm text-gray-700 mb-1">서브 매니저 추가 (닉네임)</label>
          <input v-model="newSubManager" class="w-full border px-3 py-2 rounded" placeholder="닉네임 입력" />
        </div>

        <div class="flex justify-end gap-2">
          <button @click="closePolicyModal" class="px-3 py-1 border rounded text-sm">취소</button>
          <button @click="handleAddSubManager" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">추가</button>
        </div>

        <div v-if="boardPolicy?.subManagers?.length" class="mt-4">
          <h4 class="text-sm font-semibold mb-2">현재 서브 매니저</h4>
          <ul class="text-sm text-gray-700 space-y-1">
            <li v-for="sm in boardPolicy.subManagers" :key="sm.id" class="flex justify-between items-center">
              <span>{{ sm.nickname }}</span>
              <button @click="handleRemoveSubManager(sm.nickname)" class="text-red-600 text-sm">삭제</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import useBoardInfo from '@/components/board/scripts/BoardInfo.js'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const boardId = route.params.boardId

const {
  board,
  boardPolicy,
  fetchBoard,
  fetchBoardPolicy,
  deleteBoard,
  applyForBoardManager,
  addSubManager,
  removeSubManager,
  formatDate
} = useBoardInfo(boardId)

const currentUserId = store.id

const showPolicyModal = ref(false)
const newSubManager = ref('')

onMounted(async () => {
  await fetchBoard()
  await fetchBoardPolicy()
})

function openPolicyModal() {
  showPolicyModal.value = true
}

function closePolicyModal() {
  showPolicyModal.value = false
  newSubManager.value = ''
}

async function handleAddSubManager() {
  if (!newSubManager.value) {
    alert('닉네임을 입력하세요.')
    return
  }
  try {
    await addSubManager(newSubManager.value)
    await fetchBoardPolicy()
    newSubManager.value = ''
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 추가 중 오류가 발생했습니다.')
  }
}

async function handleRemoveSubManager(nickname) {
  if (!confirm(`${nickname} 을(를) 서브 매니저에서 삭제하시겠습니까?`)) return
  try {
    await removeSubManager(nickname)
    await fetchBoardPolicy()
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 삭제 중 오류가 발생했습니다.')
  }
}

function confirmDeleteBoard() {
  if (!confirm('정말 이 게시판을 삭제하시겠습니까?')) return
  deleteBoard()
}
</script>

<style scoped>
.z-60 { z-index: 60; }
</style>