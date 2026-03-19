<template>
  <div class="min-h-screen py-0 md:py-10 flex justify-center bg-slate-100 font-sans">
    <div 
      class="w-full md:w-[95%] max-w-7xl bg-white border-0 md:border border-slate-200 shadow-none md:shadow-xl flex flex-col overflow-hidden rounded-none md:rounded-[2.5rem]"
    >
      <BoardInfo 
        v-if="!$route.meta.noLayout" 
        class="!mb-0 !rounded-none !shadow-none !border-0" 
      />

      <div v-if="!$route.meta.noLayout" class="bg-slate-50 border-t border-b border-slate-200 transition-all duration-300">
        
        <div class="px-4 md:px-6 py-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-tighter shrink-0">최근 방문</span>
            <button 
              v-if="recentStore.recentBoards.length > 0"
              @click="isRecentExpanded = !isRecentExpanded"
              class="flex items-center gap-1 text-indigo-500 font-bold text-[10px] md:text-xs hover:text-indigo-700 transition"
            >
              {{ isRecentExpanded ? '접기 ▲' : '펼쳐보기 ▼' }}
            </button>
          </div>

          <button 
            v-if="recentStore.recentBoards.length > 0"
            @click="recentStore.clearHistory"
            class="text-slate-400 hover:text-red-500 font-bold text-[10px] md:text-xs underline underline-offset-2 transition"
          >
            전체 삭제
          </button>
        </div>

        <div class="px-4 md:px-6 pb-3">
          <div v-if="recentStore.recentBoards.length === 0" class="text-slate-400 italic text-xs py-1">
            방문 기록이 없습니다.
          </div>

          <div 
            v-else
            :class="[
              'flex transition-all duration-300 gap-2',
              isRecentExpanded ? 'flex-wrap' : 'overflow-x-auto flex-nowrap scrollbar-hide py-1'
            ]"
          >
            <div 
              v-for="board in recentStore.recentBoards" 
              :key="board.id"
              class="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 gap-2 shrink-0 hover:border-indigo-300 transition shadow-sm"
            >
              <router-link 
                :to="`/boards/${board.id}`" 
                class="text-slate-700 font-bold text-xs md:text-sm hover:text-indigo-600 truncate max-w-[120px] md:max-w-none"
              >
                {{ board.topic }}
              </router-link>
              <button 
                @click.prevent="recentStore.removeBoard(board.id)"
                class="text-slate-300 hover:text-red-500 transition-colors font-black text-sm leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!$route.meta.noLayout" class="w-full border-t-4 border-slate-100 relative z-20"></div>

      <router-view :key="$route.fullPath" class="!rounded-none !shadow-none !border-0 flex-1" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import BoardInfo from '@/views/board/BoardInfoView.vue'
import { useRecentStore } from '@/stores/recent'
import { useBoardStore } from '@/stores/board'

const route = useRoute()
const recentStore = useRecentStore()
const boardStore = useBoardStore()

// ✨ 최근 본 갈드컵 확장 여부 상태
const isRecentExpanded = ref(false)

const boardId = computed(() => route.params.boardId)

/**
 * 🛠️ API 호출 로직 (게시판 상세 정보와 투표 정보를 동시에 로드)
 */
const loadBoardData = async (id) => {
  if (!id) return
  try {
    await Promise.all([
      boardStore.fetchBoardDetails(id),
      boardStore.fetchActiveVoteSession(id)
    ])
  } catch (err) {
    console.error('데이터 갱신 실패:', err)
  }
}

// URL의 boardId가 바뀔 때마다 데이터 로드 및 확장창 닫기
watch(boardId, (newId) => {
  if (newId) {
    loadBoardData(newId)
    isRecentExpanded.value = false // 게시판 이동 시 히스토리 창은 다시 접어줌 (UX 고려)
  }
}, { immediate: true })

/**
 * 게시판 정보 로드 완료 시 최근 본 목록에 자동 추가
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
  // 필요 시 초기화 로직
})
</script>

<style scoped>
/* 가로 스크롤 시 스크롤바 숨기기 (깔끔한 UI용) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 확장 애니메이션을 위한 스타일 (선택사항) */
.flex-wrap {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>