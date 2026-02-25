<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-10">
    <div class="max-w-6xl mx-auto space-y-20">
      
      <!-- 사이트 소개 -->
      <section class="rounded-2xl shadow-xl overflow-hidden">
        <img
          src="/images/debate-banner.jpg"
          alt="갈드컵 배너"
          class="w-full h-64 md:h-80 lg:h-96 object-cover"
        />
        <div class="bg-indigo-900 text-center px-10 py-12">
          <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-6">
            ✨ 갈드컵은 팬심에서 시작된다
          </h2>
          <p class="max-w-3xl mx-auto text-indigo-100 text-lg leading-relaxed">
            Galdcup은 단순한 토론장이 아닙니다.<br />
            서로 다른 의견이 정면으로 맞붙어 격렬한 논쟁이 벌어지는 전장입니다.<br />
            누구나 자유롭게 의견을 던지고, 투표로 승부를 가르며<br />
            당신의 선택이 결과를 정하는 커뮤니티<br />
            — 그것이 Galdcup입니다.
          </p>
        </div>
      </section>

      <!-- 인기 갈드컵 순위 -->
      <section class="bg-white rounded-2xl shadow-lg p-10">
        <div class="flex justify-between items-center mb-10 border-b pb-4">
          <h3 class="text-2xl font-bold text-indigo-600">
            ⭐ 인기 갈드컵 TOP 100
          </h3>
        </div>

        <div class="grid grid-cols-2 gap-x-12 gap-y-4">
          <div
            v-for="(board, index) in pagedPopularBoards"
            :key="board.id"
            @click="goToBoard(board.id)"
            class="flex items-center space-x-3 p-3 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:shadow-md cursor-pointer transition"
          >
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
              {{ index + 1 + popularPage * popularPageSize }}
            </span>
            <span class="text-slate-800 font-medium truncate">{{ board.topic }}</span>
          </div>
        </div>

        <!-- 페이지네이션 버튼 -->
        <div class="flex justify-center items-center gap-4 mt-10">
          <button
            :disabled="popularPage === 0"
            @click="prevPopularPage"
            class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
          >
            이전
          </button>
          <span class="text-slate-600">페이지 {{ popularPage + 1 }} / {{Math.max(popularTotalPages, 1) }}</span>
          <button
            :disabled="popularPage >= popularTotalPages - 1"
            @click="nextPopularPage"
            class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </section>

      <!-- 🆕 최근 생성된 갈드컵 -->
      <section class="bg-white rounded-2xl shadow-lg p-10">
        <div class="flex justify-between items-center mb-10 border-b pb-4">
          <h3 class="text-2xl font-bold text-indigo-700">
            🆕 최근 생성된 갈드컵
          </h3>
          <router-link
            to="/boards/create"
            class="px-4 py-2 rounded font-medium transition-colors
                   bg-indigo-600 text-white hover:bg-indigo-700"
          >
            갈드컵 생성
          </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div
            v-for="board in boards"
            :key="board.id"
            @click="goToBoard(board.id)"
            class="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 rounded-xl shadow-md p-6 hover:shadow-xl hover:ring-2 hover:ring-indigo-200 hover:scale-[1.03] transition-transform cursor-pointer"
          >
            <h4 class="text-lg font-semibold text-slate-900">{{ board.topic }}</h4>
            <div class="mt-6 flex items-center justify-between">
              <span class="text-xs text-slate-500">생성일: {{ formatDate(board.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center items-center gap-4 mt-10">
          <button
            :disabled="page === 0"
            @click="prevPage"
            class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
          >
            이전
          </button>
          <span class="text-slate-600">페이지 {{ page + 1 }} / {{ totalPages }}</span>
          <button
            :disabled="page >= totalPages - 1"
            @click="nextPage"
            class="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
          >
            다음
          </button>
        </div>

        <div class="flex justify-center items-center space-x-2 py-6 border-t border-gray-200 mt-6">
          <input v-model="searchKeyword" type="text" placeholder="검색어 입력"
            class="px-3 py-2 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <button @click="doSearch"
            class="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
            검색
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import useHome from '@/pages/scripts/Home.js'

const {
  boards,
  page,
  totalPages,
  formatDate,
  goToBoard,
  nextPage,
  prevPage,
  searchBoards,
  popularBoards,
  fetchPopularBoards
} = useHome()

const searchKeyword = ref('')
function doSearch() {
  if (!searchKeyword.value) return
  searchBoards(0, searchKeyword.value)
}

const popularPage = ref(0)
const popularPageSize = 10
const popularTotalPages = computed(() =>
  Math.ceil(popularBoards.value.length / popularPageSize)
)
const pagedPopularBoards = computed(() => {
  const start = popularPage.value * popularPageSize
  const end = start + popularPageSize
  return popularBoards.value.slice(start, end)
})
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

fetchPopularBoards()
</script>
