<template>
  <div class="statistics-page">
    <AdminNav />
    <header class="statistics-header">
      <div><p class="statistics-eyebrow">ADMIN · 서비스 분석</p><h1>서비스 통계</h1><p class="statistics-description">커뮤니티의 규모와 신규 가입, 활성 회원을 확인하세요.</p></div>
      <button type="button" class="ui-button ui-button-secondary" :disabled="loading" @click="refresh"><AppIcon name="clock" :size="17" />{{ loading ? '조회 중…' : '새로고침' }}</button>
    </header>
    <div class="statistics-meta" role="status">{{ data ? `마지막 확인 ${updatedTime} · 한국 시간 기준` : '통계를 불러오고 있습니다.' }}</div>
    <div v-if="error" class="statistics-error" role="alert"><div><strong>{{ error }}</strong><p v-if="data">이전 조회 결과입니다. 현재 상태와 다를 수 있습니다.</p></div><button type="button" class="ui-button ui-button-secondary" :disabled="loading" @click="refresh">다시 시도</button></div>
    <div v-if="loading && !data" class="state-panel" role="status"><span class="state-spinner" aria-hidden="true"></span>서비스 통계를 불러오는 중입니다…</div>

    <template v-if="data">
      <section class="statistics-section" aria-labelledby="totals-title">
        <h2 id="totals-title">전체 현황</h2>
        <div class="totals-grid"><article v-for="card in totalCards" :key="card.label" class="statistics-card"><div class="card-label"><span>{{ card.label }}</span><AppIcon :name="card.icon" :size="19" /></div><p class="stat-number">{{ formatMetric(card.value, 0) }}<span>{{ card.unit }}</span></p><p class="stat-caption">{{ card.description }}</p></article></div>
      </section>

      <section class="statistics-section" aria-labelledby="active-title">
        <div class="section-title"><div><h2 id="active-title">활성 회원</h2><p>같은 회원은 여러 번 이용해도 기간당 한 명으로 집계합니다.</p></div><span class="reference-date">{{ formatDay(data.asOfDate) }} 기준</span></div>
        <div class="active-grid"><article v-for="card in activeCards" :key="card.label" class="statistics-card active-card"><div class="card-label"><h3>{{ card.label }}</h3><span class="coverage-badge" :class="{ 'coverage-partial': card.partial }">{{ card.value == null ? '기록 없음' : card.partial ? '부분 집계' : '기록 기준' }}</span></div><p class="stat-number">{{ formatMetric(card.value, 0) }}<span>명</span></p><p class="stat-caption">{{ card.description }}</p></article></div>
        <p class="statistics-note">로그인한 회원의 실제 서비스 화면 이용 기준입니다. 관리자 화면·인증 갱신·백그라운드 자동 조회는 제외합니다. 최초 활동 기록일: {{ formatDay(data.activeUsers.firstRecordedDate) }}.</p>
        <p v-if="data.activeUsers.monthlyPartial" class="coverage-notice"><AppIcon name="info" :size="17" />수집 전 기간이 포함되어 있습니다. 활성 회원 수는 현재 저장된 기록 기준이며 실제보다 적을 수 있습니다.</p>
      </section>

      <section class="statistics-section" aria-labelledby="signups-title">
        <div class="section-title"><div><h2 id="signups-title">신규 가입 추이</h2><p>{{ formatDay(data.signups.fromDate) }} ~ {{ formatDay(data.signups.toDate) }}</p></div><div class="range-buttons" role="group" aria-label="신규 가입 조회 기간"><button v-for="option in STATISTICS_RANGES" :key="option.days" type="button" :aria-pressed="days === option.days" @click="days = option.days">{{ option.label }}</button></div></div>
        <div class="signup-layout" :aria-busy="loading">
          <MetricChart id="signup-trend" title="일별 신규 가입" unit="명" kind="bar" date-labels :points="chartPoints" available :empty-message="signupEmptyMessage" />
          <aside class="signup-summary statistics-card"><div class="card-label">선택 기간 신규 가입</div><p class="stat-number">{{ formatMetric(data.signups.total, 0) }}<span>명</span></p><span class="coverage-badge" :class="{ 'coverage-partial': data.signups.partial }">{{ data.signups.partial ? '부분 집계' : '기간 집계' }}</span><p class="stat-caption">탈퇴 후에도 가입 기록은 유지됩니다.</p><dl><dt>최초 가입 기록일</dt><dd>{{ formatDay(data.signups.firstRecordedDate) }}</dd></dl></aside>
        </div>
        <p class="statistics-note">기존 테스트 회원의 과거 가입일은 이 차트에 포함하지 않습니다. 최초 기록 이전은 ‘—’로 표시하며, 최초 기록일도 하루 전체가 수집됐다고 보장하지 않습니다.</p>
        <details v-if="data.signups.firstRecordedDate" class="signup-details"><summary>날짜별 가입 수 보기</summary><div class="signup-table-wrapper"><table><caption class="sr-only">선택 기간의 날짜별 신규 가입 수</caption><thead><tr><th scope="col">날짜</th><th scope="col">신규 가입</th></tr></thead><tbody><tr v-for="point in data.signups.points" :key="point.date"><td>{{ point.date }}</td><td>{{ formatMetric(point.count, 0) }}{{ point.count == null ? '' : '명' }}</td></tr></tbody></table></div></details>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { createRequestGuard, getErrorMessage, isCanceled } from '@/utils/request'
