<template>
  <div class="monitoring-page">
    <AdminNav />
    <header class="monitoring-heading">
      <div><p class="monitoring-eyebrow">ADMIN · 운영 관리</p><h1>서비스 모니터링</h1><p class="monitoring-description">서비스 연결 상태와 API·Redis 성능을 한눈에 확인하세요.</p></div>
      <button type="button" class="ui-button ui-button-secondary" :disabled="loading" @click="refresh">
        <AppIcon name="clock" :size="17" />{{ loading ? '업데이트 중…' : '새로고침' }}
      </button>
    </header>

    <div class="monitoring-toolbar">
      <div class="monitoring-freshness" role="status"><span class="status-dot" :class="{ 'dot-warning': error || !snapshot?.prometheusAvailable }"></span>
        {{ error ? '최신 상태 확인 실패' : snapshot ? `마지막 확인 ${updatedTime}` : '서비스 상태 확인 중' }}
      </div>
      <label class="auto-refresh"><input v-model="autoRefresh" type="checkbox" />30초마다 자동 갱신</label>
    </div>

    <div v-if="error" role="alert" class="monitoring-banner error-banner"><AppIcon name="info" /><div><strong>{{ error }}</strong><p v-if="snapshot">이전 조회 결과입니다. 현재 상태와 다를 수 있습니다.</p></div><button type="button" class="ui-button ui-button-secondary" :disabled="loading" @click="refresh">다시 시도</button></div>
    <div v-if="loading && !snapshot" class="state-panel" role="status"><span class="state-spinner" aria-hidden="true"></span>모니터링 지표를 불러오고 있습니다…</div>

    <template v-if="snapshot">
      <div v-if="!snapshot.prometheusAvailable" role="status" class="monitoring-banner"><AppIcon name="info" /><p>지표 서버에 연결할 수 없습니다. 성능 지표는 확인 불가로 표시됩니다.</p></div>
      <section aria-labelledby="health-title" class="monitoring-section">
        <div class="section-heading"><h2 id="health-title">서비스 상태</h2><span>연결 상태 확인</span></div>
        <div class="health-grid">
          <article v-for="service in snapshot.health" :key="service.id" class="health-card">
            <div class="health-icon"><AppIcon :name="service.id === 'api' ? 'monitor' : service.id === 'db' ? 'document' : 'settings'" :size="22" /></div>
            <div><h3>{{ service.name }}</h3><span class="status-badge" :class="badgeClass(service.status)"><span class="status-dot"></span>{{ statusLabel(service.status) }}</span></div>
          </article>
          <article class="health-card"><div class="health-icon"><AppIcon name="trend" :size="22" /></div><div><h3>Prometheus</h3><span class="status-badge" :class="snapshot.prometheusAvailable ? 'status-up' : 'status-unknown'"><span class="status-dot"></span>{{ snapshot.prometheusAvailable ? '조회 연결 정상' : '연결 확인 불가' }}</span></div></article>
        </div>
      </section>

      <section aria-labelledby="api-title" class="monitoring-section">
        <div class="section-heading"><div><h2 id="api-title">API 성능</h2><p>최근 5분 기준 · 관리 화면의 지표 조회 요청 제외</p></div></div>
        <div class="metrics-grid">
          <article v-for="metric in apiCards" :key="metric.label" class="metric-card"><h3>{{ metric.label }}</h3><p class="metric-value">{{ formatMetric(metric.value, metric.digits ?? 1) }}<span>{{ metric.unit }}</span></p><p class="metric-description">{{ metric.description }}</p></article>
        </div>
        <div class="section-heading chart-heading"><h3>성능 추이</h3><label class="range-select">조회 기간<select v-model="range" class="form-control"><option v-for="option in MONITORING_RANGES" :key="option.value" :value="option.value">{{ option.label }}</option></select></label></div>
        <div class="charts-grid" :aria-busy="loading">
          <MetricChart id="rps" title="초당 API 요청량" unit="RPS" :points="history?.series?.rps || []" :available="history?.available ?? false" />
          <MetricChart id="latency" title="평균 응답 시간" unit="ms" :points="history?.series?.averageMs || []" :available="history?.available ?? false" />
        </div>
        <p class="monitoring-note">최대 응답 시간은 최근 수집된 rolling maximum입니다. 요청이 없는 구간이나 수집되지 않은 값은 ‘—’로 표시합니다.</p>
      </section>

      <section aria-labelledby="redis-title" class="monitoring-section">
        <div class="section-heading"><h2 id="redis-title">Redis</h2><span class="status-badge" :class="badgeClass(snapshot.redis.status)">{{ statusLabel(snapshot.redis.status) }}</span></div>
        <div class="redis-grid">
          <article class="metric-card"><h3>사용 메모리</h3><p class="metric-value">{{ formatBytes(snapshot.redis.memoryBytes) }}</p><p class="metric-description">{{ memoryLimit }}</p></article>
          <article class="metric-card"><h3>연결된 클라이언트</h3><p class="metric-value">{{ formatMetric(snapshot.redis.connectedClients, 0) }}<span>개</span></p><p class="metric-description">Redis Exporter 연결 포함</p></article>
          <article class="metric-card"><h3>캐시 적중률</h3><p class="metric-value">{{ formatMetric(snapshot.redis.hitPercent) }}<span>%</span></p><p class="metric-description">최근 5분 keyspace hits / (hits + misses)</p></article>
        </div>
      </section>

      <section aria-labelledby="alerts-title" class="monitoring-section alerts-panel">
        <div class="section-heading"><h2 id="alerts-title">운영 알림</h2><span>{{ snapshot.alerts.length }}건</span></div>
        <ul v-if="snapshot.alerts.length" class="alert-list"><li v-for="alert in snapshot.alerts" :key="alert.id" :class="`alert-${alert.severity}`"><AppIcon name="info" :size="20" /><div><strong>{{ alert.title }}</strong><p>{{ alert.description }}</p></div><span class="alert-level">{{ alert.severity === 'critical' ? '위험' : '주의' }}</span></li></ul>
        <p v-else class="alerts-clear"><AppIcon name="check" />현재 감지된 운영 알림이 없습니다.</p>
        <p class="monitoring-note">현재 조회 시점의 상태입니다. 5xx 5% 이상, 평균 50 RPS 이상, HTTP 429 발생을 감지합니다. 알림 이력과 로그 조회는 포함하지 않습니다.</p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { getErrorMessage, isCanceled } from '@/utils/request'
