<template>
  <div class="w-full font-sans pb-10">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border-b-2 border-slate-200 pb-4">
      <div class="flex gap-6">
        <button 
          @click="changeTab('latest')" 
          class="relative text-lg font-extrabold transition-colors duration-300"
          :class="currentTab === 'latest' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
        >
          최신글
          <span v-if="currentTab === 'latest'" class="absolute -bottom-[18px] left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></span>
        </button>
        <button 
          @click="changeTab('popular')" 
          class="relative text-lg font-extrabold transition-colors duration-300"
          :class="currentTab === 'popular' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
        >
          인기글
          <span v-if="currentTab === 'popular'" class="absolute -bottom-[18px] left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></span>
        </button>
      </div>

      <router-link 
        :to="`/boards/${boardId}/posts/create`"
        class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100 flex items-center gap-2"
      >
        <span>✍️</span> 글쓰기
      </router-link>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button 
        @click="selectCategory(null)"
        class="px-4 py-1.5 rounded-full text-sm font-bold transition-all border"
        :class="selectedCategoryId === null 
          ? 'bg-slate-800 text-white border-slate-800' 
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'"
      >
        전체
      </button>
      <button 
        v-for="category in categories" 
        :key="category.id"
        @click="selectCategory(category.id)"
        class="px-4 py-1.5 rounded-full text-sm font-bold transition-all border"
        :class="selectedCategoryId === category.id 
          ? 'bg-indigo-600 text-white border-indigo-600' 
          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400'"
      >
        {{ category.name }}
      </button>
    </div>

    <div v-if="posts.length > 0" class="flex flex-col gap-3">
      <router-link
        v-for="post in posts" 
        :key="post.id"
        :to="{ path: `/boards/${boardId}/posts/${post.id}`, query: { page: currentPage, tab: currentTab, categoryId: selectedCategoryId, searchMode: searchMode, searchKeyword: searchKeyword } }"
        class="group flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
      >
        <div class="flex-1 w-full mb-3 md:mb-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">
              {{ post.categoryName || '일반' }}
            </span>
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-4">
              {{ post.title }}
            </h3>
          </div>
          <div class="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
            <span>👤 {{ post.authorNickname }}</span>
            <span class="text-slate-300">|</span>
            <span>📅 {{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-5 text-sm font-bold text-slate-400 shrink-0">
          <div class="flex items-center gap-1.5" title="조회수">
            <span>👁️</span> {{ post.viewCount || 0 }}
          </div>
          <div v-if="post.likeCount" class="flex items-center gap-1.5 text-rose-500" title="좋아요">
            <span>❤️</span> {{ post.likeCount }}
          </div>
        </div>
      </router-link>
    </div>

    <div v-else class="py-16 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
      해당하는 게시글이 없습니다.
    </div>

    <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 0"
        class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <button 
        v-for="page in visiblePages" 
        :key="page"
        @click="goToPage(page - 1)"
        class="w-10 h-10 rounded-lg font-bold transition-all"
        :class="currentPage === (page - 1) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
      >
        {{ page }}
      </button>

      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage >= totalPages - 1"
        class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <div class="mt-10 flex justify-center">
      <div class="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full max-w-xl shadow-inner">
        <select 
          v-model="searchInputMode"
          class="bg-transparent border-none text-slate-600 font-bold text-sm px-4 focus:ring-0 cursor-pointer"
        >
          <option value="TITLE_CONTENT">제목+내용</option>
          <option value="NICKNAME">작성자</option>
        </select>
        
        <div class="h-6 w-px bg-slate-300"></div>

        <input 
          v-model="searchInputKeyword"
          type="text" 
          placeholder="검색어를 입력하세요..."
          class="flex-1 bg-transparent border-none px-4 py-2 text-slate-700 placeholder-slate-400 focus:ring-0"
          @keyup.enter="performSearch"
        />

        <button 
          @click="performSearch"
          class="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition shadow-sm"
        >
          검색
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/axios'

const props = defineProps({
  boardId: { type: [String, Number], required: true },
  selectedPostId: { type: [String, Number], default: null }
})

const router = useRouter()
const route = useRoute()

// --- 상태 관리 ---
const posts = ref([])
const categories = ref([]) // 해당 게시판의 카테고리 목록 (일반, 공지사항 등)
const selectedCategoryId = ref(null) // 선택된 카테고리 ID (null이면 '전체')
const currentPage = ref(0)
const totalPages = ref(1)
const currentTab = ref('latest') // 'latest' (최신순), 'popular' (인기순)

// API 요청 시 실제로 전송되는 확정된 검색 값
// 백엔드 PostService의 "NICKNAME" 조건문에 맞춤
const searchMode = ref('TITLE_CONTENT') 
const searchKeyword = ref('')

// 검색 입력창(UI)에 실시간으로 바인딩되는 값
const searchInputMode = ref('TITLE_CONTENT') 
const searchInputKeyword = ref('')

const size = 10

// --- API 호출 함수 ---

// 1. 카테고리 로드: GET /api/boards/{boardId}/post-categories
async function fetchCategories() {
  try {
    const res = await api.get(`/boards/${props.boardId}/post-categories`)
    categories.value = res.data || []
  } catch (err) {
    console.error('카테고리 목록 로드 실패:', err)
  }
}

// 2. 게시글 목록 로드: GET /api/posts/board/{boardId}
async function fetchPosts() {
  try {
    const params = { 
      page: currentPage.value, 
      size: size,
      categoryId: selectedCategoryId.value || undefined, 
      isPopular: currentTab.value === 'popular',
      // 백엔드 @RequestParam searchType, keyword와 매핑
      searchType: searchKeyword.value ? searchMode.value : undefined,
      keyword: searchKeyword.value || undefined
    }

    const res = await api.get(`/posts/board/${props.boardId}`, { params })
    
    // Page<PostDto> 응답 처리
    posts.value = res.data.content || []
    totalPages.value = res.data.totalPages || 1
  } catch (err) {
    console.error('게시글 목록 로드 실패:', err)
    posts.value = []
    totalPages.value = 1
  }
}

// --- 사용자 인터랙션 함수 ---

// 카테고리 필터 변경 (전체 또는 특정 카테고리)
function selectCategory(id) {
  selectedCategoryId.value = id
  currentPage.value = 0
  updateQueryAndFetch()
}

// 최신순/인기순 탭 전환
function changeTab(tabName) {
  currentTab.value = tabName
  currentPage.value = 0
  updateQueryAndFetch()
}

// 검색 실행 (입력값을 확정값으로 복사 후 호출)
function performSearch() {
  searchMode.value = searchInputMode.value
  searchKeyword.value = searchInputKeyword.value
  currentPage.value = 0
  updateQueryAndFetch()
}

// 페이지 번호 클릭 시 이동
function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  updateQueryAndFetch()
}

// URL 쿼리와 내부 상태를 동기화하고 API 호출
function updateQueryAndFetch() {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      tab: currentTab.value,
      categoryId: selectedCategoryId.value,
      searchMode: searchMode.value,
      searchKeyword: searchKeyword.value
    }
  }).then(() => {
    fetchPosts()
  })
}

