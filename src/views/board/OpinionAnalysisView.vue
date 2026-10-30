<template>
  <section>
    <div class="page-heading"><div><p class="eyebrow">댓글 속 다양한 생각을 한눈에</p><h1>AI 여론 분석</h1><p class="page-description">댓글의 맥락을 바탕으로 정리한 참고용 분석입니다.<br />실제 투표 결과와 다를 수 있습니다.</p></div><button v-if="analysisData" type="button" class="ui-button ui-button-secondary" :disabled="boardStore.isAnalysisLoading" @click="handleStartAnalysis">{{ boardStore.isAnalysisLoading ? '분석 중…' : '최신 내용으로 분석' }}</button></div>
    <AsyncState :loading="boardStore.isAnalysisLoading" :error="boardStore.analysisError" @retry="boardStore.fetchOpinionAnalysis(boardId, voteSessionId)">
      <div v-if="analysisData" class="analysis-layout">
        <section class="surface panel-padding"><div class="section-heading"><h2>선택지별 예상 지지율</h2><span class="badge badge-neutral">AI 예측</span></div>
          <p v-if="chartError" role="status" class="field-help mb-4">{{ chartError }}</p>
          <div v-if="sortedResults.length" class="analysis-chart"><canvas ref="chartCanvas" role="img" aria-label="선택지별 예상 지지율 막대그래프. 수치는 다음 결과 목록에서도 확인할 수 있습니다."></canvas></div>
          <p v-else class="field-help">선택지별 수치가 없습니다. 분석 요약을 확인해 주세요.</p>
          <ol class="analysis-results"><li v-for="(result, index) in sortedResults" :key="index"><span class="analysis-dot" :style="{ backgroundColor:`var(--ui-chart-${index % 10 + 1})` }" aria-hidden="true"></span><span class="min-w-0 flex-1">{{ result.label }}</span><strong>{{ result.supportRate.toFixed(1) }}%</strong></li></ol>
        </section>
        <section class="surface panel-padding"><div class="section-heading"><h2>분석 요약</h2></div><p v-if="analysisData.summary" class="analysis-summary">{{ analysisData.summary }}</p><p v-else class="field-help">요약 내용이 없습니다.</p>
          <div v-if="insightData" class="analysis-insight"><span class="field-label">함께 살펴볼 점</span><p><strong>{{ insightData.topCandidate }}</strong>의 예상 지지율은 2위보다 {{ insightData.gap }}%p 높습니다. {{ insightData.isCloseMatch ? '선택지 간 차이가 작아 의견이 나뉘고 있습니다.' : '댓글에서 상대적으로 높은 지지를 보이고 있습니다.' }}</p></div>
          <p class="analysis-notice">AI는 맥락이나 풍자 표현을 다르게 해석할 수 있습니다. 원문 댓글과 함께 참고해 주세요.</p>
        </section>
      </div>
      <div v-else class="surface analysis-empty"><span class="badge mb-4">AI 분석</span><h2>아직 분석된 내용이 없습니다</h2><p class="page-description">댓글에 담긴 서로 다른 생각을<br />AI가 읽기 쉽게 정리해 드립니다.</p><button type="button" class="ui-button mt-6" :disabled="boardStore.isAnalysisLoading" @click="handleStartAnalysis">여론 분석 시작하기</button></div>
    </AsyncState>
    <nav class="analysis-navigation" aria-label="분석 화면 이동"><button type="button" class="ui-button ui-button-secondary" @click="router.back()">이전 화면</button><router-link :to="{name:'Board', params:{boardId}}" class="ui-button ui-button-secondary">게시판으로</router-link></nav>
  </section>
