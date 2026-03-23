<template>
  <div class="w-full space-y-4 md:space-y-6 mb-8 md:mb-12 font-sans">
    
    <div v-if="voteSession" 
         class="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl p-5 md:p-12 border border-indigo-50 relative overflow-hidden transition-all duration-700"
         :class="{'bg-gradient-to-r from-red-50/30 to-blue-50/30': isDuel}">
      
      <div v-if="isDuel" class="absolute inset-0 flex pointer-events-none opacity-50 md:opacity-100">
        <div class="flex-1 bg-red-500/5 blur-[60px] md:blur-[120px] -translate-x-1/2"></div>
        <div class="flex-1 bg-blue-500/5 blur-[60px] md:blur-[120px] translate-x-1/2"></div>
      </div>

      <div class="relative z-10 space-y-6 md:space-y-8">
        <div class="flex items-center justify-between">
          <div :class="statusBadgeClass" class="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest shadow-sm border">
            <span class="relative flex h-2 w-2 md:h-3 md:w-3">
              <span v-if="voteStatus === 'LIVE'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3" :class="statusDotClass"></span>
            </span>
            {{ voteStatus }}
          </div>

          <button @click="isExpanded = !isExpanded" class="p-1 md:p-2 text-slate-400 hover:text-indigo-600 rounded-full transition-transform" :class="{'rotate-180': !isExpanded}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col items-center space-y-3 md:space-y-5 text-center cursor-pointer group px-4 py-2" @click="isExpanded = !isExpanded">
          
          <h2 class="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight break-keep px-2 transition-all duration-300 group-hover:scale-[1.02]"
              :class="isDuel ? 'bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 bg-clip-text text-transparent' : 'text-slate-800 group-hover:text-indigo-600'">
            {{ voteSession.topic }}
          </h2>
          
          <div v-if="voteSession.description" class="max-w-2xl mt-1">
            <p class="text-sm md:text-base text-slate-600 font-medium px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm inline-block">
              <span class="text-indigo-400 mr-1">💡</span> {{ voteSession.description }}
            </p>
          </div>

          <div class="flex flex-col items-center gap-1 pt-3 md:pt-4">
            <p class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-2 rounded-full shadow-sm border border-slate-100">
              진행 기간
            </p>
            <p class="text-xs md:text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full">
              {{ formatDateTime(voteSession.startTime) }} ~ {{ formatDateTime(voteSession.endTime) }}
            </p>
          </div>
        </div>

        <div v-show="isExpanded" class="transition-all duration-500">
          <div :class="layoutClass" class="py-4 md:py-8">
            <template v-for="(opt, idx) in voteSession.options" :key="idx">
              
              <div v-if="isDuel" class="flex flex-col items-center group w-[45%] md:w-full md:max-w-[280px]">
                <div class="relative w-full aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-white shadow-lg md:shadow-2xl mb-3 md:mb-6 ring-1 ring-slate-100 bg-slate-50 flex items-center justify-center">
                  <img v-if="opt.imageUrl" :src="opt.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div v-else class="text-slate-300">
                    <svg class="w-16 h-16 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  
                  <div v-if="voteStatus === 'LIVE'" class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-3 px-3 md:p-6 flex flex-col items-center">
                      <span class="text-white font-black text-lg md:text-3xl drop-shadow-md">{{ calculatePercentage(opt.count).toFixed(0) }}%</span>
                  </div>
                </div>
                
                <div class="w-full px-2 text-center" :title="opt.label">
                  <span class="text-sm md:text-xl font-black text-slate-800 break-keep leading-snug" 
                        :class="expandedTextIndex === idx ? '' : 'line-clamp-3'"
                        @click="toggleTextExpand(idx)">
                    {{ opt.label }}
                  </span>
                  <div v-if="opt.label.length > 30" @click="toggleTextExpand(idx)" class="text-[10px] md:text-xs text-slate-400 mt-1 cursor-pointer hover:text-indigo-500">
                    {{ expandedTextIndex === idx ? '접기 ▲' : '더보기 ▼' }}
                  </div>
                </div>

                <span v-if="voteStatus !== 'UPCOMING'" class="mt-2 text-[11px] md:text-base text-indigo-600 font-black bg-indigo-50 px-3 py-1 rounded-full">{{ (opt.count || 0).toLocaleString() }}표</span>
              </div>

              <div v-else class="w-full max-w-2xl mx-auto flex items-stretch gap-3 md:gap-5 p-3 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-[1.5rem] shadow-sm hover:shadow-md transition group">
                <div class="w-6 md:w-10 flex flex-col items-center justify-center font-black text-slate-300 text-xs md:text-base shrink-0">#{{ idx + 1 }}</div>
                
                <div class="w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-lg md:rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                  <img v-if="opt.imageUrl" :src="opt.imageUrl" class="w-full h-full object-cover" />
                  <svg v-else class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>

                <div class="flex-1 min-w-0 flex flex-col justify-center py-1">
                  <div class="flex justify-between items-start mb-2 md:mb-3 gap-2">
                    <div class="flex-1 min-w-0 cursor-pointer" @click="toggleTextExpand(idx)" :title="opt.label">
                      <span class="font-bold text-slate-700 text-sm md:text-base break-keep leading-tight block"
                            :class="expandedTextIndex === idx ? '' : 'line-clamp-2 md:line-clamp-1'">
                        {{ opt.label }}
                      </span>
                    </div>
                    <span class="text-[10px] md:text-sm font-black text-indigo-600 shrink-0 bg-indigo-50 px-2.5 py-1 rounded-lg">{{ (opt.count || 0).toLocaleString() }}표</span>
                  </div>
                  
                  <div class="w-full h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden mt-auto">
                    <div class="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000 relative" :style="{ width: calculatePercentage(opt.count) + '%' }">
                      <div class="absolute inset-0 bg-white/20" style="background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent); background-size: 1rem 1rem;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isDuel && idx === 0" class="text-3xl md:text-7xl font-black italic text-slate-200 animate-pulse select-none px-2 tracking-tighter self-center">VS</div>
            </template>
          </div>

          <div class="flex flex-col items-center gap-4 md:gap-6 pt-6 md:pt-10 border-t border-slate-100 mt-4">
            <button @click="onVoteClick" :disabled="voteStatus !== 'LIVE'" 
                    class="w-full md:w-auto md:px-24 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                    :class="voteStatus === 'LIVE' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400'">
              {{ voteStatus === 'UPCOMING' ? '투표 시작 전입니다' : (voteStatus === 'FINISHED' ? '종료된 투표입니다' : '투표 참여하기 🚀') }}
            </button>
            
            <router-link :to="{ name: 'VoteHistory', params: { boardId }}" class="text-xs md:text-sm text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition group">
              <span class="group-hover:-translate-x-1 transition-transform">📜</span> 지난 투표 결과 보기
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white/50 backdrop-blur border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[2.5rem] py-16 md:py-24 text-center space-y-6 px-4">
      <div class="text-4xl md:text-6xl mb-4 opacity-50">🗳️</div>
      <p class="text-lg md:text-2xl text-slate-400 font-black tracking-tight">현재 진행 중인 갈드컵이 없습니다.</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
        <router-link :to="{ name: 'VoteHistory', params: { boardId: boardId }}" class="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 hover:text-indigo-600 rounded-xl font-black text-sm md:text-base shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
          📜 지난 투표 보기
        </router-link>
        <button v-if="isManager" @click="handleCreateVote" class="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm md:text-base shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
          ✨ 새로운 갈드컵 생성
        </button>
      </div>
    </div>

    <div v-if="isManager && voteSession" class="bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
      <div class="flex items-center gap-3 self-start sm:self-center">
        <div class="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-sm shadow-inner">⚙️</div>
        <h4 class="text-white font-bold tracking-tight text-sm md:text-base">매니저 관리 도구</h4>
      </div>
      <button v-if="!voteSession.isFinished" @click="handleFinishVote" class="w-full sm:w-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-lg shadow-md transition-colors">
        투표 즉시 마감
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import { useUserStore } from '@/stores/user';
import api from '@/axios';
import { Client } from '@stomp/stompjs';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

