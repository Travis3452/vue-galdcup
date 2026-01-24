<template>
  <div class="border-b-2 border-gray-200 px-6 py-6 rounded-t-lg">
    <div class="flex items-center justify-between">
      <!-- 게시판 제목 -->
      <router-link
        :to="`/boards/${boardId}`"
        class="text-3xl font-extrabold text-indigo-700 flex items-center gap-2 hover:underline"
      >
        <span class="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">G</span>
        <span>{{ board?.topic }}</span>
      </router-link>

      <!-- 정책 변경 / 삭제 버튼 -->
      <div v-if="boardStore.isBoardManager" class="flex gap-2">
        <button
          @click="showPolicyModal = true"
          class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-xs font-semibold"
        >
          정책 변경
        </button>

        <button
          @click="confirmDeleteBoard"
          class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-semibold"
        >
          삭제
        </button>
      </div>
    </div>

    <hr class="border-t-2 border-gray-300 my-4" />
    <!-- 설명 -->
    <p class="text-sm text-gray-700 italic">{{ board?.description }}</p>

    <!-- 생성일 -->
    <div class="text-xs text-gray-500 mt-3 mb-2">
      생성일: {{ formatDate(board?.createdAt) }}
    </div>

    <!-- 권한 위임 신청 버튼 -->
    <div class="flex justify-start mt-4">
      <button
        v-if="!boardPolicy?.boardManager"
        @click="applyForBoardManager"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold"
      >
        권한 위임 신청
      </button>
    </div>

    <!-- 정책 변경 모달 -->
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
import useBoardInfo from '@/components/board/scripts/BoardInfo.js'
import { useBoardStore } from '@/stores/board'
import BoardPolicyModal from '@/components/board/pages/BoardPolicy.vue'

const route = useRoute()
const boardId = route.params.boardId
const boardStore = useBoardStore()

const {
  board,
  boardPolicy,
  fetchBoard,
  fetchBoardPolicy,
  deleteBoard,
  applyForBoardManager,
  formatDate
} = useBoardInfo(boardId)

const showPolicyModal = ref(false)

onMounted(async () => {
  await fetchBoard()
  await fetchBoardPolicy()
})

function confirmDeleteBoard() {
  if (!confirm('정말 이 갈드컵을 삭제하시겠습니까?')) return

  const input = prompt(`갈드컵을 삭제하려면 갈드컵 제목을 입력하세요\n ex) ${board.value?.topic}`)
  if (input !== board.value?.topic) {11
    alert('입력한 제목이 일치하지 않습니다. 삭제가 취소되었습니다.')
    return
  }

  deleteBoard()
}

</script>