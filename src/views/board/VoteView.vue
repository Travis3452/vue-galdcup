<template>
  <div class="h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
    
    <div class="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-indigo-50 relative overflow-y-auto max-h-full scrollbar-hide">
      
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-8">
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl shadow-lg mb-1">
            🗳️
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">당신의 선택은?</h1>
          <p v-if="voteSession" class="text-xs font-bold text-slate-400 bg-slate-100 py-1.5 px-4 rounded-full inline-block">
            📅 기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
          </p>
        </div>

        <div v-if="voteSession" class="grid grid-cols-2 gap-4 md:gap-6">
          <div
            v-for="(opt, idx) in voteSession.options"
            :key="idx"
            @click="selectedOptionIndex = idx"
            class="group relative flex flex-col items-center cursor-pointer"
          >
            <div 
              class="relative w-full aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 transition-all duration-300 shadow-md"
              :class="selectedOptionIndex === idx ? 'border-indigo-600 ring-4 ring-indigo-100 scale-105' : 'border-white hover:border-indigo-200'"
            >
              <img
                :src="opt.imageUrl || 'https://via.placeholder.com/300'"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div v-if="selectedOptionIndex === idx" class="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-[2px]">
                <div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <span class="text-base md:text-lg font-black text-slate-700 transition-colors" :class="{'text-indigo-600': selectedOptionIndex === idx}">
                {{ opt.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-2 flex flex-col gap-2">
          <button
            @click="submitVote"
            :disabled="selectedOptionIndex === null || isSubmitting"
            class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {{ isSubmitting ? '투표 처리 중...' : '투표 제출하기' }}
          </button>
          <button 
            @click="closePopup" 
            class="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition text-sm"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'

const route = useRoute()
const voteSession = ref(null)
const selectedOptionIndex = ref(null)
const isSubmitting = ref(false)
const closePopup = () => {
  if (window.opener && !window.opener.closed) {
    window.close();
  } else {
    alert("브라우저 보안 설정으로 인해 창을 자동으로 닫을 수 없습니다. 탭을 직접 닫아주세요.");
    self.close();
  }
};

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

async function fetchVoteSession() {
  try {
    const res = await api.get(`/boards/${route.params.boardId}/vote-session`)
    voteSession.value = res.data
  } catch (err) {
    console.error('투표 세션 불러오기 실패', err)
  }
}

async function submitVote() {
  if (selectedOptionIndex.value === null || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await api.post('/votes', {
      voteSessionId: voteSession.value.id,
      selectedOptionIndex: selectedOptionIndex.value
    })
    alert('🎉 투표가 완료되었습니다!')
    if (window.opener) window.opener.location.reload()
    window.close()
  } catch (err) {
    alert(err.response?.data?.message || '투표 처리 중 오류 발생')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchVoteSession)
</script>

<style scoped>
/* 스크롤바 숨기기 (내용이 길어질 경우 대비) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce {
  animation: bounce 1s infinite;
}
</style>