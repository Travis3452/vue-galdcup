<template>
  <div class="space-y-6 mb-12">
    <div v-if="isLoading" class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-50 animate-pulse">
      <div class="space-y-8">
        <div class="flex justify-between items-center">
          <div class="w-24 h-8 bg-slate-200 rounded-2xl"></div>
          <div class="w-10 h-10 bg-slate-100 rounded-full"></div>
        </div>
        
        <div class="flex flex-col items-center space-y-4">
          <div class="w-3/4 h-10 bg-slate-200 rounded-xl"></div>
          <div class="w-1/2 h-4 bg-slate-100 rounded-lg"></div>
        </div>

        <div class="flex items-center justify-center gap-8 py-4 flex-wrap">
          <div v-for="i in 2" :key="i" class="flex flex-col items-center w-40 md:w-48">
            <div class="w-full aspect-square bg-slate-200 rounded-[2rem] mb-4"></div>
            <div class="w-2/3 h-6 bg-slate-200 rounded-lg mb-4"></div>
            <div class="w-full h-3 bg-slate-100 rounded-full"></div>
          </div>
        </div>

        <div class="flex justify-center pt-6">
          <div class="w-48 h-16 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <div v-else-if="voteSession" class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-indigo-50 relative overflow-hidden text-center transition-all duration-500">
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <div class="relative z-10 space-y-8">
        <div class="flex items-center justify-between">
          <div v-if="voteStatus === 'UPCOMING'" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm border border-amber-100">
            <span class="relative flex h-3 w-3">
              <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Upcoming
          </div>
          <div v-else-if="voteStatus === 'LIVE'" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            LIVE
          </div>
          <div v-else 
               class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200">
            Finished
          </div>

          <button @click="toggleExpanded" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 transition-transform duration-300" :class="{'rotate-180': !isExpanded}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div class="space-y-2 cursor-pointer" @click="toggleExpanded">
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight transition-colors hover:text-indigo-600">
            {{ voteStatus === 'UPCOMING' ? '준비 중인 갈드컵' : '진행 중인 갈드컵' }}
          </h2>
          <p class="text-sm text-slate-400 font-bold">
            기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
          </p>
        </div>

        <div v-show="isExpanded" class="transition-all duration-500 origin-top">
          <div class="flex items-center justify-center gap-4 md:gap-12 py-4 flex-wrap" :class="{'grayscale opacity-70': voteStatus === 'UPCOMING'}">
            <template v-for="(opt, idx) in voteSession.options" :key="idx">
              <div class="flex flex-col items-center group w-40 md:w-48">
                <div class="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-xl mb-4 aspect-square w-full bg-slate-100 ring-1 ring-slate-100">
                  <img :src="opt.imageUrl || 'https://via.placeholder.com/300'"
                       :alt="opt.label"
                       class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>

                <span class="text-xl font-black text-slate-800 break-all mb-1">{{ opt.label }}</span>
                
                <div v-if="voteStatus !== 'UPCOMING'" class="mb-4">
                  <span class="text-lg font-black text-indigo-600">{{ (opt.count || 0).toLocaleString() }}표</span>
                </div>
                
                <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div class="bg-indigo-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                       :style="{ width: calculatePercentage(opt.count) + '%' }"></div>
                </div>
                <span class="text-sm font-bold text-indigo-600 mt-2">{{ Math.round(calculatePercentage(opt.count)) }}%</span>
              </div>
              
              <div v-if="idx < (voteSession.options?.length || 0) - 1" 
                   class="text-4xl md:text-6xl font-black text-red-600 italic animate-pulse mx-2 select-none">
                VS
              </div>
            </template>
          </div>

          <div class="flex flex-col items-center gap-6 pt-6">
            <button
              @click="onVoteClick"
              :disabled="voteStatus !== 'LIVE'"
              class="w-full md:w-auto px-16 py-5 rounded-2xl transition shadow-xl font-black text-xl transform hover:-translate-y-1 active:scale-95 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              :class="[
                voteStatus === 'LIVE' 
                ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' 
                : 'bg-slate-200 text-slate-400 shadow-none'
              ]"
            >
              투표 참여하기
            </button>

            <router-link 
              :to="{ name: 'VoteHistory', params: { boardId: boardId }}"
              class="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
            >
              <span class="group-hover:scale-110 transition-transform">📜</span>
              <span>지난 투표 결과가 궁금하신가요?</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-16 text-center space-y-6">
      <div class="text-5xl mb-2">🗳️</div>
      <div class="space-y-1">
        <p class="text-xl text-slate-400 font-bold italic">현재 진행 중인 갈드컵이 없습니다.</p>
        <p class="text-sm text-slate-300 font-medium">새로운 대결이 시작될 때까지 기다려주세요!</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <router-link 
          :to="{ name: 'VoteHistory', params: { boardId: boardId }}"
          class="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition transform hover:-translate-y-1"
        >
          📜 지난 투표 아카이브 보기
        </router-link>

        <button 
          v-if="isManager"
          @click="handleCreateVote"
          class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
        >
          새로운 갈드컵 생성
        </button>
      </div>
    </div>
    <div v-if="isManager && voteSession" class="bg-indigo-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white">⚙️</div>
        <h4 class="text-white font-bold tracking-tight text-lg">갈드컵 관리 도구</h4>
      </div>
      <div class="flex gap-3 w-full sm:w-auto">
        <button 
          v-if="!voteSession.isFinished" 
          @click="handleFinishVote"
          class="flex-1 sm:flex-none px-6 py-2 bg-red-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-red-600 transition transform active:scale-95"
        >
          투표 즉시 마감
        </button>
      </div>
    </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import { useUserStore } from '@/stores/user';
