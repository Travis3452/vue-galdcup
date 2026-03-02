<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 flex items-center justify-center font-sans">
    
    <div class="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-32 -right-32 w-72 h-72 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-10">
        
        <div class="text-center space-y-4 mb-10 border-b-2 border-slate-100 pb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 text-4xl shadow-inner mb-2 border-4 border-white">
            <span class="transform -translate-y-1">🏆</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            새로운 갈드컵 열기
          </h1>
          <p class="text-lg font-bold text-slate-500">
            당신만의 흥미로운 논쟁거리를 세상에 던져보세요!
          </p>
        </div>

        <div class="space-y-8 bg-slate-50 p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
          
          <div class="space-y-3">
            <label class="text-base font-extrabold text-slate-700 flex items-center gap-2">
              <span class="text-indigo-500">📌</span> 갈드컵 주제
            </label>
            <input 
              v-model="topic"
              type="text"
              placeholder="예) 평생 한 가지만 먹어야 한다면? 짜장면 vs 짬뽕"
              class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-lg font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
              @keyup.enter="handleCreateBoard"
            />
          </div>

          <div class="space-y-3">
            <label class="text-base font-extrabold text-slate-700 flex items-center gap-2">
              <span class="text-indigo-500">📝</span> 상세 설명
            </label>
            <textarea 
              v-model="description"
              rows="4"
              placeholder="이 갈드컵의 룰이나 배경을 자유롭게 설명해주세요."
              class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-base font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm resize-none"
            ></textarea>
          </div>
          
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center space-x-3 text-sm font-bold animate-pulse">
            <span class="text-xl">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>
          
        </div>

        <div class="pt-4 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            @click="router.back()"
            class="px-8 py-4 bg-white text-slate-600 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition w-full sm:w-auto text-center"
          >
            취소
          </button>
          <button 
            @click="handleCreateBoard"
            :disabled="isSubmitting"
            class="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto"
          >
            {{ isSubmitting ? '개최 준비 중...' : '갈드컵 열기' }}
          </button>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/axios'

const router = useRouter()
const store = useUserStore()

const topic = ref('')
const description = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleCreateBoard() {
  errorMessage.value = ''
  
  if (!topic.value.trim()) {
    errorMessage.value = '갈드컵 주제를 입력해주세요.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      topic: topic.value.trim(),
      description: description.value.trim()
    }
    const res = await api.post('/boards', payload, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    
    // 생성된 게시판으로 바로 이동
    const newBoardId = res.data.id || res.data // 응답 형태에 따라 수정 필요할 수 있음
    alert('새로운 갈드컵이 성공적으로 개최되었습니다!')
    router.push(`/boards/${newBoardId}`)
  } catch (err) {
    console.error('게시판 생성 실패', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = '게시판 생성에 실패했습니다.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>