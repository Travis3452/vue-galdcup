<template>
  <div class="page-container home-page">
    <header class="home-heading">
      <div><p class="eyebrow">비교 · 팬심 · 끝나지 않는 떡밥</p><h1>누가 더 위냐고?<br /><span>투표로 붙어보자.</span></h1><p class="home-description">게임·선수·캐릭터까지, 비교만 하면 불붙는 떡밥들.<br />투표로 한 표, 게시글과 댓글로 한마디. 갈리는 판은 여기서 열립니다.</p></div>
      <div class="home-invitation"><span class="home-invitation-icon" aria-hidden="true"><AppIcon name="message" :size="24" /></span><p>붙여볼 주제가 있나요?<br /><strong>직접 갈드컵을 열어보세요.</strong></p><router-link to="/boards/create" class="ui-button"><AppIcon name="plus" :size="16" />갈드컵 만들기</router-link></div>
    </header>
    <div class="home-content">
      <section id="popular" class="surface home-panel" aria-labelledby="popular-title">
        <div class="section-heading"><div><p class="eyebrow">지금 불붙은 논쟁</p><h2 id="popular-title">인기 갈드컵</h2></div><span class="badge"><AppIcon name="trend" :size="15" />인기순</span></div>
        <AsyncState :loading="popularLoading" :error="popularError" :empty="popularBoards.length === 0" empty-message="아직 인기 갈드컵이 없습니다." @retry="fetchPopularBoards">
          <ol class="ranking-grid" :start="popularPage * popularPageSize + 1"><li v-for="(board, index) in pagedPopularBoards" :key="board.id">
            <router-link :to="`/boards/${board.id}`" class="ranking-row" :title="board.topic"><span class="ranking-number" aria-hidden="true">{{ popularPage * popularPageSize + index + 1 }}</span><span class="ranking-topic">{{ board.topic }}</span><AppIcon name="chevron" :size="17" /></router-link>
          </li></ol>
        </AsyncState>
        <AppPagination :current-page="popularPage" :total-pages="popularTotalPages" :disabled="popularLoading" label="인기 갈드컵 페이지" @change="popularPage = $event" />
      </section>
      <section id="boards" class="surface home-panel" aria-labelledby="boards-title">
        <div class="section-heading"><div><p class="eyebrow">새로 열린 판</p><h2 id="boards-title">최신 갈드컵</h2></div></div>
        <AsyncState :loading="isLoading" :error="boardsError" :empty="boards.length === 0" empty-message="아직 갈드컵이 없습니다. 첫 갈드컵을 열어보세요." @retry="fetchBoards">
          <div class="board-directory"><router-link v-for="board in boards" :key="board.id" :to="`/boards/${board.id}`" class="directory-row">
            <div class="min-w-0 flex-1"><h3 :title="board.topic">{{ board.topic }}</h3><p>개설일 {{ formatDate(board.createdAt) }}</p></div><AppIcon name="chevron" class="muted" :size="15" />
          </router-link></div>
        </AsyncState>
        <AppPagination :current-page="page" :total-pages="totalPages" :disabled="isLoading" label="최신 갈드컵 페이지" @change="changePage" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import AppIcon from '@/components/ui/AppIcon.vue'
import { clampPage, toApiPage } from '@/utils/pagination'
import { useResource } from '@/composables/useResource'
import AsyncState from '@/components/ui/AsyncState.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const boards = ref([])
const popularBoards = ref([])
const page = ref(0)
const totalPages = ref(0)
const latestPageSize = 5
const popularPage = ref(0)
const popularPageSize = 10
const { loading: isLoading, error: boardsError, load: loadBoards } = useResource('최신 갈드컵을 불러오지 못했습니다.')
const { loading: popularLoading, error: popularError, load: loadPopular } = useResource('인기 갈드컵을 불러오지 못했습니다.')
const popularTotalPages = computed(() => Math.ceil(popularBoards.value.length / popularPageSize))
const pagedPopularBoards = computed(() => popularBoards.value.slice(popularPage.value * popularPageSize, (popularPage.value + 1) * popularPageSize))