// 날짜 포맷 (예: 2024. 3. 10.)
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

// --- Computed ---

// 페이지네이션 가시 범위 (현재 페이지 앞뒤로 최대 5개 표시)
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, (currentPage.value + 1) - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = Math.max(1, start); i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// --- Lifecycle & Watch ---

onMounted(async () => {
  // 1. URL 쿼리 파라미터에서 이전 상태 복구 (새로고침/뒤로가기 대응)
  currentPage.value = Number(route.query.page) || 0
  currentTab.value = route.query.tab || 'latest'
  selectedCategoryId.value = route.query.categoryId ? Number(route.query.categoryId) : null
  
  // 백엔드 기준 값('TITLE_CONTENT', 'NICKNAME')으로 복구
  searchMode.value = route.query.searchMode || 'TITLE_CONTENT'
  searchKeyword.value = route.query.searchKeyword || ''
  
  searchInputMode.value = searchMode.value
  searchInputKeyword.value = searchKeyword.value

  // 2. 데이터 순차 로드
  await fetchCategories()
  fetchPosts()
})

// 게시판 변경(boardId) 감지 시 상태 초기화 및 재로드
watch(() => props.boardId, async (newId) => {
  if (newId) {
    currentPage.value = 0
    currentTab.value = 'latest'
    selectedCategoryId.value = null
    searchKeyword.value = ''
    searchInputKeyword.value = ''
    
    await fetchCategories()
    fetchPosts()
  }
})
</script>

<style scoped>
/* 필요시 추가 스타일링 */
select:focus, input:focus {
  outline: none;
}
</style>