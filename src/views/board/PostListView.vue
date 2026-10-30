<template>
  <div class="post-list">
    <div class="section-heading post-list-heading">
      <div><h2 ref="listHeading" tabindex="-1">게시글</h2><p class="section-subtitle">투표에 대한 생각과 이야기를 나눠 보세요.</p></div>
      <router-link :to="`/boards/${boardId}/posts/create`" class="ui-button"><span aria-hidden="true">＋</span>글쓰기</router-link>
    </div>
    <div class="post-list-toolbar"><div class="post-tabs" role="group" aria-label="게시글 정렬">
      <button type="button" :aria-pressed="currentTab === 'latest'" @click="changeTab('latest')">최신글</button><button type="button" :aria-pressed="currentTab === 'popular'" @click="changeTab('popular')">인기글</button>
    </div><p v-if="!isLoading && !error" class="post-count" role="status">총 <strong>{{ totalElements.toLocaleString() }}</strong>개<span v-if="totalPages > 0"> · {{ currentPage + 1 }} / {{ totalPages }}페이지</span></p></div>
    <p v-if="categoryError" role="alert" class="field-error">{{ categoryError }} <button type="button" class="underline" @click="fetchCategories">다시 시도</button></p>
    <div class="category-filter" role="group" aria-label="게시글 카테고리"><button type="button" class="chip" :aria-pressed="selectedCategoryId === null" @click="selectCategory(null)">전체</button>
      <button v-for="category in categories" :key="category.id" type="button" class="chip" :aria-pressed="selectedCategoryId === category.id" @click="selectCategory(category.id)">{{ category.name }}</button>
    </div>
    <div v-if="searchKeyword" class="post-search-summary"><p><strong>“{{ searchKeyword }}”</strong> 검색 결과</p><button type="button" class="ui-button ui-button-quiet" @click="clearSearch">검색 초기화</button></div>
    <AsyncState :loading="isLoading" :error="error" :empty="posts.length === 0" empty-message="조건에 맞는 게시글이 없습니다. 다른 검색어나 카테고리로 찾아보세요." @retry="fetchPosts">
      <div class="post-rows">
        <router-link v-for="post in posts" :key="post.id" :to="{ path: `/boards/${boardId}/posts/${post.id}`, query: { page: currentPage, tab: currentTab, categoryId: selectedCategoryId, searchMode: searchMode, searchKeyword: searchKeyword } }" class="post-row" :class="{ 'post-row-selected': String(post.id) === String(selectedPostId) }" :aria-current="String(post.id) === String(selectedPostId) ? 'page' : undefined">
          <div class="post-row-main"><div class="post-title-line"><span class="badge badge-neutral">{{ post.categoryName || '일반' }}</span><h3>{{ post.title }}</h3><span v-if="isNewPost(post.createdAt)" class="new-mark"><span class="sr-only">새 글</span>N</span></div>
            <div class="post-meta"><span class="post-author">{{ post.authorNickname }}</span><span>{{ formatDate(post.createdAt) }}</span><span>조회 {{ post.viewCount || 0 }}</span><span v-if="post.likeCount">추천 {{ post.likeCount }}</span></div>
          </div>
          <span class="post-row-arrow" aria-hidden="true">›</span>
        </router-link>
      </div>
    </AsyncState>
    <AppPagination :current-page="currentPage" :total-pages="totalPages" :disabled="isLoading" @change="goToPage" />
    <form class="post-search" role="search" aria-label="게시글 검색" @submit.prevent="performSearch">
      <select v-model="searchInputMode" aria-label="게시글 검색 범위" class="form-control"><option value="TITLE_CONTENT">제목+내용</option><option value="NICKNAME">작성자</option></select>
      <input v-model="searchInputKeyword" aria-label="게시글 검색어" maxlength="100" type="search" class="form-control" placeholder="게시글 검색" />
      <button type="submit" class="ui-button ui-button-secondary">검색</button>
    </form>
  </div>
</template>
<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/axios'
import { toApiPage } from '@/utils/pagination'
import { useResource } from '@/composables/useResource'
import AsyncState from '@/components/ui/AsyncState.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

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
const totalPages = ref(0)
const totalElements = ref(0)
const listHeading = ref(null)
let scrollToListOnLoad = false
const currentTab = ref('latest') 

const searchMode = ref('TITLE_CONTENT') 
const searchKeyword = ref('')
const searchInputMode = ref('TITLE_CONTENT') 
const searchInputKeyword = ref('')

const size = 10

const { loading: isLoading, error, load: loadPosts } = useResource('게시글을 불러오지 못했습니다.')
const { error: categoryError, load: loadCategories } = useResource('카테고리를 불러오지 못했습니다.')