async function fetchBoards() {
  const requestedPage = toApiPage(page.value)
  let correctedPage = null
  const loaded = await loadBoards(signal => api.get('/boards', { signal, params: { page: requestedPage, size: latestPageSize } }), res => {
    totalPages.value = res.data.totalPages
    const validPage = clampPage(requestedPage, totalPages.value)
    if (validPage !== requestedPage) {
      boards.value = []
      page.value = validPage
      correctedPage = validPage
      return
    }
    boards.value = res.data.content || []
  })
  return loaded && correctedPage !== null ? fetchBoards() : loaded
}
function fetchPopularBoards() {
  return loadPopular(signal => api.get('/boards/popular', { signal }), res => {
    popularBoards.value = Array.isArray(res.data) ? res.data : []
    popularPage.value = clampPage(popularPage.value, popularTotalPages.value)
  })
}
function changePage(next) {
  if (next < 0 || next >= totalPages.value || isLoading.value) return
  page.value = next
  fetchBoards()
}
function formatDate(value) {
  const date = new Date(value)
  return value && Number.isFinite(date.getTime()) ? date.toLocaleDateString('ko-KR') : ''
}
onMounted(() => { fetchBoards(); fetchPopularBoards() })
</script>

<style scoped>
.home-page { padding-top:0; }
.home-heading { display:grid; gap:28px; padding:36px 0; margin-bottom:28px; border-bottom:1px solid var(--ui-border); }
.home-heading h1 { font-size:clamp(36px,5vw,62px); line-height:1.16; font-weight:800; letter-spacing:-.055em; }
.home-heading h1 span { color:var(--ui-primary); }
.home-description { margin-top:18px; color:var(--ui-text-muted); font-size:15px; line-height:1.85; }
.home-invitation { display:grid; grid-template-columns:40px minmax(0,1fr); align-items:center; gap:12px; min-width:0; }
.home-invitation-icon { display:grid; place-items:center; width:40px; height:40px; border-radius:12px; background:var(--ui-accent-soft); color:var(--ui-accent); }
.home-invitation p { font-size:14px; line-height:1.8; color:var(--ui-text-muted); word-break:keep-all; }
.home-invitation strong { font-weight:650; color:var(--ui-text); }
.home-invitation .ui-button { grid-column:1/-1; justify-self:start; }
.home-content { display:grid; grid-template-columns:minmax(0,1fr); gap:28px; align-items:start; }
.home-panel { padding:20px 16px; }
.home-panel .section-heading { margin-bottom:8px; padding-bottom:18px; border-bottom:1px solid var(--ui-border); align-items:center; }
.home-panel .eyebrow { margin-bottom:5px; font-size:11px; }
.home-panel h2 { font-size:22px; font-weight:750; letter-spacing:-.035em; }
.home-panel .section-heading > svg { color:var(--ui-accent); }
#popular { border-top:3px solid var(--ui-primary); }
#popular h2 { font-size:24px; }
#boards { background:var(--ui-surface-subtle); box-shadow:none; }
#boards h2 { font-size:18px; }
.ranking-grid,.board-directory { display:grid; grid-template-columns:minmax(0,1fr); }
.ranking-grid > li { min-width:0; }
.ranking-row { display:flex; align-items:center; gap:14px; min-height:56px; padding:14px 0; border-bottom:1px solid var(--ui-divider); }
.ranking-row:hover { color:var(--ui-primary); }
.ranking-number { flex:0 0 auto; width:24px; color:var(--ui-text-muted); font-size:14px; font-weight:500; font-variant-numeric:tabular-nums; }
.ranking-topic { flex:1; min-width:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-size:17px; font-weight:650; line-height:1.6; }
.ranking-row > svg { color:var(--ui-text-muted); }
.directory-row { display:flex; align-items:center; gap:12px; min-height:74px; padding:14px 0; border-bottom:1px solid var(--ui-divider); }
.directory-row:hover h3 { color:var(--ui-primary); }
.directory-row h3 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-size:14px; font-weight:600; line-height:1.65; }
.directory-row p { margin-top:5px; font-size:12px; color:var(--ui-text-muted); }
@media(min-width:768px) {
  .home-heading { grid-template-columns:minmax(0,1fr) 300px; align-items:center; gap:32px; padding-block:48px; margin-bottom:36px; }
  .home-invitation { border-left:1px solid var(--ui-border); padding-left:28px; }
  .home-panel { padding:26px; }
  .ranking-grid { grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(5,auto); grid-auto-flow:column; column-gap:28px; }
  .board-directory { grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 20px; }
}
@media(min-width:1024px) { .board-directory { grid-template-columns:repeat(5,minmax(0,1fr)); } }
</style>