import { formatMetric } from '@/utils/monitoring'
import { STATISTICS_RANGES, signupChartPoints, formatDay } from '@/utils/statistics'
import AdminNav from '@/components/admin/AdminNav.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MetricChart from '@/components/monitoring/MetricChart.vue'

const store = useUserStore()
const router = useRouter()
const data = ref(null)
const error = ref('')
const loading = ref(false)
const days = ref(30)
const guard = createRequestGuard()
const updatedTime = computed(() => new Date(data.value.generatedAt).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }))
const totalCards = computed(() => [
  { label: '전체 회원', value: data.value.totals.users, unit: '명', icon: 'user', description: '현재 가입된 회원' },
  { label: '전체 게시판', value: data.value.totals.boards, unit: '개', icon: 'vote', description: '폐쇄된 게시판 포함' },
  { label: '전체 게시글', value: data.value.totals.posts, unit: '개', icon: 'document', description: '삭제되지 않은 게시글' },
  { label: '전체 댓글', value: data.value.totals.comments, unit: '개', icon: 'message', description: '삭제된 댓글 제외' },
])
const activeCards = computed(() => [
  { label: 'DAU', value: data.value.activeUsers.dau, partial: data.value.activeUsers.dailyPartial, description: '오늘 활동한 회원' },
  { label: 'WAU', value: data.value.activeUsers.wau, partial: data.value.activeUsers.weeklyPartial, description: '오늘 포함 최근 7일 활동 회원' },
  { label: 'MAU', value: data.value.activeUsers.mau, partial: data.value.activeUsers.monthlyPartial, description: '오늘 포함 최근 30일 활동 회원' },
])
const chartPoints = computed(() => signupChartPoints(data.value?.signups.points))
const signupEmptyMessage = computed(() => data.value?.signups.firstRecordedDate
  ? '선택 기간에 표시할 가입 기록이 없습니다.' : '아직 신규 가입 기록이 없습니다. 수집 시작 후 실제 가입부터 표시됩니다.')
async function refresh() {
  if (!store.isAdmin || !store.accessToken) return
  const request = guard.start()
  loading.value = true
  try {
    const response = await api.get('/admin/statistics', { params: { days: days.value }, signal: request.signal, timeout: 20000 })
    if (!request.isCurrent()) return
    data.value = response.data
    error.value = ''
  } catch (cause) {
    if (!request.isCurrent() || isCanceled(cause)) return
    error.value = getErrorMessage(cause, '서비스 통계를 불러오지 못했습니다.')
    if ([401, 403].includes(cause.response?.status)) data.value = null
  } finally { if (request.isCurrent()) loading.value = false }
}
watch(days, refresh)
watch(() => [store.isAdmin, store.accessToken], ([admin, token]) => {
  if (!admin || !token) { guard.invalidate(); data.value = null; router.replace('/') }
})
onMounted(refresh)
onBeforeUnmount(() => guard.invalidate())
</script>

