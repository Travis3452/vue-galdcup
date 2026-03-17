<template>
  <div class="px-6 py-8 space-y-8 min-h-[600px] bg-white">
    <div class="flex items-center justify-between border-b border-slate-100 pb-6">
      <div class="flex items-center gap-3">
        <span class="text-3xl">📜</span>
        <h3 class="text-2xl font-black text-slate-800 tracking-tight">지난 투표 결과</h3>
      </div>
      <router-link 
        :to="`/boards/${boardId}`" 
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
      >
        ← 돌아가기
      </router-link>
    </div>

    <div v-if="loading" class="py-32 text-center">
      <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-400 font-bold">기록을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="historyList.length === 0" class="py-32 text-center space-y-4">
      <div class="text-6xl opacity-20">📂</div>
      <p class="text-slate-400 font-bold text-lg">아직 종료된 투표 기록이 없습니다.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-8">
      <div 
        v-for="session in historyList" 
        :key="session.id" 
        class="group bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-2 gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md uppercase tracking-widest">진행 기간</span>
            </div>
            <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
              <span class="text-slate-700">{{ formatDateTime(session.startTime) }}</span>
              <span class="text-slate-300">~</span>
              <span class="text-slate-700">{{ formatDateTime(session.endTime) }}</span>
            </div>
          </div>
          <div class="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 text-right">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Participants</span>
            <span class="text-lg font-black text-slate-800">{{ getTotalVotes(session.options) }}명 참여</span>
          </div>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(opt, idx) in getVisibleOptions(session)" 
            :key="idx"
            class="relative flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-500"
            :class="idx === 0 ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-slate-50'"
          >
            <div class="w-10 shrink-0 text-center">
              <span v-if="idx === 0" class="text-2xl animate-bounce-slow block">👑</span>
              <span v-else class="text-sm font-black text-slate-300">#{{ idx + 1 }}</span>
            </div>

            <img 
              :src="opt.imageUrl || 'https://via.placeholder.com/150'" 
              class="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
            />

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-end mb-2">
                <span class="font-black text-slate-700 text-base truncate">{{ opt.label }}</span>
                <span class="text-sm font-black" :class="idx === 0 ? 'text-indigo-600' : 'text-slate-400'">
                  {{ opt.count.toLocaleString() }}표 ({{ getPercentage(opt.count, session.options) }}%)
                </span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'"
                  :style="{ width: getPercentage(opt.count, session.options) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="session.options.length > 2" class="mt-6 border-t border-dashed border-slate-100 pt-6 text-center">
          <button 
            @click="toggleSession(session.id)"
            class="px-6 py-2 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all flex items-center justify-center gap-2 mx-auto"
          >
            {{ isExpanded(session.id) ? '상세 결과 접기' : `외 ${session.options.length - 2}개 항목 결과 더보기` }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="{'rotate-180': isExpanded(session.id)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 pt-16 pb-8">
      <button 
        @click="fetchHistory(currentPage - 1)"
        :disabled="currentPage === 0"
        class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        v-for="p in totalPages" 
        :key="p"
        @click="fetchHistory(p - 1)"
        class="w-12 h-12 rounded-2xl font-black text-sm transition-all"
        :class="currentPage === p - 1 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' 
          : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'"
      >
        {{ p }}
      </button>

      <button 
        @click="fetchHistory(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'

const route = useRoute()
const boardId = route.params.boardId

// 상태 관리
const historyList = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const expandedSessionIds = ref(new Set()) // 아코디언 상태

// [1] 데이터 페칭
const fetchHistory = async (page = 0) => {
  // 범위 밖의 페이지 요청 방지
  if (page < 0 || (totalPages.value > 0 && page >= totalPages.value)) return
  
  loading.value = true
  try {
    const res = await api.get(`/boards/${boardId}/vote-session/history`, {
      params: { 
        page: page, 
        size: 5, // 페이지당 5개씩 보기 (조절 가능)
        sort: 'endTime,desc' 
      }
    })
    
    // Spring Data Page 객체 구조 대응
    historyList.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
    
    // 페이지 이동 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    console.error('투표 히스토리 로드 실패:', err)
  } finally {
    loading.value = false
  }
}

// [2] 아코디언 로직
const toggleSession = (id) => {
  if (expandedSessionIds.value.has(id)) {
    expandedSessionIds.value.delete(id)
  } else {
    expandedSessionIds.value.add(id)
  }
}
const isExpanded = (id) => expandedSessionIds.value.has(id)

// [3] 옵션 가공 (정렬 및 아코디언 필터링)
const getVisibleOptions = (session) => {
  // 득표순 정렬
  const sorted = [...session.options].sort((a, b) => b.count - a.count)
  // 확장 상태면 모두, 아니면 상위 2개만
  return isExpanded(session.id) ? sorted : sorted.slice(0, 2)
}

// [4] 유틸리티 함수들
const getPercentage = (count, options) => {
  const total = options.reduce((acc, cur) => acc + cur.count, 0)
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

const getTotalVotes = (options) => {
  return options.reduce((acc, cur) => acc + cur.count, 0).toLocaleString()
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace(/\. /g, '.').replace(/\.$/, '')
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
/* 왕관 애니메이션 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce 2s infinite cubic-bezier(0.45, 0, 0.55, 1);
}

/* 리스트 전환 애니메이션 */
.transition-all {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>