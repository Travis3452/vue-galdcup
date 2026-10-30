<template>
  <section class="metric-chart" :aria-labelledby="`${id}-title`">
    <header><h3 :id="`${id}-title`">{{ title }}</h3><span>{{ unit }}</span></header>
    <div v-if="hasValues" class="chart-canvas">
      <canvas ref="canvas" role="img" :aria-label="`${title}, ${summary}`"></canvas>
    </div>
    <p v-else class="chart-empty">{{ available ? '표시할 지표가 없습니다. 요청 발생 후 수집을 기다려 주세요.' : '성능 추이를 불러오지 못했습니다. 새로고침으로 다시 시도해 주세요.' }}</p>
    <p class="chart-summary">{{ summary }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js'
import { useTheme } from '@/composables/useTheme'
import { formatMetric, hasChartValues } from '@/utils/monitoring'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip)
const props = defineProps({ id: String, title: String, unit: String,
  points: { type: Array, default: () => [] }, available: Boolean })
const canvas = ref(null)
const { resolvedTheme } = useTheme()
let chart
const hasValues = computed(() => hasChartValues(props.points))
const summary = computed(() => {
  const values = props.points.map(point => point.value).filter(value => typeof value === 'number' && Number.isFinite(value))
  return values.length ? `최근 ${formatMetric(values.at(-1), 2)} ${props.unit} · 구간 최고 ${formatMetric(Math.max(...values), 2)} ${props.unit}` : '측정값 없음'
})
async function render() {
  chart?.destroy()
  chart = null
  await nextTick()
  if (!canvas.value || !hasValues.value) return
  const styles = getComputedStyle(document.documentElement)
  const color = key => styles.getPropertyValue(key).trim()
  chart = new Chart(canvas.value, {
    type: 'line',
    data: { labels: props.points.map(point => new Date(point.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })),
      datasets: [{ label: `${props.title} (${props.unit})`, data: props.points.map(point => point.value),
        borderColor: color('--ui-primary'), borderWidth: 2, pointRadius: 0, pointHitRadius: 12, spanGaps: false }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false }, ticks: { color: color('--ui-text-muted'), maxTicksLimit: 5, maxRotation: 0 } },
        y: { beginAtZero: true, grid: { color: color('--ui-border') }, ticks: { color: color('--ui-text-muted'), maxTicksLimit: 5 } } } },
  })
}
onMounted(render)
watch([() => props.points, resolvedTheme, hasValues], render)
onBeforeUnmount(() => chart?.destroy())
</script>

<style scoped>
.metric-chart { min-width:0; padding:20px; border:1px solid var(--ui-border); border-radius:var(--ui-radius-panel); background:var(--ui-surface); }
header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:20px; }
h3 { font-size:15px; font-weight:700; margin:0; } header span,.chart-summary { color:var(--ui-text-muted); font-size:12px; }
.chart-canvas { position:relative; height:210px; min-width:0; }
.chart-empty { min-height:210px; display:flex; align-items:center; justify-content:center; text-align:center; color:var(--ui-text-muted); font-size:14px; line-height:1.8; }
.chart-summary { margin:12px 0 0; }
@media(max-width:480px) { .metric-chart { padding:16px; } .chart-canvas,.chart-empty { height:180px; min-height:180px; } }
</style>
