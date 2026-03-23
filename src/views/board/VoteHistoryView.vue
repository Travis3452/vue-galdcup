<template>
  <div class="px-4 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8 min-h-[600px] bg-white font-sans">
    
    <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between border-b border-slate-100 pb-4 md:pb-6 gap-4">
      <div class="flex items-center gap-2 md:gap-3">
        <span class="text-2xl md:text-3xl">📜</span>
        <h3 class="text-xl md:text-2xl font-black text-slate-800 tracking-tight">지난 투표 결과</h3>
      </div>
      <router-link 
        :to="`/boards/${boardId}`" 
        class="px-3 py-1.5 md:px-4 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs md:text-sm transition-colors shrink-0"
      >
        ← 돌아가기
      </router-link>
    </div>

    <div v-if="loading" class="py-24 md:py-32 text-center">
      <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-400 font-bold text-sm md:text-base">기록을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="historyList.length === 0" class="py-24 md:py-32 text-center space-y-4">
      <div class="text-5xl md:text-6xl opacity-20">📂</div>
      <p class="text-slate-400 font-bold text-base md:text-lg">종료된 투표 기록이 없습니다.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:gap-8">
      <div 
        v-for="session in historyList" 
        :key="session.id" 
        class="group bg-white border border-slate-200 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
      >
        
        <div class="mb-4 md:mb-6 px-1 md:px-2 border-b border-slate-100 pb-4 md:pb-6">
          <h4 class="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-snug break-keep mb-2">
            {{ session.topic }}
          </h4>
          <p v-if="session.description" class="text-xs md:text-sm text-slate-500 font-medium line-clamp-2 md:line-clamp-none bg-slate-50 px-3 py-2 rounded-lg inline-block border border-slate-100">
            <span class="text-indigo-400 mr-1">💡</span>{{ session.description }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 px-1 md:px-2 gap-4">
          <div class="space-y-1.5 w-full sm:w-auto">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black rounded-md uppercase tracking-widest">진행 기간</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm font-bold text-slate-500">
              <span class="text-slate-700 whitespace-nowrap">{{ formatDateTime(session.startTime) }}</span>
              <span class="text-slate-300">~</span>
              <span class="text-slate-700 whitespace-nowrap">{{ formatDateTime(session.endTime) }}</span>
            </div>
          </div>
          
          <div class="bg-slate-50 px-4 py-2 md:px-5 md:py-3 rounded-2xl border border-slate-100 text-left sm:text-right w-full sm:w-auto">
            <span class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Participants</span>
            <span class="text-base md:text-lg font-black text-slate-800">{{ getTotalVotes(session.options) }}명 참여</span>
          </div>
        </div>

        <div class="space-y-2 md:space-y-3">
          <div 
            v-for="(opt, idx) in getVisibleOptions(session)" 
            :key="idx"
            class="relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border transition-all duration-500"
            :class="idx === 0 ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-slate-50 hover:border-slate-200'"
          >
            <div class="w-8 md:w-10 shrink-0 text-center">
              <span v-if="idx === 0" class="text-xl md:text-2xl animate-bounce-slow block">👑</span>
              <span v-else class="text-xs md:text-sm font-black text-slate-300">#{{ idx + 1 }}</span>
            </div>

            <img 
              :src="opt.imageUrl || 'https://via.placeholder.com/150'" 
              class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
            />

            <div class="flex-1 min-w-0">
              <div class="flex flex-col xs:flex-row justify-between items-start xs:items-end mb-1 md:mb-2 gap-0.5">
                <span class="font-black text-slate-700 text-sm md:text-base break-keep w-full pr-2 line-clamp-2 md:line-clamp-1" :title="opt.label">
                  {{ opt.label }}
                </span>
                <span class="text-[10px] md:text-sm font-black shrink-0" :class="idx === 0 ? 'text-indigo-600' : 'text-slate-400'">
                  {{ opt.count.toLocaleString() }}표 ({{ getPercentage(opt.count, session.options) }}%)
                </span>
              </div>
              
              <div class="w-full h-1.5 md:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="idx === 0 ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-slate-300'"
                  :style="{ width: getPercentage(opt.count, session.options) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="session.options.length > 2" class="mt-4 md:mt-6 border-t border-dashed border-slate-100 pt-4 md:pt-6 text-center mt-auto">
          <button 
            @click="toggleSession(session.id)"
            class="px-4 py-2 md:px-6 md:py-2 text-[10px] md:text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all flex items-center justify-center gap-2 mx-auto"
          >
            {{ isExpanded(session.id) ? '상세 결과 접기' : `외 ${session.options.length - 2}개 결과 더보기` }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 md:h-4 md:w-4 transition-transform" :class="{'rotate-180': isExpanded(session.id)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-1 md:gap-2 pt-10 md:pt-16 pb-8">
      <button 
        @click="fetchHistory(currentPage - 1)"
        :disabled="currentPage === 0"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        v-for="p in visiblePages" 
        :key="p"
        @click="fetchHistory(p - 1)"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all shrink-0"
        :class="currentPage === p - 1 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105 md:scale-110' 
          : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'"
      >
        {{ p }}
      </button>

      <button 
        @click="fetchHistory(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'

const route = useRoute()
const boardId = route.params.boardId

const historyList = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const expandedSessionIds = ref(new Set())

const fetchHistory = async (page = 0) => {
  if (page < 0 || (totalPages.value > 0 && page >= totalPages.value)) return
  
  loading.value = true
  try {
    const res = await api.get(`/boards/${boardId}/vote-session/history`, {
      params: { 
        page: page, 
        size: 5,
        sort: 'endTime,desc' 
      }
    })
    
    historyList.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    console.error('투표 히스토리 로드 실패:', err)
  } finally {
    loading.value = false
  }
}

const toggleSession = (id) => {
  if (expandedSessionIds.value.has(id)) {
    expandedSessionIds.value.delete(id)
  } else {
    expandedSessionIds.value.add(id)
  }
}
const isExpanded = (id) => expandedSessionIds.value.has(id)

const getVisibleOptions = (session) => {
  const sorted = [...session.options].sort((a, b) => b.count - a.count)
  return isExpanded(session.id) ? sorted : sorted.slice(0, 2)
}

const getPercentage = (count, options) => {
  const total = options.reduce((acc, cur) => acc + cur.count, 0)
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

const getTotalVotes = (options) => {
  return options.reduce((acc, cur) => acc + cur.count, 0).toLocaleString()
}

// 모바일 가시 페이지 제어 (최대 5개 노출)
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = window.innerWidth < 768 ? 3 : 5
  let start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = Math.max(1, start); i <= end; i++) pages.push(i)
  return pages
})

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce-slow {
  animation: bounce 2s infinite cubic-bezier(0.45, 0, 0.55, 1);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>