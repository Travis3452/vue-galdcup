<template>
  <div class="min-h-screen py-10 flex justify-center bg-slate-100">
    <div 
      class="w-[95%] max-w-7xl bg-white border border-slate-200 shadow-xl flex flex-col overflow-hidden rounded-[2.5rem]"
    >
      <BoardInfo 
        v-if="!$route.meta.noLayout" 
        class="!mb-0 !rounded-none !shadow-none !border-0" 
      />

      <div v-if="!$route.meta.noLayout" class="bg-slate-50 border-t border-b border-slate-200 px-6 py-2 flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span class="text-slate-400 font-bold flex-shrink-0 mr-2">최근 본 갈드컵:</span>
          
          <div v-if="recentStore.recentBoards.length === 0" class="text-slate-400 italic">
            방문 기록이 없습니다.
          </div>

          <div 
            v-for="board in recentStore.recentBoards" 
            :key="board.id"
            class="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 gap-2 flex-shrink-0 hover:border-indigo-300 transition-colors"
          >
            <router-link :to="`/boards/${board.id}`" class="text-slate-700 font-medium hover:text-indigo-600">
              {{ board.topic }}
            </router-link>
            <button 
              @click.prevent="recentStore.removeBoard(board.id)"
              class="text-slate-400 hover:text-red-500 transition-colors font-bold px-1"
            >
              ×
            </button>
          </div>
        </div>

        <button 
          v-if="recentStore.recentBoards.length > 0"
          @click="recentStore.clearHistory"
          class="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 font-bold text-xs underline underline-offset-2"
        >
          전체 삭제
        </button>
      </div>

      <div v-if="!$route.meta.noLayout" class="w-full border-t-4 border-slate-100 relative z-20"></div>

      <router-view :key="$route.fullPath" class="!rounded-none !shadow-none !border-0" />
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import BoardInfo from '@/views/board/BoardInfoView.vue'
import { useRecentStore } from '@/stores/recent'
import { useBoardStore } from '@/stores/board'

const route = useRoute()
const recentStore = useRecentStore()
const boardStore = useBoardStore()

const boardId = computed(() => route.params.boardId)

/**
 * 🛠️ API 호출 로직
 */
const loadBoardData = async (id) => {
  if (!id) return
  try {
    // 두 API를 동시에 호출하여 로딩 최적화
    await Promise.all([
      boardStore.fetchBoardDetails(id),
      boardStore.fetchActiveVoteSession(id)
    ])
  } catch (err) {
    console.error('데이터 갱신 실패:', err)
  }
}

// URL의 boardId가 바뀔 때마다 통합 데이터 로드
watch(boardId, (newId) => {
  if (newId) {
    loadBoardData(newId)
  }
}, { immediate: true })

/**
 * 통합 API 결과로 currentBoard가 업데이트되면 자동으로 최근 목록에 추가됩니다.
 */
watch(() => boardStore.currentBoard, (newBoard) => {
  if (newBoard && newBoard.id && newBoard.topic) {
    recentStore.addBoard({
      id: newBoard.id,
      topic: newBoard.topic
    })
  }
}, { immediate: true, deep: true })

onMounted(() => {
})
</script>