<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-10">
    <div class="max-w-6xl mx-auto space-y-20">
      
      <section class="rounded-2xl shadow-xl overflow-hidden">
        <img
          src="/images/debate-banner.jpg"
          alt="갈드컵 배너"
          class="w-full h-64 md:h-80 lg:h-96 object-cover"
        />
        <div class="bg-indigo-900 text-center px-10 py-12">
          <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-6">
            ✨ 세상에서 제일 재밌는 남의 싸움 구경
          </h2>
          <p class="max-w-3xl mx-auto text-indigo-100 text-lg leading-relaxed">
            짜장면 vs 짬뽕부터 롤드컵 우승자 예측까지!<br />
            Galdcup은 세상의 모든 호불호와 논쟁거리를 투표로 결판내는 곳입니다.<br />
            당신의 확고한 취향과 논리로 반대파를 설득해 보세요.<br />
            과연 대중의 선택은 어느 쪽을 향할 것인가?<br />
            — 대국민 VS 플랫폼, Galdcup.
          </p>
        </div>
      </section>

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

      <section class="bg-white rounded-2xl shadow-lg p-10">
        <div class="flex justify-between items-center mb-10 border-b pb-4">
          <h3 class="text-2xl font-bold text-indigo-700">
            🆕 최신 갈드컵
          </h3>
          <router-link
            to="/boards/create"
            class="px-4 py-2 rounded font-medium transition-colors
                   bg-indigo-600 text-white hover:bg-indigo-700"
          >
            갈드컵 열기
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios' // 기존 경로 유지

// 상태 변수
const boards = ref([])
const popularBoards = ref([])
const page = ref(0)
const size = 10
const totalPages = ref(1)
const router = useRouter()

const searchKeyword = ref('')
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

async function searchBoards(pageNum, keyword) {
  try {
    const res = await api.get(`/boards/search`, {
      params: { page: pageNum, size, keyword }
    })
    boards.value = res.data.content
    page.value = res.data.number
    totalPages.value = Math.max(res.data.totalPages, 1)
  } catch (err) {
    console.error('검색 API 호출 실패:', err)
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

// 동작 함수들
function doSearch() {
  if (!searchKeyword.value) return
  searchBoards(0, searchKeyword.value)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const year = String(date.getFullYear()).slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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