<template>
  <div class="w-full font-sans pb-10">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-2 border-slate-200 pb-4">
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

    <div v-if="posts.length > 0" class="flex flex-col gap-3">
      <router-link
        v-for="post in posts" 
        :key="post.id"
        :to="{ path: `/boards/${boardId}/posts/${post.id}`, query: { page: currentPage, tab: currentTab, searchMode: searchMode, searchKeyword: searchKeyword } }"
        class="group flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        :class="{'bg-indigo-50/50 border-indigo-200': selectedPostId === post.id}"
      >
        <div class="flex-1 w-full mb-3 md:mb-0">
          <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate pr-4">
            {{ post.title }}
          </h3>
          <div class="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
            <span>👤 {{ post.authorNickname }}</span>
            <span class="text-slate-300">|</span>
            <span>📅 {{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-5 text-sm font-bold text-slate-400 shrink-0">
          <div class="flex items-center gap-1.5" title="조회수">
            <span>👁️</span> {{ post.viewCount || post.view || 0 }}
          </div>
          <div v-if="post.likeCount" class="flex items-center gap-1.5 text-rose-500" title="좋아요">
            <span>❤️</span> {{ post.likeCount }}
          </div>
          <div class="flex items-center gap-1.5 text-indigo-500" title="댓글">
            <span>💬</span> {{ post.commentCount || 0 }}
          </div>
        </div>
      </router-link>
    </div>

    <div v-else class="py-16 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
      해당하는 게시글이 없습니다.
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-10">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 0"
        class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition"
      >
        이전
      </button>
      
      <button 
        v-for="page in visiblePages" 
        :key="page" 
        @click="goToPage(page - 1)"
        class="px-4 py-2 rounded-xl font-bold transition"
        :class="currentPage + 1 === page ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
      >
        {{ page }}
      </button>

      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage >= totalPages - 1"
        class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition"
      >
        다음
      </button>
    </div>

    <div class="flex flex-col md:flex-row justify-center items-center gap-3 mt-10 pt-8 border-t-2 border-slate-100">
      <select 
        v-model="searchInputMode" 
        class="px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="titleContent">제목 + 내용</option>
        <option value="author">작성자</option>
      </select>
      
      <div class="relative w-full md:w-80">
        <input 
          type="text" 
          v-model="searchInputKeyword" 
          @keyup.enter="performSearch"
          placeholder="검색어를 입력하세요" 
          class="w-full px-5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
        >
        <button 
          @click="performSearch" 
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-800 transition"
        >
          🔍
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
  boardId: {
    type: [String, Number],
    required: true
  },
  selectedPostId: {
    type: [String, Number],
    default: null
  }
})

const router = useRouter()
const route = useRoute()

// 상태 변수
const posts = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const currentTab = ref('latest')

const searchMode = ref('titleContent')
const searchKeyword = ref('')

// 입력 필드용 (실제 검색 버튼을 누르기 전까지의 값)
const searchInputMode = ref('titleContent')
const searchInputKeyword = ref('')

const size = 10

// 쿼리스트링 동기화 및 데이터 로드
async function fetchPosts() {
  try {
    let endpoint = `/posts/board/${props.boardId}`
    const params = { page: currentPage.value, size }

    // 인기글 탭
    if (currentTab.value === 'popular') {
      endpoint = `/posts/board/${props.boardId}/popular`
    }

    // 검색 조건 추가
    if (searchKeyword.value) {
      if (searchMode.value === 'titleContent') {
        params.keyword = searchKeyword.value
        endpoint = `/posts/board/${props.boardId}/search`
      } else if (searchMode.value === 'author') {
        params.nickname = searchKeyword.value
        endpoint = `/posts/board/${props.boardId}/search/author`
      }
    }

    const res = await api.get(endpoint, { params })
    posts.value = res.data.content || []
    totalPages.value = res.data.totalPages || 1
  } catch (err) {
    console.error('게시글 목록 로드 실패', err)
  }
}

// 동작 함수
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
  // 브라우저 주소창(URL 쿼리) 업데이트 후 패치
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      tab: currentTab.value,
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
  return date.toLocaleDateString('ko-KR')
}

// 페이지네이션 숫자 렌더링용
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value + 1 - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  // URL에서 초기 상태 읽어오기
  currentPage.value = Number(route.query.page) || 0
  currentTab.value = route.query.tab || 'latest'
  searchMode.value = route.query.searchMode || 'titleContent'
  searchKeyword.value = route.query.searchKeyword || ''
  
  searchInputMode.value = searchMode.value
  searchInputKeyword.value = searchKeyword.value

  fetchPosts()
})

// 게시판 변경 시 리로드
watch(() => props.boardId, () => {
  currentPage.value = 0
  searchKeyword.value = ''
  fetchPosts()
})
</script>