// 💡 상태 및 초기화
const isExpanded = ref(true);
let client = null;

// 💡 데이터 참조 (Store)
const boardId = computed(() => route.params.boardId);
const voteSession = computed(() => boardStore.activeVoteSession);

// 💡 하이브리드 레이아웃 판단 (2명일 때 Duel 모드)
const isDuel = computed(() => voteSession.value?.options?.length === 2);

// 💡 매니저 권한 체크
const isManager = computed(() => {
  const managerId = boardStore.currentPolicy?.boardManager?.id;
  if (!managerId || !userStore.id) return false;
  return Number(managerId) === Number(userStore.id);
});

// 💡 투표 상태 계산 (UPCOMING / LIVE / FINISHED)
const voteStatus = computed(() => {
  if (!voteSession.value) return null;
  if (voteSession.value.isFinished) return 'FINISHED';
  
  const now = new Date();
  const start = new Date(voteSession.value.startTime);
  const end = new Date(voteSession.value.endTime);
  
  if (now < start) return 'UPCOMING';
  if (now > end) return 'FINISHED';
  return 'LIVE';
});

// 💡 확장된 텍스트 인덱스 관리 (어떤 선택지가 클릭되어 확장되었는지 추적)
const expandedTextIndex = ref(null);
const toggleTextExpand = (index) => {
  expandedTextIndex.value = expandedTextIndex.value === index ? null : index;
};