import { MONITORING_RANGES, formatMetric, formatBytes, statusLabel } from '@/utils/monitoring'
import AppIcon from '@/components/ui/AppIcon.vue'
import MetricChart from '@/components/monitoring/MetricChart.vue'
import AdminNav from '@/components/admin/AdminNav.vue'

const store = useUserStore()
const router = useRouter()
const snapshot = ref(null)
const history = ref(null)
const range = ref('30m')
const loading = ref(false)
const error = ref('')
const autoRefresh = ref(true)
let timer
let controller
let generation = 0
let disposed = false
const updatedTime = computed(() => new Date(snapshot.value.observedAt).toLocaleTimeString('ko-KR'))
const memoryLimit = computed(() => snapshot.value.redis.maxMemoryBytes === 0 ? 'Redis maxmemory 제한 없음' : snapshot.value.redis.maxMemoryBytes == null ? '메모리 제한 확인 불가' : `설정된 한도 ${formatBytes(snapshot.value.redis.maxMemoryBytes)}`)
const apiCards = computed(() => [
  { label: '초당 요청량', value: snapshot.value.api.requestsPerSecond, unit: 'RPS', digits: 2, description: '최근 5분 평균 처리량' },
  { label: '평균 응답 시간', value: snapshot.value.api.averageMs, unit: 'ms', description: '전체 요청의 가중 평균' },
  { label: '최대 응답 시간', value: snapshot.value.api.rollingMaxMs, unit: 'ms', description: '최근 5분 수집 표본 기준' },
  { label: '클라이언트 오류', value: snapshot.value.api.clientErrorPercent, unit: '%', description: 'HTTP 4xx 응답 비율' },
  { label: '서버 오류', value: snapshot.value.api.serverErrorPercent, unit: '%', description: 'HTTP 5xx 응답 비율' },
  { label: '요청 제한', value: snapshot.value.api.rateLimitedPerSecond, unit: 'RPS', digits: 2, description: 'HTTP 429 응답 발생량' },
])
function badgeClass(status) { return status === 'UP' ? 'status-up' : ['DOWN', 'OUT_OF_SERVICE'].includes(status) ? 'status-down' : 'status-unknown' }
function schedule() {
  clearTimeout(timer)
  if (!disposed && autoRefresh.value && !document.hidden && store.isAdmin && store.accessToken) timer = setTimeout(refresh, 30000)
}
async function refresh() {
  clearTimeout(timer)
  if (disposed || !store.isAdmin || !store.accessToken) return
  controller?.abort()
  controller = new AbortController()
  const current = ++generation
  loading.value = true
  try {
    const { data } = await api.get('/admin/monitoring', { params: { range: range.value }, signal: controller.signal, timeout: 20000 })
    if (disposed || current !== generation) return
    snapshot.value = data.snapshot
    history.value = data.history
    error.value = ''
  } catch (cause) {
    if (disposed || current !== generation || isCanceled(cause)) return
    error.value = getErrorMessage(cause, '모니터링 지표를 불러오지 못했습니다.')
    if ([401, 403].includes(cause.response?.status)) {
      snapshot.value = null
      history.value = null
      autoRefresh.value = false
    }
  } finally {
    if (!disposed && current === generation) { loading.value = false; schedule() }
  }
}
function visibilityChanged() {
  if (document.hidden) clearTimeout(timer)
  else if (autoRefresh.value && !loading.value) refresh()
}
watch(range, refresh)
watch(autoRefresh, schedule)
watch(() => [store.isAdmin, store.accessToken], ([admin, token]) => {
  if (admin && token) return
  generation += 1
  controller?.abort()
  clearTimeout(timer)
  snapshot.value = null
  history.value = null
  router.replace('/')
})
onMounted(() => { refresh(); document.addEventListener('visibilitychange', visibilityChanged) })
onBeforeUnmount(() => { disposed = true; generation += 1; controller?.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', visibilityChanged) })
</script>

<style scoped>
.monitoring-page { max-width:1248px; margin:0 auto; padding:32px 24px 64px; min-width:0; }
.monitoring-heading { display:flex; align-items:center; justify-content:space-between; gap:20px; }
.monitoring-eyebrow { color:var(--ui-primary); font-size:12px; font-weight:700; letter-spacing:.04em; margin:0 0 8px; }
h1 { font-size:28px; font-weight:800; letter-spacing:-.04em; line-height:1.4; margin:0; }
.monitoring-description { color:var(--ui-text-muted); font-size:14px; margin:8px 0 0; line-height:1.7; }
.monitoring-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:20px 0; margin-bottom:4px; flex-wrap:wrap; font-size:13px; color:var(--ui-text-muted); }
.monitoring-freshness,.auto-refresh { display:flex; gap:8px; align-items:center; }
.auto-refresh { min-height:44px; cursor:pointer; } .auto-refresh input { width:17px; height:17px; accent-color:var(--ui-primary); }
.status-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
.monitoring-freshness .status-dot { color:var(--ui-success); } .monitoring-freshness .dot-warning { color:var(--ui-warning); }
.monitoring-section { margin-top:28px; } .section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 0 14px; }
h2 { font-size:18px; font-weight:750; letter-spacing:-.02em; margin:0; } h3 { margin:0; font-size:14px; font-weight:600; }
.section-heading>span,.section-heading p { color:var(--ui-text-muted); font-size:12px; } .section-heading p { margin:6px 0 0; }
.health-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
.health-card { display:flex; gap:14px; align-items:center; padding:20px; background:var(--ui-surface); border:1px solid var(--ui-border); border-radius:var(--ui-radius-panel); min-width:0; }
.health-icon { display:grid; place-items:center; width:42px; height:42px; flex-shrink:0; border-radius:10px; background:var(--ui-surface-muted); color:var(--ui-secondary); }
.health-card h3 { margin-bottom:8px; overflow-wrap:anywhere; }
.status-badge { display:inline-flex; align-items:center; gap:6px; border-radius:5px; padding:3px 7px; font-size:12px; font-weight:600; line-height:1.6; }
.status-up { color:var(--ui-success); background:var(--ui-success-soft); } .status-down { color:var(--ui-danger); background:var(--ui-danger-soft); } .status-unknown { color:var(--ui-warning); background:var(--ui-warning-soft); }
.metrics-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.metric-card { min-width:0; padding:20px; background:var(--ui-surface); border:1px solid var(--ui-border); border-radius:var(--ui-radius-panel); }
.metric-card h3 { color:var(--ui-text-muted); font-size:13px; } .metric-value { margin:12px 0 8px; font-size:29px; font-weight:750; letter-spacing:-.04em; overflow-wrap:anywhere; font-variant-numeric:tabular-nums; line-height:1.4; }
.metric-value span { font-size:12px; color:var(--ui-text-muted); font-weight:500; margin-left:6px; letter-spacing:0; } .metric-description { color:var(--ui-text-muted); font-size:12px; margin:0; line-height:1.6; overflow-wrap:anywhere; }
.chart-heading { margin-top:24px; } .range-select { display:flex; align-items:center; gap:10px; color:var(--ui-text-muted); font-size:12px; } .range-select select { width:auto; min-height:44px; font-size:13px; }
.charts-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; } .redis-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.monitoring-note { color:var(--ui-text-muted); font-size:12px; line-height:1.8; margin:12px 0 0; }
.alerts-panel { background:var(--ui-surface); border:1px solid var(--ui-border); border-radius:var(--ui-radius-panel); padding:22px; }
.alert-list { list-style:none; padding:0; margin:0; } .alert-list li { display:flex; align-items:flex-start; gap:12px; padding:16px 0; border-top:1px solid var(--ui-border); }
.alert-list strong { font-size:14px; } .alert-list p { margin:5px 0 0; font-size:13px; color:var(--ui-text-muted); line-height:1.7; }
.alert-critical>.ui-icon { color:var(--ui-danger); } .alert-warning>.ui-icon { color:var(--ui-warning); } .alert-level { margin-left:auto; flex-shrink:0; font-size:12px; color:var(--ui-text-muted); }
.alerts-clear { display:flex; align-items:center; gap:10px; color:var(--ui-success); padding:16px 0; font-size:14px; }
.monitoring-banner { display:flex; gap:12px; align-items:center; padding:16px; margin:12px 0; border:1px solid var(--ui-border); border-radius:10px; background:var(--ui-warning-soft); color:var(--ui-warning); font-size:13px; line-height:1.7; }
.monitoring-banner p { margin:0; } .monitoring-banner strong { font-size:13px; } .monitoring-banner button { margin-left:auto; flex-shrink:0; } .error-banner { color:var(--ui-danger); background:var(--ui-danger-soft); border-color:var(--ui-danger-border); }
@media(max-width:1024px) { .health-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:640px) { .monitoring-page { padding:24px 16px 40px; } h1 { font-size:24px; } .monitoring-heading { flex-wrap:wrap; gap:14px; } .monitoring-heading>.ui-button { margin-left:auto; } .monitoring-toolbar { padding:14px 0 0; } .monitoring-section { margin-top:24px; } .charts-grid,.redis-grid { grid-template-columns:minmax(0,1fr); } .metrics-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .health-card { padding:14px; gap:10px; } .health-icon { display:none; } .metric-card { padding:16px; } .metric-value { font-size:26px; } .alerts-panel { padding:16px; } .monitoring-banner { flex-wrap:wrap; } }
@media(prefers-reduced-motion:reduce) { .state-spinner { animation:none; } }
</style>
