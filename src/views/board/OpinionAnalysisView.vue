<template>
  <div class="max-w-7xl mx-auto p-4 md:p-10 space-y-12 font-sans text-slate-900">
    
    <div class="flex flex-col items-center justify-center text-center gap-6 pt-4 mb-10">
      <div class="space-y-5 flex flex-col items-center">
        <div class="inline-flex relative mb-1">
          <div class="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
          <div class="relative p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/10">
            <span class="text-4xl">🧬</span>
          </div>
        </div>
        
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 bg-clip-text text-transparent uppercase">
          Opinion Analysis
        </h2>
        
        <p class="text-slate-600 font-bold bg-white border border-slate-200 px-6 py-2.5 rounded-2xl shadow-sm text-sm md:text-base flex items-center gap-2.5">
          <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          실시간 커뮤니티 댓글 기반 AI 심층 여론 분석
        </p>
      </div>

      <button v-if="analysisData" 
              @click="handleStartAnalysis" 
              :disabled="boardStore.isAnalysisLoading"
              class="group mt-2 px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2.5 shadow-sm">
        <span class="inline-block group-hover:rotate-180 transition-transform duration-500">🔄</span>
        최신 데이터로 분석 갱신
      </button>
    </div>

    <div v-if="boardStore.isAnalysisLoading" class="py-12">
      <div class="text-center space-y-6 mb-12">
        <div class="relative inline-flex items-center justify-center">
          <div class="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="absolute text-3xl animate-pulse">🧠</span>
        </div>
        <div>
          <p class="text-2xl font-black text-slate-800 tracking-tight">AI 분석관이 민심을 읽고 있습니다...</p>
          <p class="text-slate-500 mt-2 font-medium">댓글의 문맥과 감성을 수치화하고 있습니다. (약 5~10초 소요)</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse opacity-50">
        <div class="aspect-square bg-slate-200 rounded-[3rem]"></div>
        <div class="space-y-6"><div v-for="i in 3" :key="i" class="h-28 bg-slate-200 rounded-3xl"></div></div>
      </div>
    </div>

    <div v-else-if="analysisData" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
      
      <div class="lg:col-span-5 lg:sticky lg:top-10">
        <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-100 relative group overflow-hidden">
          <div class="relative z-10">
            <div class="mb-10 text-center">
              <span class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5 block">AI Prediction Metrics</span>
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">여론 점유율 예측</h3>
            </div>
            
            <div class="relative aspect-square">
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-1 z-0">
                <div class="w-28 h-28 bg-white rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-slate-50 relative z-0">
                  <span class="text-[10px] font-bold text-slate-400 relative z-10 uppercase tracking-tighter">AI Consensus</span>
                  <span class="text-indigo-600 font-black text-3xl relative z-10 tracking-tight">LIVE</span>
                </div>
              </div>
              <canvas ref="chartCanvas" class="relative z-10"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-6">
        <div class="grid grid-cols-1 gap-5">
          <div v-for="(result, idx) in sortedResults" :key="idx" 
               class="group relative p-1 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-50"
               :class="idx === 0 ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-slate-200'">
            
            <div class="bg-white p-6 md:p-9 rounded-[2.3rem] flex flex-col gap-6">
              <div class="flex justify-between items-center gap-4">
                <div class="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                  <div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-lg md:text-xl shadow-inner border shrink-0"
                       :style="{ backgroundColor: getCandidateTheme(idx).bg, color: getCandidateTheme(idx).main, borderColor: getCandidateTheme(idx).border }">
                    {{ idx + 1 }}
                  </div>
                  <div class="flex-1 min-w-0 py-1">
                    <h4 class="font-black text-slate-900 text-xl md:text-2xl lg:text-3xl tracking-tight leading-snug break-keep">
                      {{ result.label }}
                    </h4>
                  </div>
                </div>
                <div class="text-right shrink-0 pl-4">
                  <span class="font-black text-4xl md:text-6xl tracking-tighter" :style="{ color: getCandidateTheme(idx).main }">
                    {{ result.supportRate.toFixed(1) }}<span class="text-lg md:text-2xl ml-0.5">%</span>
                  </span>
                </div>
              </div>

              <div class="relative w-full h-4 md:h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200/50">
                <div class="h-full rounded-full transition-all duration-[1500ms] ease-out relative"
                     :style="{ width: result.supportRate + '%', backgroundColor: getCandidateTheme(idx).main }">
                  <div class="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.6)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group border border-slate-800">
          <div class="absolute -right-10 -bottom-10 text-9xl opacity-10 group-hover:rotate-12 transition-transform duration-1000">📊</div>
          
          <div class="flex items-center gap-3 mb-8 border-b border-slate-800 pb-5">
            <div class="flex gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-amber-500"></div>
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span class="text-xs font-mono text-slate-500 uppercase tracking-widest ml-2">AI Commentary Engine v3.0</span>
          </div>
          
          <div class="space-y-6 font-medium leading-relaxed relative z-10">
            <p class="text-2xl text-white font-black flex items-center gap-3 tracking-tight">
              <span class="text-indigo-400 text-3xl animate-pulse">●</span> AI 분석관 리포트
            </p>
            
            <div v-if="analysisData.summary" class="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
              <p class="text-base md:text-xl text-slate-200 leading-relaxed break-keep italic">
                "{{ analysisData.summary }}"
              </p>
            </div>

            <div class="pt-2">
              <p v-if="insightData" class="text-slate-400 text-sm md:text-base break-keep">
                현재 지지율 1위인 <span class="text-white font-bold">{{ insightData.topCandidate }}</span> 후보는 
                2위 대비 <span class="text-indigo-400 font-bold">{{ insightData.ratio }}</span> 높은 선호도를 보이고 있으며, 
                <span v-if="insightData.isCloseMatch" class="text-amber-400 font-bold">근소한 차이로 선두를 지키고 있습니다.</span>
                <span v-else class="text-emerald-400 font-bold">확고한 우위를 점하며 민심을 주도하고 있습니다.</span>
              </p>
            </div>

            <span class="text-xs text-slate-600 block pt-4 border-t border-slate-800/50">
              ※ 본 분석은 실시간 댓글 50개의 문맥적 감성, 지지 키워드 빈도, 비꼬는 말투 등을 종합 분석한 결과입니다.
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-24 md:py-32 text-center bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100 space-y-8 shadow-sm">
      <div class="text-7xl grayscale opacity-30">🤔</div>
      <div class="space-y-3 px-6">
        <h3 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">아직 생성된 AI 리포트가 없습니다</h3>
        <p class="text-slate-500 font-medium">갈드컵 참전 유저들의 날카로운 댓글들을 AI가 정밀 분석해 드립니다.</p>
      </div>
      <button @click="handleStartAnalysis" 
              class="px-12 py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all">
        실시간 민심 분석 시작하기 🚀
      </button>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-5 pb-8">
      <button @click="router.back()" class="w-full sm:w-auto px-12 py-5 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-full border border-slate-200 transition-all active:scale-95 shadow-md">
        이전으로
      </button>
      <router-link :to="{ name: 'Board', params: { boardId }}" class="w-full sm:w-auto px-12 py-5 bg-slate-950 hover:bg-black text-white font-black rounded-full transition-all active:scale-95 shadow-lg">
        게시판 메인
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import Chart from 'chart.js/auto';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();

