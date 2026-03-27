<template>
  <div class="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-3 md:p-6 font-sans overflow-x-hidden">
    
    <div class="w-full max-w-2xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl p-5 md:p-10 border border-indigo-50 relative flex flex-col max-h-[95dvh] overflow-y-auto scrollbar-hide">
      
      <div class="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-48 h-48 md:w-64 md:h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-6 md:space-y-8">
        
        <div v-if="isLoading" class="animate-pulse space-y-6 md:space-y-8">
          <div class="text-center space-y-3">
            <div class="mx-auto w-12 h-12 bg-slate-200 rounded-2xl"></div>
            <div class="mx-auto w-40 h-7 bg-slate-200 rounded-xl"></div>
            <div class="mx-auto w-full max-w-[200px] h-4 bg-slate-100 rounded-full"></div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:gap-6">
            <div v-for="i in 2" :key="i" class="flex flex-col items-center">
              <div class="w-full aspect-square bg-slate-200 rounded-2xl md:rounded-[2rem]"></div>
              <div class="w-2/3 h-4 bg-slate-200 rounded-lg mt-3"></div>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <div class="w-full h-14 bg-slate-200 rounded-xl"></div>
          </div>
        </div>

        <template v-else>
          <div class="text-center space-y-2 md:space-y-3">
            <div class="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-600 text-white text-xl md:text-2xl shadow-lg mb-1">
              🗳️
            </div>
            <h1 class="text-xl md:text-3xl font-black text-slate-800 tracking-tight">당신의 선택은?</h1>
            
            <div v-if="voteSession" class="px-3 py-1.5 bg-slate-50 rounded-full inline-flex items-center justify-center">
              <p class="text-[10px] md:text-xs font-bold text-slate-400 leading-tight">
                📅 {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
              </p>
            </div>
          </div>

          <div v-if="voteSession" class="grid grid-cols-2 gap-3 md:gap-6">
            <div
              v-for="(opt, idx) in voteSession.options"
              :key="idx"
              @click="selectedOptionIndex = idx"
              class="group relative flex flex-col items-center cursor-pointer"
            >
              <div 
                class="relative w-full aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden border-[3px] md:border-4 transition-all duration-300 shadow-sm md:shadow-md"
                :class="selectedOptionIndex === idx ? 'border-indigo-600 ring-4 ring-indigo-50 scale-[1.02] md:scale-105' : 'border-white hover:border-indigo-200'"
              >
                <img
                  :src="opt.imageUrl || 'https://via.placeholder.com/300'"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div v-if="selectedOptionIndex === idx" class="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-[1px]">
                  <div class="bg-indigo-600 text-white w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-lg animate-pop">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="mt-2 md:mt-3 w-full text-center px-1">
                <span class="text-sm md:text-lg font-black text-slate-700 block truncate" :class="{'text-indigo-600': selectedOptionIndex === idx}">
                  {{ opt.label }}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button
              @click="submitVote"
              :disabled="selectedOptionIndex === null || isSubmitting"
              class="w-full py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50"
            >
              {{ isSubmitting ? '처리 중...' : '투표 제출하기' }}
            </button>
            <button 
              @click="closePopup" 
              class="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition text-xs md:text-sm"
            >
              다음에 할게요 (닫기)
            </button>
          </div>
        </template>
        
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
const isLoading = ref(true)

// 팝업 닫기 로직
const closePopup = () => {
  if (window.opener && !window.opener.closed) {
    window.close();
  } else {
    if (confirm("투표창을 닫으시겠습니까?")) {
      window.close() || history.back();
    }
  }
};

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 1. 투표 세션 정보 가져오기 (기존과 동일하지만 응답 구조에 맞게 처리)
async function fetchVoteSession() {
  isLoading.value = true
  try {
    const res = await api.get(`/boards/${route.params.boardId}/vote-session`)
    // Optional로 감싸져서 올 경우 .data 혹은 .data.value 체크가 필요할 수 있음
    voteSession.value = res.data; 
  } catch (err) {
    console.error('투표 정보 로드 실패', err)
  } finally {
    setTimeout(() => { isLoading.value = false }, 300)
  }
}

// 2. 수정된 API 경로에 따른 투표 제출 함수
async function submitVote() {
  if (selectedOptionIndex.value === null || isSubmitting.value) return
  
  const boardId = route.params.boardId;
  const voteSessionId = voteSession.value?.id;

  if (!boardId || !voteSessionId) {
    alert("투표 세션 정보를 찾을 수 없습니다.");
    return;
  }

  isSubmitting.value = true
  try {
    // ✅ 수정된 경로: /api/boards/{boardId}/vote-session/{voteSessionId}/votes
    await api.post(`/boards/${boardId}/vote-session/${voteSessionId}/votes`, {
      selectedOptionIndex: selectedOptionIndex.value
      // voteSessionId는 이제 URL 경로에 포함되므로 body에서는 제거해도 됩니다.
    })

    alert('🎉 투표가 성공적으로 완료되었습니다!')
    if (window.opener) window.opener.location.reload()
    window.close()
  } catch (err) {
    // 에러 메시지 처리 (429 Too Many Requests 등)
    const errorMsg = err.response?.data?.message || '이미 투표하셨거나 오류가 발생했습니다.';
    alert(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchVoteSession)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* 선택 시 팡! 터지는 효과 */
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 폼 입력창 자동 줌 방지 (iOS) */
input, select, textarea {
  font-size: 16px !important;
}
</style>