<style scoped>
.statistics-page { max-width:1248px; margin:0 auto; padding:32px 24px 64px; min-width:0; }
.statistics-header { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
.statistics-eyebrow { margin:0 0 8px; font-size:12px; font-weight:700; color:var(--ui-primary); letter-spacing:.04em; }
h1 { font-size:28px; font-weight:800; margin:0; letter-spacing:-.04em; } .statistics-description { margin:8px 0 0; font-size:14px; color:var(--ui-text-muted); line-height:1.8; }
.statistics-meta { color:var(--ui-text-muted); font-size:12px; margin:20px 0 28px; }
.statistics-section { margin-top:28px; } h2 { font-size:18px; font-weight:750; margin:0 0 16px; } h3 { font-size:16px; font-weight:750; margin:0; }
.totals-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; } .active-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.statistics-card { min-width:0; padding:22px; background:var(--ui-surface); border:1px solid var(--ui-border); border-radius:var(--ui-radius-panel); }
.card-label { display:flex; align-items:center; justify-content:space-between; gap:10px; color:var(--ui-text-muted); font-size:13px; } .card-label h3 { color:var(--ui-text); }
.stat-number { margin:14px 0 8px; font-size:32px; font-weight:750; line-height:1.4; letter-spacing:-.04em; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.stat-number span { margin-left:6px; font-size:13px; color:var(--ui-text-muted); font-weight:500; }
.stat-caption { color:var(--ui-text-muted); font-size:12px; line-height:1.8; margin:0; }
.section-title { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px; flex-wrap:wrap; } .section-title h2 { margin-bottom:6px; } .section-title p,.reference-date { font-size:12px; color:var(--ui-text-muted); margin:0; line-height:1.8; }
.coverage-badge { display:inline-block; font-size:11px; padding:4px 7px; border-radius:5px; background:var(--ui-primary-soft); color:var(--ui-primary); white-space:nowrap; }
.coverage-partial { background:var(--ui-warning-soft); color:var(--ui-warning); }
.statistics-note { color:var(--ui-text-muted); font-size:12px; line-height:1.8; margin:12px 0 0; }
.coverage-notice { display:flex; gap:8px; align-items:flex-start; color:var(--ui-warning); background:var(--ui-warning-soft); padding:12px 14px; border-radius:8px; font-size:12px; line-height:1.8; margin-top:12px; }
.coverage-notice .ui-icon { margin-top:2px; }
.range-buttons { display:flex; gap:4px; padding:4px; border-radius:9px; background:var(--ui-surface-muted); }
.range-buttons button { min-width:48px; min-height:44px; padding:8px 12px; border:1px solid var(--ui-control-border); border-radius:6px; background:var(--ui-surface); font-size:13px; color:var(--ui-secondary); }
.range-buttons button:hover { border-color:var(--ui-primary); }
.range-buttons button[aria-pressed="true"] { border-color:var(--ui-primary); color:var(--ui-primary); background:var(--ui-surface); box-shadow:var(--ui-shadow-panel); font-weight:700; }
.signup-layout { display:grid; grid-template-columns:minmax(0,2.3fr) minmax(230px,1fr); gap:16px; }
.signup-summary { display:flex; flex-direction:column; align-items:flex-start; } .signup-summary .stat-number { font-size:40px; } .signup-summary .stat-caption { margin-top:12px; }
dl { margin:20px 0 0; padding-top:16px; border-top:1px solid var(--ui-border); width:100%; font-size:12px; line-height:1.8; } dt { color:var(--ui-text-muted); } dd { margin:4px 0 0; }
.signup-details { margin-top:16px; border:1px solid var(--ui-border); border-radius:10px; background:var(--ui-surface); }
summary { padding:14px 16px; font-size:13px; min-height:44px; } .signup-table-wrapper { max-height:320px; overflow:auto; }
table { border-collapse:collapse; width:100%; font-size:13px; text-align:left; } th,td { padding:12px 16px; border-top:1px solid var(--ui-border); } th { background:var(--ui-surface-subtle); position:sticky; top:0; } th:last-child,td:last-child { text-align:right; font-variant-numeric:tabular-nums; }
.statistics-error { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:16px; border-radius:10px; border:1px solid var(--ui-danger-border); color:var(--ui-danger); background:var(--ui-danger-soft); font-size:13px; line-height:1.8; } .statistics-error p { margin:4px 0 0; }
@media(max-width:900px) { .totals-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .signup-layout { grid-template-columns:minmax(0,1fr); } .signup-summary { display:block; } }
@media(max-width:600px) { .statistics-page { padding:24px 16px 40px; } h1 { font-size:24px; } .statistics-header>.ui-button { margin-left:auto; } .statistics-card { padding:16px; } .active-grid { grid-template-columns:minmax(0,1fr); } .active-card .stat-number { font-size:30px; } .stat-number { font-size:28px; } .card-label { gap:6px; } .range-buttons { width:100%; } .range-buttons button { flex:1; min-width:0; } }
</style>
