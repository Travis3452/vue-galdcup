<template>
  <main class="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-4 md:p-10 flex items-center justify-center font-sans">
    
    <div class="w-full max-w-3xl bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-14 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-48 h-48 md:w-72 md:h-72 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-8 md:space-y-10">
        
        <div class="text-center space-y-3 md:space-y-4 mb-6 md:mb-10 border-b-2 border-slate-100 pb-6 md:pb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-100 text-indigo-600 text-3xl md:text-4xl shadow-inner mb-1 border-4 border-white">
            <span class="transform -translate-y-0.5">🏆</span>
          </div>
          <h1 class="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            새로운 갈드컵 열기
          </h1>
          <p class="text-sm md:text-lg font-bold text-slate-500 px-2">
            당신만의 흥미로운 논쟁거리를 던져보세요!
          </p>
        </div>

        <div class="space-y-6 md:space-y-8 bg-slate-50 p-5 md:p-10 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
          
          <div class="space-y-2 md:space-y-3">
            <label class="text-sm md:text-base font-extrabold text-slate-700 flex items-center gap-2">
              <span class="text-indigo-500">📌</span> 갈드컵 주제
            </label>
            <input 
              v-model="topic"
              type="text"
              placeholder="예) 짜장면 vs 짬뽕"
              class="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-4 py-4 md:px-6 md:py-5 text-base md:text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              @keyup.enter="handleCreateBoard"
            />
          </div>

          <div class="space-y-2 md:space-y-3">
            <div class="flex justify-between items-center px-1">
              <label class="text-sm md:text-base font-extrabold text-slate-700 flex items-center gap-2">
                <span class="text-indigo-500">📝</span> 상세 설명
              </label>
              <span :class="['text-[10px] md:text-xs font-bold', description.length < 5 ? 'text-rose-500' : 'text-slate-400']">
                {{ description.length }} / 200
              </span>
            </div>
            <textarea 
              v-model="description"
              rows="4"
              placeholder="배경 설명을 5자 이상 입력해주세요."
              class="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-4 py-4 md:px-6 md:py-5 text-sm md:text-base font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm resize-none"
              :class="{'border-rose-300 ring-1 ring-rose-100': errorMessage && description.length < 5}"
            ></textarea>
          </div>
          
          <div v-if="errorMessage" class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 md:px-6 md:py-4 rounded-xl flex items-center gap-2 text-xs md:text-sm font-bold animate-pulse">
            <span>⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>
          
        </div>

        <div class="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4">
          <button 
            @click="router.back()"
            :disabled="isSubmitting"
            class="px-8 py-3.5 md:py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-slate-50 transition w-full sm:w-auto disabled:opacity-50"
          >
            취소
          </button>
          
          <button 
            @click="handleCreateBoard"
            :disabled="isSubmitting || description.length < 5 || !topic.trim()"
            class="relative flex items-center justify-center gap-2 px-10 py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 w-full sm:w-auto"
          >
            <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span>{{ isSubmitting ? '개최 중...' : '갈드컵 열기' }}</span>
          </button>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'

const router = useRouter()

const topic = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

watch([topic, description], () => {
  errorMessage.value = ''
})

async function handleCreateBoard() {
  if (isSubmitting.value) return
  errorMessage.value = ''
  
  if (!topic.value.trim()) {
    errorMessage.value = '주제를 입력해주세요.'
    return
  }
  if (description.value.length < 5) {
    errorMessage.value = '설명을 5자 이상 입력해주세요.'
    return
  }

  isSubmitting.value = true
  try {
    const res = await api.post('/boards', {
      topic: topic.value.trim(),
      description: description.value.trim()
    })
    const newBoardId = res.data.id || res.data
    router.push(`/boards/${newBoardId}`)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '생성에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>