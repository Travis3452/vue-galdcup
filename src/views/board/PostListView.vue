<template>
  <div class="w-full font-sans pb-10">
    
    <div class="flex justify-between items-center mb-4 gap-2 border-b-2 border-slate-200 pb-4">
      <div class="flex gap-4 md:gap-6">
        <button 
          @click="changeTab('latest')" 
          class="relative text-base md:text-lg font-extrabold transition-colors duration-300 shrink-0"
          :class="currentTab === 'latest' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
        >
          최신글
          <span v-if="currentTab === 'latest'" class="absolute -bottom-[18px] left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></span>
        </button>
        <button 
          @click="changeTab('popular')" 
          class="relative text-base md:text-lg font-extrabold transition-colors duration-300 shrink-0"
          :class="currentTab === 'popular' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
        >
          인기글
          <span v-if="currentTab === 'popular'" class="absolute -bottom-[18px] left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></span>
        </button>
      </div>

      <router-link 
        :to="`/boards/${boardId}/posts/create`"
        class="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0 text-sm md:text-base"
      >
        <span>✍️</span> 글쓰기
      </router-link>
    </div>

    <div class="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
      <button 
        @click="selectCategory(null)"
        class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0"
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
        class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0"
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
        class="group flex flex-col md:flex-row justify-between items-start md:items-center px-5 py-4 md:px-6 md:py-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer gap-3"
      >
        <div class="flex-1 w-full min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase shrink-0">
              {{ post.categoryName || '일반' }}
            </span>
            <h3 class="text-base md:text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-2">
              {{ post.title }}
            </h3>
          </div>
          <div class="flex items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm font-medium text-slate-500">
            <span class="truncate max-w-[100px] md:max-w-none">👤 {{ post.authorNickname }}</span>
            <span class="text-slate-300">|</span>
            <span class="shrink-0">📅 {{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-4 text-xs md:text-sm font-bold text-slate-400 shrink-0 self-end md:self-center">
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
      게시글이 없습니다.
    </div>

    <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-1 md:gap-2">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 0"
        class="p-1.5 md:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <button 
        v-for="page in visiblePages" 
        :key="page"
        @click="goToPage(page - 1)"
        class="w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold text-sm md:text-base transition-all"
        :class="currentPage === (page - 1) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'"
      >
        {{ page }}
      </button>

      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage >= totalPages - 1"
        class="p-1.5 md:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <div class="mt-10 flex justify-center px-2">
      <div class="flex flex-wrap md:flex-nowrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full max-w-xl shadow-inner">
        <select 
          v-model="searchInputMode"
          class="bg-transparent border-none text-slate-600 font-bold text-xs md:text-sm px-2 md:px-4 focus:ring-0 cursor-pointer h-10"
        >
          <option value="TITLE_CONTENT">제목+내용</option>
          <option value="NICKNAME">작성자</option>
        </select>
        
        <div class="hidden md:block h-6 w-px bg-slate-300"></div>

        <input 
          v-model="searchInputKeyword"
          type="text" 
          placeholder="검색..."
          class="flex-1 min-w-[100px] bg-transparent border-none px-2 md:px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:ring-0"
          @keyup.enter="performSearch"
        />

        <button 
          @click="performSearch"
          class="w-full md:w-auto px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition shadow-sm"
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
const categories = ref([]) 
const selectedCategoryId = ref(null) 
const currentPage = ref(0)
const totalPages = ref(1)
const currentTab = ref('latest') 

const searchMode = ref('TITLE_CONTENT') 
const searchKeyword = ref('')
const searchInputMode = ref('TITLE_CONTENT') 
const searchInputKeyword = ref('')

const size = 10

// --- API 호출 함수 ---
async function fetchCategories() {
  try {
    const res = await api.get(`/boards/${props.boardId}/post-categories`)
    categories.value = res.data || []
  } catch (err) {
    console.error('카테고리 목록 로드 실패:', err)
  }
}

async function fetchPosts() {
  try {
    const params = { 
      page: currentPage.value, 
      size: size,
      categoryId: selectedCategoryId.value || undefined, 
      isPopular: currentTab.value === 'popular',
      searchType: searchKeyword.value ? searchMode.value : undefined,
      keyword: searchKeyword.value || undefined
    }

    const res = await api.get(`/posts/board/${props.boardId}`, { params })
    
    posts.value = res.data.content || []
    // Page 응답 구조에 맞게 수정
    totalPages.value = res.data.totalPages || 1
  } catch (err) {
    console.error('게시글 목록 로드 실패:', err)
    posts.value = []
    totalPages.value = 1
  }
}

// --- 사용자 인터랙션 함수 ---
function selectCategory(id) {
  selectedCategoryId.value = id
  currentPage.value = 0
  updateQueryAndFetch()
}

function changeTab(tabName) {
  currentTab.value = tabName
  currentPage.value = 0
  updateQueryAndFetch()
}

function performSearch() {
  searchMode.value = searchInputMode.value
  searchKeyword.value = searchInputKeyword.value
  currentPage.value = 0
  updateQueryAndFetch()
}

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  updateQueryAndFetch()
}

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
  const date = new Date(dateStr)
  // 오늘 날짜면 시간만, 아니면 날짜만 표시하는 식의 커스텀 가능
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// --- Computed ---
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = window.innerWidth < 768 ? 3 : 5 // 모바일에서는 더 적게 표시
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
  currentPage.value = Number(route.query.page) || 0
  currentTab.value = route.query.tab || 'latest'
  selectedCategoryId.value = route.query.categoryId ? Number(route.query.categoryId) : null
  searchMode.value = route.query.searchMode || 'TITLE_CONTENT'
  searchKeyword.value = route.query.searchKeyword || ''
  
  searchInputMode.value = searchMode.value
  searchInputKeyword.value = searchKeyword.value

  await fetchCategories()
  fetchPosts()
})

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
/* 가로 스크롤바 숨기기 (선택 사항) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

select:focus, input:focus {
  outline: none;
}
</style>