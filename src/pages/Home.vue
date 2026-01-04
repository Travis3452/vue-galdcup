<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-10">
    <div class="max-w-6xl mx-auto space-y-20">
      
      <!-- 사이트 소개 -->
      <section class="rounded-2xl shadow-xl overflow-hidden">
        <!-- 배너 이미지 -->
        <img
          src="/images/debate-banner.jpg"
          alt="갈드컵 배너"
          class="w-full h-64 md:h-80 lg:h-96 object-cover"
        />
        <!-- 소개 텍스트 -->
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

      <!-- 진행 중인 갈드컵 -->
      <section class="bg-white rounded-2xl shadow-lg p-10">
        <!-- 헤더 + 게시판 생성 버튼 -->
        <div class="flex justify-between items-center mb-10 border-b pb-4">
          <h3 class="text-2xl font-bold text-indigo-700">
            🔥 진행 중인 갈드컵
          </h3>
          <router-link
            to="/boards/create"
            class="px-4 py-2 rounded font-medium transition-colors
                   bg-indigo-600 text-white hover:bg-indigo-700"
          >
            새로운 게시판 만들기
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

        <!-- 페이지네이션 -->
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
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const boards = ref([])
const page = ref(0)
const size = 10
const totalPages = ref(1)
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function fetchBoards() {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/boards?page=${page.value}&size=${size}`)
    boards.value = res.data.content
    totalPages.value = res.data.totalPages
  } catch (err) {
    console.error('API 호출 실패:', err)
  }
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

onMounted(fetchBoards)
</script>