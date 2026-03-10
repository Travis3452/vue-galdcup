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

// 상태 변수
const posts = ref([])
const categories = ref([]) // 카테고리 목록 추가
const selectedCategoryId = ref(null) // 선택된 카테고리 (null 이면 '전체')
const currentPage = ref(0)
const totalPages = ref(1)
const currentTab = ref('latest')
const searchMode = ref('titleContent')
const searchKeyword = ref('')

const searchInputMode = ref('titleContent')
const searchInputKeyword = ref('')
const size = 10

// 🛠️ 카테고리 목록 로드 부분 수정
async function fetchCategories() {
  try {
    // 수정 전: api.get(`/post-categories/board/${props.boardId}`)
    // 수정 후: 백엔드 @RequestMapping("/api/boards/{boardId}/post-categories")에 맞춤
    const res = await api.get(`/boards/${props.boardId}/post-categories`)
    categories.value = res.data || []
  } catch (err) {
    console.error('카테고리 목록 로드 실패', err)
  }
}

// 🛠️ 게시글 목록 로드 (통합 API 사용)
async function fetchPosts() {
  try {
    const params = { 
      page: currentPage.value, 
      size: size,
      // categoryId가 null(전체)이면 파라미터에서 제외하여 백엔드에서 null로 받게 함
      categoryId: selectedCategoryId.value || undefined, 
      isPopular: currentTab.value === 'popular',
      searchType: searchKeyword.value ? searchMode.value : undefined,
      keyword: searchKeyword.value || undefined
    }

    // 통합 엔드포인트 호출 (백엔드: /api/posts/board/{boardId})
    const res = await api.get(`/posts/board/${props.boardId}`, { params })
    posts.value = res.data.content || []
    totalPages.value = res.data.totalPages || 1
  } catch (err) {
    console.error('게시글 목록 로드 실패', err)
    posts.value = []
    totalPages.value = 1
  }
}

// 카테고리 변경 시
function selectCategory(id) {
  selectedCategoryId.value = id
  currentPage.value = 0
  updateQueryAndFetch()
}

// 탭 변경
function changeTab(tabName) {
  currentTab.value = tabName
  currentPage.value = 0
  updateQueryAndFetch()
}

// 검색 실행
function performSearch() {
  searchMode.value = searchInputMode.value
  searchKeyword.value = searchInputKeyword.value
  currentPage.value = 0
  updateQueryAndFetch()
}

// 페이지 이동
function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  updateQueryAndFetch()
}

// URL 쿼리 동기화 및 데이터 호출
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

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

// 페이지네이션 가시범위 (기존 동일)
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(async () => {
  // 초기 쿼리 파라미터 읽기
  currentPage.value = Number(route.query.page) || 0
  currentTab.value = route.query.tab || 'latest'
  selectedCategoryId.value = route.query.categoryId ? Number(route.query.categoryId) : null
  searchMode.value = route.query.searchMode || 'titleContent'
  searchKeyword.value = route.query.searchKeyword || ''
  
  searchInputMode.value = searchMode.value
  searchInputKeyword.value = searchKeyword.value

  // 카테고리와 게시글 순차 로드
  await fetchCategories()
  fetchPosts()
})

watch(() => props.boardId, async (newId) => {
  if (newId) {
    currentPage.value = 0
    currentTab.value = 'latest'
    selectedCategoryId.value = null // 게시판 바뀌면 '전체'로 초기화
    searchKeyword.value = ''
    searchInputKeyword.value = ''
    
    await fetchCategories()
    fetchPosts()
  }
})
</script>