/** * 레이아웃 및 스타일 동적 계산 
 */
const layoutClass = computed(() => {
  return isDuel.value 
    ? 'flex items-center justify-center gap-4 md:gap-12 flex-wrap' 
    : 'flex flex-col gap-4 max-w-2xl mx-auto';
});

const statusBadgeClass = computed(() => {
  if (voteStatus.value === 'UPCOMING') return 'bg-amber-50 text-amber-600 border-amber-100';
  if (voteStatus.value === 'LIVE') return 'bg-red-50 text-red-600 border-red-100';
  return 'bg-slate-100 text-slate-500 border-slate-200';
});

const statusDotClass = computed(() => {
  if (voteStatus.value === 'UPCOMING') return 'bg-amber-500';
  if (voteStatus.value === 'LIVE') return 'bg-red-600';
  return 'bg-slate-400';
});

/**
 * 유틸리티 함수
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
};

const calculatePercentage = (count) => {
  if (!voteSession.value?.options) return 0;
  const total = voteSession.value.options.reduce((acc, cur) => acc + Number(cur.count || 0), 0);
  return total === 0 ? 0 : (Number(count || 0) / total) * 100;
};

/**
 * 🛰️ WebSocket 실시간 통계 연결
 */
const connectWebSocket = () => {
  if (!voteSession.value || voteSession.value.isFinished || client) return;

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const socketURL = baseURL.replace(/^http/, 'ws') + '/ws-galdcup';

  client = new Client({
    brokerURL: socketURL,
    reconnectDelay: 5000,
    onConnect: () => {
      // 투표 세션별 토픽 구독
      client.subscribe(`/topic/votes/${voteSession.value.id}`, (message) => {
        if (message.body) {
          const countsMap = JSON.parse(message.body);
          if (boardStore.activeVoteSession?.options) {
            boardStore.activeVoteSession.options.forEach((opt, index) => {
              if (countsMap[index] !== undefined) opt.count = countsMap[index];
            });
          }
        }
      });
    }
  });
  client.activate();
};

const disconnectWebSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
  }
};

/**
 * 액션 핸들러
 */
const handleCreateVote = () => {
  router.push({ name: 'CreateVoteSession', params: { boardId: boardId.value } });
};

const handleFinishVote = async () => {
  if (!confirm("현재 투표를 즉시 마감하시겠습니까?")) return;
  try {
    await api.post(`/boards/${boardId.value}/vote-session/${voteSession.value.id}/finish`);
    alert("투표가 종료되었습니다.");
    await boardStore.fetchActiveVoteSession(boardId.value);
  } catch (error) {
    alert(error.response?.data?.message || "마감 처리에 실패했습니다.");
  }
};

const onVoteClick = () => {
  if (voteStatus.value !== 'LIVE') return;
  const width = 800;
  const height = 900;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(
    `/boards/${boardId.value}/votes/${voteSession.value.id}`, 
    '_blank', 
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
};

/**
 * 감시자 및 라이프사이클
 */
watch(voteStatus, (newVal) => {
  if (newVal === 'LIVE') {
    isExpanded.value = true;
    connectWebSocket();
  } else {
    disconnectWebSocket();
  }
}, { immediate: true });

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped>
/* 모바일에서 수평 스크롤이 생기지 않도록 방지 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>