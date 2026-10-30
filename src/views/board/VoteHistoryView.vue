<template>
  <section>
    <div class="page-heading"><div><p class="eyebrow">선택이 쌓인 기록</p><h1>지난 투표 결과</h1><p class="page-description">종료된 투표와 우리 커뮤니티의 선택을 확인해 보세요.</p></div><router-link :to="`/boards/${boardId}`" class="ui-button ui-button-secondary">게시판으로</router-link></div>
    <AsyncState :loading="loading" :error="error" :empty="historyList.length === 0" empty-message="아직 종료된 투표가 없습니다. 진행 중인 투표에 참여해 보세요." @retry="fetchHistory(currentPage)">
      <div class="history-list"><article v-for="session in historyList" :key="session.id" class="surface panel-padding">
        <div class="history-heading"><div class="min-w-0"><span class="badge badge-neutral">투표 종료</span><h2>{{ session.topic }}</h2><p v-if="session.description" class="page-description">{{ session.description }}</p></div><span class="history-participants">{{ getTotalVotes(session.options) }}명 참여</span></div>
        <p class="history-period">{{ formatDateTime(session.startTime) }} ~ {{ formatDateTime(session.endTime) }}</p>
        <ol class="history-options"><li v-for="(option, index) in getVisibleOptions(session)" :key="option.id ?? index" class="history-option"><span class="history-rank" :class="{ 'history-rank-first': index === 0 }">{{ index + 1 }}</span><img :src="option.imageUrl || '/images/option-placeholder.svg'" :alt="option.label" loading="lazy" width="48" height="48" />
          <div class="min-w-0 flex-1"><div class="history-option-text"><h3>{{ option.label }}</h3><span>{{ option.count.toLocaleString() }}표 · {{ getPercentage(option.count, session.options) }}%</span></div><div class="history-bar" aria-hidden="true"><div :style="{ width: getPercentage(option.count, session.options) + '%' }" :class="{ 'history-bar-first': index === 0 }"></div></div></div>
        </li></ol>
        <button v-if="session.options.length > 2" type="button" class="ui-button ui-button-quiet w-full mt-4" :aria-expanded="isExpanded(session.id)" @click="toggleSession(session.id)">{{ isExpanded(session.id) ? '결과 접기' : `선택지 ${session.options.length - 2}개 더 보기` }}</button>
      </article></div>
    </AsyncState>
    <AppPagination :current-page="currentPage" :total-pages="totalPages" :disabled="loading" label="지난 투표 결과 페이지" @change="fetchHistory" />
  </section>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import { clampPage, toApiPage } from '@/utils/pagination'
import { useResource } from '@/composables/useResource'
import AsyncState from '@/components/ui/AsyncState.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const route = useRoute()
const boardId = computed(() => route.params.boardId)

const historyList = ref([])
const { loading, error, load } = useResource('투표 기록을 불러오지 못했습니다.')
const currentPage = ref(0)
const totalPages = ref(0)
const expandedSessionIds = ref(new Set())

const fetchHistory = async (page = 0) => {
  if (page < 0 || (totalPages.value > 0 && page >= totalPages.value)) return
  const requestedPage = toApiPage(page)
  let correctedPage = null
  const loaded = await load(signal => api.get(`/boards/${boardId.value}/vote-session/history`, { signal,
    params: { page: requestedPage, size: 5, sort: 'endTime,desc' } }), res => {
    totalPages.value = res.data.totalPages
    const validPage = clampPage(requestedPage, totalPages.value)
    if (validPage !== requestedPage) {
      historyList.value = []
      currentPage.value = validPage
      correctedPage = validPage
      return
    }
    historyList.value = (res.data.content || []).map(session => ({ ...session,
      options: (session.options || []).map(option => ({ ...option, count: Math.max(0, Number(option.count) || 0) })) }))
    currentPage.value = requestedPage
    expandedSessionIds.value.clear()
  })
  return loaded && correctedPage !== null ? fetchHistory(correctedPage) : loaded
}

const toggleSession = (id) => {
  if (expandedSessionIds.value.has(id)) {
    expandedSessionIds.value.delete(id)
  } else {
    expandedSessionIds.value.add(id)
  }
}
const isExpanded = (id) => expandedSessionIds.value.has(id)

const getVisibleOptions = (session) => {
  const sorted = [...session.options].sort((a, b) => b.count - a.count)
  return isExpanded(session.id) ? sorted : sorted.slice(0, 2)
}

const getPercentage = (count, options) => {
  const total = options.reduce((acc, cur) => acc + cur.count, 0)
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

const getTotalVotes = (options) => {
  return options.reduce((acc, cur) => acc + cur.count, 0).toLocaleString()
}

const formatDateTime = (dateStr) => {
  if (!dateStr || !Number.isFinite(new Date(dateStr).getTime())) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

watch(boardId, () => { currentPage.value = 0; totalPages.value = 0; historyList.value = []; fetchHistory() }, { immediate: true })
</script>
<style scoped>
.history-list { display:grid; gap:20px; }
.history-heading { display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px; }
.history-heading h2 { margin-top:12px; font-size:20px; font-weight:700; line-height:1.55; }
.history-participants { align-self:flex-start; padding:6px 10px; border-radius:8px; color:var(--ui-primary); background:var(--ui-primary-soft); font-size:13px; font-weight:600; }
.history-period { margin-block:16px 20px; color:var(--ui-text-muted); font-size:12px; }
.history-options { display:grid; gap:12px; }
.history-option { display:flex; align-items:center; gap:12px; padding:14px 0; border-top:1px solid var(--ui-border); }
.history-option img { flex:0 0 auto; width:44px; height:44px; object-fit:cover; border-radius:8px; border:1px solid var(--ui-border); }
.history-rank { flex:0 0 auto; width:18px; color:var(--ui-text-muted); font-size:14px; font-weight:750; text-align:center; }
.history-rank-first { color:var(--ui-primary); }
.history-option-text { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:6px 16px; margin-bottom:10px; }
.history-option-text h3 { font-size:14px; font-weight:600; line-height:1.65; }
.history-option-text span { color:var(--ui-text-muted); font-size:12px; white-space:nowrap; }
.history-bar { height:6px; overflow:hidden; border-radius:99px; background:var(--ui-divider); }
.history-bar > div { height:100%; border-radius:99px; background:var(--ui-control-border); }
.history-bar .history-bar-first { background:var(--ui-primary); }
</style>
