<template>
  <div class="space-y-6 mb-12">
    <div v-if="voteSession" class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-indigo-50 relative overflow-hidden text-center">
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <div class="relative z-10 space-y-8">
        
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

        <div class="space-y-2">
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            {{ voteStatus === 'UPCOMING' ? '준비 중인 갈드컵' : '진행 중인 갈드컵' }}
          </h2>
          <p class="text-sm text-slate-400 font-bold">
            기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
          </p>
        </div>

        <div class="flex items-center justify-center gap-4 md:gap-12 py-4 flex-wrap" :class="{'grayscale opacity-70': voteStatus === 'UPCOMING'}">
          <template v-for="(opt, idx) in voteSession.options" :key="idx">
            <div class="flex flex-col items-center group w-40 md:w-48">
              <div class="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-xl mb-4 aspect-square w-full bg-slate-100 ring-1 ring-slate-100">
                <img :src="opt.imageUrl || 'https://via.placeholder.com/300'"
                     :alt="opt.label"
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                
                <div v-if="voteStatus !== 'UPCOMING'" class="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white py-2">
                  <div class="text-xs font-bold opacity-80 uppercase tracking-tighter">Current</div>
                  <div class="text-lg font-black">{{ opt.count.toLocaleString() }}표</div>
                </div>
              </div>
              <span class="text-xl font-black text-slate-800 break-all">{{ opt.label }}</span>
              
              <div class="w-full h-3 bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-50">
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

        <div class="flex justify-center pt-6">
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
        </div>
      </div>
    </div>

    <div v-else class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-20 text-center space-y-6">
      <div class="text-5xl mb-4">🗳️</div>
      <p class="text-xl text-slate-400 font-bold italic">현재 진행 중인 갈드컵이 없습니다.</p>
      <button 
        v-if="isManager"
        @click="handleCreateVote"
        class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
      >
        새로운 갈드컵 생성
      </button>
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
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import { useUserStore } from '@/stores/user';
import api from '@/axios';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

const boardId = route.params.boardId;

const voteSession = computed(() => boardStore.currentVoteSession);
const isManager = computed(() => boardStore.isBoardManager);

// 투표 상태 판별 (UPCOMING, LIVE, FINISHED)
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

const handleCreateVote = () => {
  router.push(`/boards/${boardId}/createVoteSession`);
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
  const url = `/boards/${boardId}/vote-session/${voteSession.value.id}/vote`;
  window.open(url, '_blank', 'width=800,height=600,scrollbars=yes');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
};

const calculatePercentage = (count) => {
  if (!voteSession.value || !voteSession.value.options) return 0;
  const total = voteSession.value.options.reduce((acc, cur) => acc + cur.count, 0);
  return total === 0 ? 0 : (count / total) * 100;
};

onMounted(async () => {
  if (boardId) {
    await Promise.all([
      boardStore.fetchBoardPolicy(boardId),
      boardStore.fetchVoteSession(boardId)
    ]);
  }
});
</script>

<style scoped>
.grayscale {
  filter: grayscale(1);
}
.italic {
  font-style: italic;
  text-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
}
</style>