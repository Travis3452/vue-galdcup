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

        <div class="space-y-1 md:space-y-2 cursor-pointer text-center" @click="isExpanded = !isExpanded">
          <h2 class="text-xl md:text-5xl font-black text-slate-800 tracking-tighter hover:text-indigo-600 transition-colors leading-tight">
            {{ voteStatus === 'UPCOMING' ? '준비 중인 갈드컵' : '진행 중인 갈드컵' }}
          </h2>
          <div class="flex flex-col items-center gap-0.5">
            <p class="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">진행 기간</p>
            <p class="text-xs md:text-sm text-slate-500 font-bold">
              {{ formatDateTime(voteSession.startTime) }} ~ {{ formatDateTime(voteSession.endTime) }}
            </p>
          </div>
        </div>

        <div v-show="isExpanded" class="transition-all duration-500">
          <div :class="layoutClass" class="py-4 md:py-8">
            <template v-for="(opt, idx) in voteSession.options" :key="idx">
              
              <div v-if="isDuel" class="flex flex-col items-center group w-[40%] md:w-full md:max-w-[200px]">
                <div class="relative w-full aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-white shadow-lg md:shadow-2xl mb-3 md:mb-6 ring-1 ring-slate-100">
                  <img :src="opt.imageUrl || 'https://via.placeholder.com/300'" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div v-if="voteStatus === 'LIVE'" class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-4">
                      <span class="text-white font-black text-sm md:text-xl">{{ calculatePercentage(opt.count).toFixed(0) }}%</span>
                  </div>
                </div>
                <span class="text-sm md:text-2xl font-black text-slate-800 mb-1 truncate w-full text-center px-1">{{ opt.label }}</span>
                <span v-if="voteStatus !== 'UPCOMING'" class="text-[10px] md:text-lg text-indigo-600 font-black">{{ (opt.count || 0).toLocaleString() }}표</span>
              </div>

              <div v-else class="w-full max-w-2xl mx-auto flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-xl md:rounded-[1.5rem] hover:shadow-md transition">
                <div class="w-6 md:w-10 text-center font-black text-slate-300 text-xs md:text-base">#{{ idx + 1 }}</div>
                <img :src="opt.imageUrl || 'https://via.placeholder.com/100'" class="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl object-cover shadow-sm" />
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-end mb-1 md:mb-2">
                    <span class="font-black text-slate-700 text-xs md:text-base truncate pr-2">{{ opt.label }}</span>
                    <span class="text-[10px] md:text-xs font-black text-indigo-600 shrink-0">{{ opt.count.toLocaleString() }}표</span>
                  </div>
                  <div class="w-full h-1.5 md:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" :style="{ width: calculatePercentage(opt.count) + '%' }"></div>
                  </div>
                </div>
              </div>

              <div v-if="isDuel && idx === 0" class="text-2xl md:text-7xl font-black italic text-red-600 animate-pulse select-none px-2">VS</div>
            </template>
          </div>

          <div class="flex flex-col items-center gap-4 md:gap-6 pt-6 md:pt-10">
            <button @click="onVoteClick" :disabled="voteStatus !== 'LIVE'" 
                    class="w-full md:w-auto md:px-20 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] font-black text-lg md:text-2xl shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30"
                    :class="voteStatus === 'LIVE' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400'">
              투표 참여하기
            </button>
            <router-link :to="{ name: 'VoteHistory', params: { boardId }}" class="text-xs md:text-sm text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition">
              <span>📜 지난 투표 결과 보기</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[2.5rem] py-10 md:py-16 text-center space-y-4 md:space-y-6 px-4">
      <div class="text-3xl md:text-5xl mb-2">🗳️</div>
      <p class="text-base md:text-xl text-slate-400 font-bold italic">현재 진행 중인 갈드컵이 없습니다.</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <router-link :to="{ name: 'VoteHistory', params: { boardId: boardId }}" class="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-sm md:text-lg shadow-sm border border-indigo-100">
          📜 지난 투표 결과 보기
        </router-link>
        <button v-if="isManager" @click="handleCreateVote" class="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm md:text-lg shadow-lg">
          새로운 갈드컵 생성
        </button>
      </div>
    </div>

    <div v-if="isManager && voteSession" class="bg-indigo-900 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
      <div class="flex items-center gap-3 self-start sm:self-center">
        <div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white text-sm">⚙️</div>
        <h4 class="text-white font-bold tracking-tight text-sm md:text-lg">갈드컵 관리 도구</h4>
      </div>
      <button v-if="!voteSession.isFinished" @click="handleFinishVote" class="w-full sm:w-auto px-5 py-2 bg-red-500 text-white text-xs md:text-sm font-bold rounded-lg shadow-md hover:bg-red-600 transition">
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