// --- API 호출 함수 ---
function fetchCategories() {
  return loadCategories(signal => api.get(`/boards/${props.boardId}/post-categories`, { signal }), res => {
    categories.value = res.data || []
  })
}
async function fetchPosts() {
  const params = { page: toApiPage(currentPage.value), size,
    categoryId: selectedCategoryId.value || undefined, isPopular: currentTab.value === 'popular',
    searchType: searchKeyword.value ? searchMode.value : undefined, keyword: searchKeyword.value || undefined }
  const loaded = await loadPosts(signal => api.get(`/posts/board/${props.boardId}`, { signal, params }), res => {
    totalPages.value = res.data.totalPages
    totalElements.value = res.data.totalElements
    // 삭제나 필터 변경으로 존재하지 않는 페이지가 되면 마지막 유효 페이지를 다시 요청한다.
    const lastPage = Math.max(totalPages.value - 1, 0)
    if (currentPage.value > lastPage) {
      posts.value = []
      currentPage.value = lastPage
      updateQueryAndFetch()
      return
    }
    posts.value = res.data.content || []
  })
  if (loaded && scrollToListOnLoad && params.page === currentPage.value) {
    await nextTick()
    scrollToListOnLoad = false
    listHeading.value?.focus({ preventScroll: true })
    listHeading.value?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
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
  searchKeyword.value = searchInputKeyword.value.trim()
  currentPage.value = 0
  updateQueryAndFetch()
}

function clearSearch() {
  searchInputKeyword.value = ''
  performSearch()
}

async function goToPage(page) {
  if (isLoading.value || page === currentPage.value || page < 0 || page >= totalPages.value) return
  scrollToListOnLoad = true
  currentPage.value = page
  await updateQueryAndFetch()
}

function updateQueryAndFetch() {
  return router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      tab: currentTab.value,
      categoryId: selectedCategoryId.value,
      searchMode: searchMode.value,
      searchKeyword: searchKeyword.value
    }
  })
}

// 💡 시간 표기 포맷 최적화 로직 (상대 시간)
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!Number.isFinite(date.getTime())) return '';
  const now = new Date();
  
  // 밀리초 단위 차이 계산
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    // 1~6일 전은 "N일 전"으로 표기
    return `${diffDays}일 전`;
  } else {
    // 일주일이 넘어가면 날짜로 표기 (예: 10.24)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 해가 넘어갔다면 연도까지 표시 (예: 2023.10.24)
    if (now.getFullYear() !== date.getFullYear()) {
      return `${date.getFullYear()}.${month}.${day}`;
    }
    return `${month}.${day}`;
  }
}

// 💡 새로운 글(1시간 이내)인지 판별하는 유틸리티
function isNewPost(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  return diffMins >= 0 && diffMins < 60; // 1시간 이내
}

function readQuery() {
  const parsed = Number(route.query.page)
  currentPage.value = Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0
  currentTab.value = route.query.tab === 'popular' ? 'popular' : 'latest'
  const category = Number(route.query.categoryId)
  selectedCategoryId.value = Number.isSafeInteger(category) && category > 0 ? category : null
  searchMode.value = route.query.searchMode === 'NICKNAME' ? 'NICKNAME' : 'TITLE_CONTENT'
  searchKeyword.value = typeof route.query.searchKeyword === 'string' ? route.query.searchKeyword.slice(0, 100) : ''
  searchInputMode.value = searchMode.value
  searchInputKeyword.value = searchKeyword.value
}
watch(() => props.boardId, () => { categories.value = []; fetchCategories() }, { immediate: true })
watch(() => [props.boardId, route.query.page, route.query.tab, route.query.categoryId, route.query.searchMode, route.query.searchKeyword], () => {
  readQuery()
  fetchPosts()
}, { immediate: true })
</script>
<style scoped>
.post-list-heading h2 { scroll-margin-top:24px; }
.post-list-heading .section-subtitle { margin-top:6px; }
.post-list-toolbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px 16px; margin-bottom:16px; border-bottom:1px solid var(--ui-border); }
.post-count { padding-block:8px; color:var(--ui-text-muted); font-size:12px; }
.post-count strong { color:var(--ui-text); font-weight:650; }
.post-search-summary { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; padding:8px 12px; margin-bottom:12px; border-radius:10px; background:var(--ui-primary-soft); font-size:13px; }
.post-search-summary p { min-width:0; overflow-wrap:anywhere; }
.post-tabs { display:flex; gap:20px; align-self:stretch; }
.post-tabs button { min-height:44px; border-bottom:2px solid transparent; padding:8px 2px; color:var(--ui-text-muted); font-weight:650; font-size:16px; }
.post-tabs button[aria-pressed="true"] { border-color:var(--ui-primary); color:var(--ui-primary); }
.post-list-heading { margin-bottom:20px; }
.category-filter { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
.post-row { display:flex; align-items:center; gap:12px; padding:20px 8px; border-bottom:1px solid var(--ui-divider); border-radius:4px; }
.post-row:hover, .post-row-selected { background:var(--ui-surface-subtle); }
.post-row-main { flex:1; min-width:0; }
.post-title-line { display:flex; flex-wrap:wrap; align-items:center; gap:8px; min-width:0; }
.post-title-line h3 { flex:1; min-width:0; font-size:16px; font-weight:650; line-height:1.65; word-break:normal; }
.post-row:hover h3 { color:var(--ui-primary); }
.new-mark { color:var(--ui-danger); font-size:11px; font-weight:750; }
.post-meta { display:flex; flex-wrap:wrap; gap:4px 12px; margin-top:8px; color:var(--ui-text-muted); font-size:12px; }
.post-author { max-width:180px; overflow-wrap:anywhere; }
.post-row-arrow { color:var(--ui-text-muted); font-size:24px; }
.post-search { display:grid; grid-template-columns:104px minmax(0,1fr); gap:8px; margin-top:24px; }
.post-search button { grid-column:1 / -1; }
.post-search select { padding-inline:8px; font-size:14px; }
@media(min-width:640px) { .post-search { grid-template-columns:120px minmax(0,1fr) auto; } .post-search button { grid-column:auto; } }
</style>