const boardId = computed(() => route.params.boardId);
const voteSessionId = computed(() => route.params.voteSessionId);

const chartCanvas = ref(null);
let chartInstance = null;

const analysisData = computed(() => boardStore.opinionAnalysis);

// 지지율(supportRate) 내림차순 정렬
const sortedResults = computed(() => {
  if (!analysisData.value?.results) return [];
  return [...analysisData.value.results].sort((a, b) => b.supportRate - a.supportRate);
});

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
  const themes = [
    { main: '#4F46E5', bg: '#F5F3FF', border: '#EDE9FE' }, // Indigo
    { main: '#E11D48', bg: '#FFF1F2', border: '#FFE4E6' }, // Rose
    { main: '#D97706', bg: '#FFFBEB', border: '#FEF3C7' }, // Amber
    { main: '#059669', bg: '#ECFDF5', border: '#D1FAE5' }, // Emerald
    { main: '#7C3AED', bg: '#F5F3FF', border: '#EDE9FE' }, // Violet
    { main: '#0891B2', bg: '#ECFEFF', border: '#CFFAFE' }, // Cyan
    { main: '#C026D3', bg: '#FDF4FF', border: '#FAE8FF' }, // Fuchsia
    { main: '#65A30D', bg: '#F7FEE7', border: '#ECFCCB' }, // Lime
    { main: '#0284C7', bg: '#F0F9FF', border: '#E0F2FE' }, // Sky
    { main: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' }, // Orange
  ];
  return themes[idx % themes.length];
};

/**
 * 도넛 차트 초기화
 */
const initChart = async () => {
  await nextTick();
  if (!chartCanvas.value || !analysisData.value) return;
  if (chartInstance) chartInstance.destroy();

  const ctx = chartCanvas.value.getContext('2d');
  const results = sortedResults.value;
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: results.map(r => r.label),
      datasets: [{
        data: results.map(r => r.supportRate),
        backgroundColor: results.map((_, i) => getCandidateTheme(i).main),
        borderWidth: 0,
        borderRadius: 20,
        spacing: 12,
        hoverOffset: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '82%',
      layout: { padding: 30 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: '#0f172a',
          padding: 15,
          cornerRadius: 15,
          callbacks: {
            label: (context) => ` 예측 점유율: ${context.raw.toFixed(1)}%`
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
};

const handleStartAnalysis = async () => {
  await boardStore.startOpinionAnalysis(boardId.value, voteSessionId.value);
};

onMounted(async () => {
  await boardStore.fetchOpinionAnalysis(boardId.value, voteSessionId.value);
  if (boardStore.opinionAnalysis) initChart();
});

watch(() => boardStore.opinionAnalysis, () => initChart(), { deep: true });
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.font-sans {
  word-break: keep-all;
  letter-spacing: -0.025em;
}
</style>