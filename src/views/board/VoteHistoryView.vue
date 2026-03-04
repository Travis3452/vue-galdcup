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

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div 
        v-for="session in historyList" 
        :key="session.id" 
        class="group bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
      >
        <div class="space-y-6">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>📅 종료 일시:</span>
            <span>{{ formatDate(session.endTime) }}</span>
          </div>
          
          <div class="flex items-center justify-between gap-4 py-6 bg-slate-50 rounded-[2rem] px-6">
            <template v-for="(opt, idx) in session.options" :key="idx">
              <div class="flex flex-col items-center flex-1 min-w-0">
                <div class="mb-3">
                  <img 
                    :src="opt.imageUrl || 'https://via.placeholder.com/150'" 
                    class="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105" 
                  />
                </div>

                <div class="font-black text-slate-800 text-sm mb-1 flex items-center justify-center gap-1.5 w-full">
                  <span v-if="isWinner(session.options, idx)" class="text-lg shrink-0 animate-bounce-slow">👑</span>
                  <span class="truncate">{{ opt.label }}</span>
                </div>

                <div class="px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                  <span class="text-indigo-600 font-black text-base">{{ opt.count.toLocaleString() }}표</span>
                </div>
              </div>

              <div v-if="idx === 0" class="text-slate-300 font-black italic text-xl">VS</div>
            </template>
          </div>

          <div class="text-center">
            <span class="text-xs font-bold text-slate-400">총 참여자: {{ getTotalVotes(session.options) }}명</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 pt-12 pb-8">
      <button 
        @click="fetchHistory(currentPage - 1)"
        :disabled="currentPage === 0"
        class="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex gap-2">
        <button 
          v-for="p in totalPages" :key="p"
          @click="fetchHistory(p - 1)"
          class="w-10 h-10 rounded-xl font-bold transition-all"
          :class="currentPage === p - 1 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' 
            : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'"
        >
          {{ p }}
        </button>
      </div>

      <button 
        @click="fetchHistory(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition"
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

const historyList = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)

// 히스토리 데이터 페칭 (Spring Pageable 구조 대응)
const fetchHistory = async (page = 0) => {
  if (page < 0 || (totalPages.value > 0 && page >= totalPages.value)) return
  
  loading.value = true
  try {
    const res = await api.get(`/boards/${boardId}/vote-session/history`, {
      params: { 
        page: page, 
        size: 10,
        sort: 'endTime,desc' 
      }
    })
    
    // Spring Data Page 객체에서 데이터 추출
    historyList.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (err) {
    console.error('과거 투표 기록 로드 실패:', err)
  } finally {
    loading.value = false
  }
}

// 승자 판별 (표 수가 더 높은 옵션 반환)
const isWinner = (options, idx) => {
  const currentCount = options[idx].count
  if (currentCount === 0) return false
  // 다른 모든 옵션보다 표 수가 많을 때만 승자로 간주
  return options.every((opt, i) => i === idx || currentCount > opt.count)
}

// 전체 투표 수 합계 계산
const getTotalVotes = (options) => {
  return options.reduce((acc, cur) => acc + cur.count, 0).toLocaleString()
}

// 날짜 포맷팅
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
/* 왕관 애니메이션 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce-slow {
  animation: bounce 2s infinite;
}
</style>