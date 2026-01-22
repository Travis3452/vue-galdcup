<template>
  <div>
    <!-- 탭 버튼 + 글쓰기 버튼 -->
    <div class="flex justify-between items-center border-b border-gray-200 bg-white px-6 py-3">
      <div class="flex">
        <button
          class="px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'latest' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'"
          @click="switchTab('latest')"
        >
          최신글
        </button>
        <button
          class="ml-4 px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'popular' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'"
          @click="switchTab('popular')"
        >
          인기글
        </button>
      </div>

      <router-link :to="`/boards/${boardId}/posts/create`"
        class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
        글쓰기
      </router-link>
    </div>

    <!-- 게시글 테이블 -->
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-gray-50 border-b-2 border-gray-300 text-gray-600">
          <th class="px-4 py-2 text-left w-2/5">제목</th>
          <th class="px-4 py-2 text-center w-1/5">작성자</th>
          <th class="px-4 py-2 text-center w-1/5">작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="post in posts"
          :key="post.id"
          class="border-b border-gray-200 hover:bg-gray-50"
          :class="post.id === selectedPostId ? 'bg-indigo-100 font-bold text-indigo-700' : ''"
        >
          <td class="px-4 py-2 truncate">
            <router-link
              :to="{
                name: 'Post',
                params: { boardId: boardId, postId: post.id },
                query: { 
                  page: pageInfo.number, 
                  tab: activeTab, 
                  searchMode: searchMode, 
                  searchKeyword: searchKeyword 
                }
              }"
              class="text-gray-800 hover:text-indigo-600"
            >
              {{ post.title }}
            </router-link>
          </td>
          <td class="px-4 py-2 text-center text-gray-600">{{ post.authorNickname }}</td>
          <td class="px-4 py-2 text-center text-gray-600">{{ formatDate(post.createdAt) }}</td>
        </tr>

        <tr v-if="posts.length === 0">
          <td colspan="3" class="px-4 py-6 text-center text-gray-500">아직 게시글이 없습니다.</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="flex justify-center py-4 space-x-1">
      <button @click="goToBlock(currentBlock - 1, activeTab)" :disabled="pageInfo.number === 0"
        class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">
        이전
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="fetchPosts(page - 1, activeTab)"
        class="px-3 py-1 border border-gray-300 rounded text-sm"
        :class="pageInfo.number === page - 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-100'"
      >
        {{ page }}
      </button>
      <button @click="goToBlock(currentBlock + 1, activeTab)" :disabled="pageInfo.number >= pageInfo.totalPages - 1"
        class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">
        다음
      </button>
    </div>

    <!-- 검색 영역 -->
    <div class="flex justify-center items-center space-x-2 py-4 border-t border-gray-200">
      <select v-model="searchMode"
        class="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white">
        <option value="titleContent">제목+내용</option>
        <option value="author">작성자</option>
      </select>

      <input v-model="searchKeyword" type="text" placeholder="검색어 입력"
        class="px-3 py-1 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500" />

      <button @click="doSearch"
        class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
        검색
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useBoardPosts from '@/components/board/scripts/PostList.js'

const route = useRoute()

const props = defineProps({
  boardId: { type: String, default: null },
  page: { type: Number, default: 0 },
  selectedPostId: { type: Number, default: null }
})

const boardId = props.boardId || route.params.boardId

const {
  posts,
  pageInfo,
  currentBlock,
  visiblePages,
  fetchPosts,
  goToBlock,
  formatDate,
  searchPosts   
} = useBoardPosts(boardId)

const activeTab = ref(route.query.tab || 'latest')
const searchMode = ref('titleContent')
const searchKeyword = ref('')

function switchTab(tab) {
  activeTab.value = tab
  fetchPosts(0, tab)
}

function doSearch() {
  if (!searchKeyword.value) return
  searchPosts(0, searchMode.value, searchKeyword.value, activeTab.value)
}

onMounted(async () => {
  if (route.query.searchMode && route.query.searchKeyword) {
    await searchPosts(
      props.page,
      route.query.searchMode,
      route.query.searchKeyword,
      activeTab.value
    )
    searchMode.value = route.query.searchMode
    searchKeyword.value = route.query.searchKeyword
  } else {
    await fetchPosts(props.page, activeTab.value)
  }
})
</script>