import api from '@/axios';
import { Client } from '@stomp/stompjs';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

const boardId = route.params.boardId;

// --- 1. 상태 관리 변수 ---
const isLoading = ref(true); // 스켈레톤 UI 제어
const isExpanded = ref(true); // 아코디언 확장 여부
let client = null; // 웹소켓 클라이언트

// --- 2. Computed 데이터 (템플릿에서 직접 참조됨) ---
const voteSession = computed(() => boardStore.currentVoteSession);
const isManager = computed(() => boardStore.isBoardManager);

// 투표 상태 계산 (UPCOMING, LIVE, FINISHED)
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

// --- 3. 유틸리티 함수 ---
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
};

// ✨ [NaN 방지] 퍼센트 계산 로직
const calculatePercentage = (count) => {
  if (!voteSession.value?.options) return 0;
  // 모든 count를 숫자로 변환하여 합계 계산 (문자열 결합 방지)
  const total = voteSession.value.options.reduce((acc, cur) => acc + Number(cur.count || 0), 0);
  if (total === 0) return 0;
  return (Number(count || 0) / total) * 100;
};

// --- 4. WebSocket (실시간 통계) 로직 ---
const connectWebSocket = () => {
  if (!voteSession.value || voteSession.value.isFinished || client) return;

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const socketURL = baseURL.replace(/^http/, 'ws') + '/ws-galdcup';

  client = new Client({
    brokerURL: socketURL,
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('실시간 통계 구독 성공');
      client.subscribe(`/topic/votes/${voteSession.value.id}`, (message) => {
        if (message.body) {
          const countsMap = JSON.parse(message.body);
          if (boardStore.currentVoteSession?.options) {
            boardStore.currentVoteSession.options.forEach((opt, index) => {
              if (countsMap[index] !== undefined) {
                opt.count = countsMap[index];
              }
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

// --- 5. 이벤트 핸들러 ---
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const handleCreateVote = () => {
  router.push({ name: 'CreateVoteSession', params: { boardId: boardId } });
};

const handleFinishVote = async () => {
  if (!confirm("현재 투표를 마감하고 정산하시겠습니까?")) return;
  try {
    await api.post(`/boards/${boardId}/vote-session/${voteSession.value.id}/finish`);
    alert("투표가 종료되었습니다.");
    await boardStore.fetchVoteSession(boardId);
  } catch (error) {
    alert(error.response?.data?.message || "마감 처리에 실패했습니다.");
  }
};

const onVoteClick = () => {
  if (voteStatus.value !== 'LIVE') return;
  const width = 800;
  const height = 800;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(`/boards/${boardId}/votes/${voteSession.value.id}`, '_blank', 
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
};

// --- 6. 생명주기 및 감시자 ---
watch(voteStatus, (newVal) => {
  if (newVal === 'LIVE') {
    isExpanded.value = true;
    connectWebSocket();
  } else {
    disconnectWebSocket();
  }
}, { immediate: true });

onMounted(async () => {
  if (boardId) {
    isLoading.value = true;
    try {
      await Promise.all([
        boardStore.fetchBoardPolicy(boardId),
        boardStore.fetchVoteSession(boardId)
      ]);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    } finally {
      // 자연스러운 전환을 위해 아주 짧은 지연 후 로딩 종료
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    }
  }
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>