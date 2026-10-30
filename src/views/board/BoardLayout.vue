<template>
  <div class="page-container board-page">
    <div
      class="min-w-0"
    >
      <AsyncState v-if="boardStore.error" :error="boardStore.error" @retry="loadBoardData(boardId)" />
      <BoardInfo
        v-if="!$route.meta.noLayout"
        class="mb-4"
      />

      <div v-if="!$route.meta.noLayout" class="recent-visits" :class="{ 'recent-visits-compact': $route.name !== 'Board', 'recent-open': isRecentExpanded }">

        <div class="recent-visits-header">
          <div class="flex items-center gap-2">
            <span class="recent-label">최근 방문</span>
            <button
              v-if="recentStore.recentBoards.length > 0"
              @click="isRecentExpanded = !isRecentExpanded" :aria-expanded="isRecentExpanded" aria-controls="recent-board-list"
              class="recent-toggle"
            >
              {{ isRecentExpanded ? '접기 ▲' : '펼쳐보기 ▼' }}
            </button>
          </div>

          <button
            v-if="recentStore.recentBoards.length > 0"
            @click="recentStore.clearHistory"
            class="recent-clear"
          >
            전체 삭제
          </button>
        </div>

        <div id="recent-board-list" class="recent-board-list">
          <div v-if="recentStore.recentBoards.length === 0" class="recent-empty">
            방문 기록이 없습니다.
          </div>

          <div
            v-else
            :class="[
              'flex transition-all duration-300 gap-1.5',
              isRecentExpanded ? 'flex-wrap' : 'overflow-x-auto flex-nowrap scrollbar-hide'
            ]"
          >
            <div
              v-for="board in recentStore.recentBoards"
              :key="board.id"
              class="recent-board-item"
            >
              <router-link
                :to="`/boards/${board.id}`"
                class="recent-board-link"
              >
                {{ board.topic }}
              </router-link>
              <button
                :aria-label="`${board.topic} 방문 기록 삭제`" @click.prevent="recentStore.removeBoard(board.id)"
                class="recent-remove"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>



      <router-view :key="$route.path" v-if="!boardStore.error" class="min-w-0" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import BoardInfo from '@/views/board/BoardInfoView.vue'
import { useRecentStore } from '@/stores/recent'
import { useBoardStore } from '@/stores/board'
import AsyncState from '@/components/ui/AsyncState.vue'

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
  } catch { /* 오류는 store와 공통 상태 UI에서 표시한다. */ }
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
}, { immediate: true })

onUnmounted(() => boardStore.clearBoardDetails())
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
.recent-visits { margin-bottom:24px; border-bottom:1px solid var(--ui-border); background:transparent; font-size:12px; }
.recent-visits-header { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:5px 10px; }
.recent-label { flex:0 0 auto; color:var(--ui-text-muted); font-size:11px; }
.recent-toggle { display:flex; align-items:center; gap:3px; min-height:32px; color:var(--ui-primary); font-size:11px; font-weight:650; }
.recent-toggle:hover { color:var(--ui-primary); }
.recent-clear { min-height:32px; padding-inline:4px; color:var(--ui-text-muted); font-size:11px; font-weight:650; text-decoration:underline; text-underline-offset:2px; }
.recent-clear:hover { color:var(--ui-danger); }
.recent-board-list { padding:0 8px 8px; }
.recent-empty { padding-block:2px; color:var(--ui-text-muted); font-size:11px; font-style:italic; }
.recent-board-item { display:flex; flex:0 0 auto; align-items:center; gap:4px; padding:2px 5px 2px 9px; border:1px solid var(--ui-border); border-radius:6px; background:var(--ui-surface); }
.recent-board-item:hover { border-color:var(--ui-primary-border); }
.recent-board-link { display:block; min-height:28px; max-width:112px; overflow:hidden; color:var(--ui-secondary); font-size:11px; line-height:28px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.recent-board-link:hover { color:var(--ui-primary); }
.recent-remove { display:grid; place-items:center; min-width:28px; min-height:28px; color:var(--ui-text-muted); border-radius:50%; font-size:14px; }
.recent-remove:hover { color:var(--ui-danger); background:var(--ui-danger-soft); }
.recent-visits-compact { margin-bottom:16px; }
.recent-visits-compact:not(.recent-open) #recent-board-list { display:none; }
</style>