</template>
<script setup>
import { ref, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import AsyncState from '@/components/ui/AsyncState.vue';
import { normalizeAnalysisResults } from '@/utils/analysis';
import { useTheme } from '@/composables/useTheme';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const { resolvedTheme } = useTheme();

const boardId = computed(() => route.params.boardId);
const voteSessionId = computed(() => route.params.voteSessionId);

const chartCanvas = ref(null);
let chartInstance = null;
let chartVersion = 0;
let disposed = false;
const chartError = ref('');

const analysisData = computed(() => boardStore.opinionAnalysis);

// 지지율(supportRate) 내림차순 정렬
const sortedResults = computed(() => normalizeAnalysisResults(analysisData.value?.results));

// 계산 기반 보조 인사이트
const insightData = computed(() => {
  const results = sortedResults.value;
  if (results.length < 2) return null;

  const first = results[0];
  const second = results[1];

  const gap = (first.supportRate - second.supportRate).toFixed(1);
  const ratio = second.supportRate === 0
                ? '압도적으로'
                : `약 ${(first.supportRate / second.supportRate).toFixed(1)}배`;

  return {
    topCandidate: first.label,
    gap: gap,
    ratio: ratio,
    isCloseMatch: parseFloat(gap) < 7.0,
  };
});

/**
 * 최대 10개까지 대응하는 테마 컬러
 */
const getCandidateTheme = (idx) => {
  return { main: getComputedStyle(document.documentElement).getPropertyValue(`--ui-chart-${idx % 10 + 1}`).trim() };
};

/**
 * 차트 초기화 (세로 막대 차트로 변경)
 */
const initChart = async () => {
  const version = ++chartVersion;
  chartInstance?.destroy();
  chartInstance = null;
  chartError.value = '';
  await nextTick();
  if (disposed || !chartCanvas.value || !analysisData.value || boardStore.isAnalysisLoading) return;
  let Chart;
  try { ({ Chart } = await import('@/services/barChart')); }
  catch { if (!disposed && version === chartVersion) chartError.value = '그래프를 표시하지 못했습니다. 아래 결과 목록에서 수치를 확인해 주세요.'; return; }
  if (disposed || version !== chartVersion || !chartCanvas.value || boardStore.isAnalysisLoading) return;
  const ctx = chartCanvas.value.getContext('2d');
  const results = sortedResults.value;
  const colors = getComputedStyle(document.documentElement);
  const color = name => colors.getPropertyValue(`--ui-${name}`).trim();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      // X축 라벨이 길 경우 6글자에서 말줄임표 처리
      labels: results.map(r => r.label.length > 6 ? r.label.substring(0, 6) + '...' : r.label),
      datasets: [{
        data: results.map(r => r.supportRate),
        backgroundColor: results.map((_, i) => getCandidateTheme(i).main),
        borderRadius: 8, // 상단 모서리 둥글게
        borderSkipped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 부모 높이에 맞추기 위해 false 설정
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: color('tooltip'),
          titleColor: color('tooltip-text'),
          bodyColor: color('tooltip-text'),
          padding: 15,
          cornerRadius: 15,
          callbacks: {
            // 툴팁에서는 잘리지 않은 전체 이름 표시
            title: (context) => results[context[0].dataIndex].label,
            label: (context) => ` 예측 점유율: ${context.raw.toFixed(1)}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: color('divider'),
            drawBorder: false
          },
          ticks: {
            color: color('text-muted'),
            font: { weight: 'bold' },
            callback: (value) => value + '%'
          }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            color: color('text-muted'),
            font: { weight: 'bold' }
          }
        }
      },
      animation: {
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500,
        easing: 'easeOutQuart'
      }
    }
  });
};

const handleStartAnalysis = async () => {
  await boardStore.startOpinionAnalysis(boardId.value, voteSessionId.value);
};

watch([boardId, voteSessionId], () => {
  boardStore.opinionAnalysis = null;
  boardStore.fetchOpinionAnalysis(boardId.value, voteSessionId.value);
}, { immediate: true });
watch([chartCanvas, sortedResults, resolvedTheme, () => boardStore.isAnalysisLoading], initChart, { flush: 'post' });
onUnmounted(() => { disposed = true; chartVersion++; chartInstance?.destroy(); chartInstance = null; });
</script>
<style scoped>
.analysis-layout { display:grid; gap:20px; align-items:start; }
.analysis-chart { position:relative; width:100%; height:280px; min-width:0; }
.analysis-results { display:grid; gap:14px; margin-top:24px; border-top:1px solid var(--ui-border); padding-top:20px; }
.analysis-results li { display:flex; align-items:flex-start; gap:10px; font-size:14px; line-height:1.7; }
.analysis-results strong { flex:0 0 auto; font-weight:700; font-variant-numeric:tabular-nums; }
.analysis-dot { flex:0 0 auto; width:10px; height:10px; margin-top:7px; border-radius:50%; }
.analysis-summary { font-size:16px; line-height:1.85; white-space:pre-wrap; color:var(--ui-secondary); }
.analysis-insight { margin-top:24px; padding:16px; border:1px solid var(--ui-primary-border); border-radius:12px; background:var(--ui-primary-soft); color:var(--ui-secondary); font-size:14px; line-height:1.8; }
.analysis-notice { margin-top:24px; padding-top:16px; border-top:1px solid var(--ui-border); color:var(--ui-text-muted); font-size:12px; line-height:1.75; }
.analysis-empty { padding:48px 20px; text-align:center; }
.analysis-empty h2 { font-size:22px; font-weight:700; }
.analysis-navigation { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:28px; }
@media(min-width:1024px) { .analysis-layout { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:24px; } .analysis-chart { height:320px; } }
</style>
