<template>
  <div class="border-b-2 border-gray-200 px-6 py-6 bg-indigo-50 rounded-t-lg">
    <!-- 게시판 제목 -->
    <h1 class="text-3xl font-extrabold text-black flex items-center gap-2 justify-center">
      <span class="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">G</span>
      <span>{{ board?.topic }}</span>
    </h1>

    <!-- 설명 -->
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

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-4 mt-6">
      <!-- 권한 위임 신청 -->
      <button
        v-if="!boardPolicy?.boardManager"
        @click="applyForBoardManager"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold"
      >
        권한 위임 신청
      </button>

      <!-- 정책 변경 / 삭제 버튼 (관리자만) -->
      <template v-if="boardPolicy?.boardManager && currentUserId === boardPolicy.boardManager.id">
        <button
          @click="showPolicyModal = true"
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

    <!-- 정책 변경 모달 컴포넌트 -->
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
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import useBoardInfo from '@/components/board/scripts/BoardInfo.js'
import BoardPolicyModal from '@/components/board/pages/BoardPolicy.vue'

const route = useRoute()
const store = useUserStore()
const boardId = route.params.boardId

const {
  board,
  boardPolicy,
  fetchBoard,
  fetchBoardPolicy,
  deleteBoard,
  applyForBoardManager,
  formatDate
} = useBoardInfo(boardId)

const currentUserId = store.id
const showPolicyModal = ref(false)

onMounted(async () => {
  await fetchBoard()
  await fetchBoardPolicy()
})

function confirmDeleteBoard() {
  if (!confirm('정말 이 게시판을 삭제하시겠습니까?')) return
  deleteBoard()
}
</script>

<style scoped>
.z-60 { z-index: 60; }
</style>