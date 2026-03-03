<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 font-sans">
    <div class="max-w-7xl mx-auto space-y-16">
      
      <section class="relative rounded-[2.5rem] shadow-2xl overflow-hidden bg-indigo-900 flex flex-col md:flex-row items-stretch border border-indigo-800">
        <div class="w-full md:w-3/5 p-10 md:p-16 lg:p-20 text-center md:text-left relative z-10 flex flex-col justify-center">
          
          <div class="inline-flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-black text-sm uppercase tracking-widest w-max mb-6 mx-auto md:mx-0">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Debate
          </div>

          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight break-keep">
            세상에서 제일 재밌는<br />남의 싸움 구경
          </h2>
          <p class="text-indigo-200 text-lg md:text-xl leading-relaxed font-medium break-keep">
            짜장면 vs 짬뽕부터 롤드컵 우승자 예측까지!<br class="hidden md:block" />
            Galdcup은 세상의 모든 호불호와 논쟁거리를 투표로 결판내는 곳입니다.<br class="hidden lg:block" />
            당신의 확고한 취향과 논리로 반대파를 설득해 보세요.
            <span class="font-bold text-yellow-400 mt-6 block text-xl">과연 대중의 선택은 어느 쪽을 향할 것인가?</span>
          </p>
        </div>
        <div class="w-full md:w-2/5 h-64 md:h-auto relative">
          <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-indigo-900 via-indigo-900/40 to-transparent z-10"></div>
          <img
            src="/images/debate-banner.jpg"
            alt="갈드컵 배너"
            class="w-full h-full object-cover opacity-80"
          />
        </div>
      </section>

      <section class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100">
        <div class="flex justify-between items-center mb-10 border-b-2 border-slate-100 pb-6">
          <h3 class="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <span class="text-yellow-500 text-3xl">⭐</span> 인기 갈드컵 TOP 100
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div
            v-for="(board, index) in pagedPopularBoards"
            :key="board.id"
            @click="goToBoard(board.id)"
            class="group flex items-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span class="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-white text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm border border-slate-100 group-hover:border-transparent">
              {{ index + 1 + popularPage * popularPageSize }}
            </span>
            <span class="ml-5 text-slate-700 font-bold text-lg truncate group-hover:text-indigo-700 transition-colors">
              {{ board.topic }}
            </span>
          </div>
        </div>

        <div v-if="popularTotalPages > 1" class="flex justify-center items-center gap-3 mt-10">
          <button
            :disabled="popularPage === 0"
            @click="prevPopularPage"
            class="px-5 py-2.5 rounded-xl font-bold transition shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            이전
          </button>
          <span class="px-4 py-2.5 font-bold text-indigo-600 bg-indigo-50 rounded-xl">
            {{ popularPage + 1 }} / {{ Math.max(popularTotalPages, 1) }}
          </span>
          <button
            :disabled="popularPage >= popularTotalPages - 1"
            @click="nextPopularPage"
            class="px-5 py-2.5 rounded-xl font-bold transition shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </section>

      <section class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100 relative overflow-hidden">
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 border-b-2 border-slate-100 pb-6 gap-6">
            <h3 class="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <span class="text-indigo-600 text-3xl">🆕</span> 최신 갈드컵
            </h3>
            
            <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto justify-end">
              <router-link
                to="/boards/create"
                class="shrink-0 flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
              >
                + 갈드컵 열기
              </router-link>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="board in boards"
              :key="board.id"
              @click="goToBoard(board.id)"
              class="group relative bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
              
              <h4 class="text-xl font-bold text-slate-800 mb-6 break-keep group-hover:text-indigo-600 transition-colors relative z-10 leading-snug">
                {{ board.topic }}
              </h4>
              
              <div class="flex items-center justify-between text-sm font-bold text-slate-400 relative z-10">
                <span>📅 {{ formatDate(board.createdAt) }}</span>
                <span class="text-indigo-500 group-hover:translate-x-1 transition-transform">입장 ➔</span>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-12">
            <button
              :disabled="page === 0"
              @click="prevPage"
              class="px-5 py-2.5 rounded-xl font-bold transition shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              이전
            </button>
            <span class="px-4 py-2.5 font-bold text-indigo-600 bg-indigo-50 rounded-xl">
              {{ page + 1 }} / {{ totalPages }}
            </span>
            <button
              :disabled="page >= totalPages - 1"
              @click="nextPage"
              class="px-5 py-2.5 rounded-xl font-bold transition shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'

// 상태 변수
const boards = ref([])
const popularBoards = ref([])
const page = ref(0)
const size = 12 // 화면을 예쁘게 채우기 위해 12(3의 배수)로 조정
const totalPages = ref(1)
const router = useRouter()

const popularPage = ref(0)
const popularPageSize = 10

// Computed
const popularTotalPages = computed(() =>
  Math.max(Math.ceil(popularBoards.value.length / popularPageSize), 1)
)

const pagedPopularBoards = computed(() => {
  const start = popularPage.value * popularPageSize
  const end = start + popularPageSize
  return popularBoards.value.slice(start, end)
})

// API 호출 함수
async function fetchBoards() {
  try {
    const res = await api.get(`/boards`, { params: { page: page.value, size } })
    boards.value = res.data.content
    totalPages.value = Math.max(res.data.totalPages, 1)
  } catch (err) {
    console.error('API 호출 실패:', err)
  }
}

async function fetchPopularBoards() {
  try {
    const res = await api.get(`/boards/popular`)
    popularBoards.value = res.data
  } catch (err) {
    console.error('인기 게시판 API 호출 실패:', err)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const year = String(date.getFullYear()).slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function goToBoard(boardId) {
  router.push(`/boards/${boardId}`)
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++
    fetchBoards()
  }
}

function prevPage() {
  if (page.value > 0) {
    page.value--
    fetchBoards()
  }
}

function nextPopularPage() {
  if (popularPage.value < popularTotalPages.value - 1) {
    popularPage.value++
  }
}

function prevPopularPage() {
  if (popularPage.value > 0) {
    popularPage.value--
  }
}

onMounted(() => {
  fetchBoards()
  fetchPopularBoards()
})
</script>