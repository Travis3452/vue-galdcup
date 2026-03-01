<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 flex items-center justify-center">
    <div class="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl p-10 md:p-16 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <h1 class="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-12 text-center relative z-10 tracking-tight">
        ⚔️ 새로운 갈드컵 생성
      </h1>

      <div class="space-y-8 relative z-10">
        <div>
          <label class="block text-slate-700 font-extrabold mb-3 text-xl">갈드컵 주제</label>
          <input
            v-model="topic"
            type="text"
            class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-5 text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="예: 짜장면 vs 짬뽕, 당신의 선택은?"
            aria-label="갈드컵 주제 입력"
          />
        </div>

        <div>
          <label class="block text-slate-700 font-extrabold mb-3 text-xl">상세 설명</label>
          <textarea
            v-model="description"
            class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-5 text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[300px] resize-y"
            placeholder="이 갈드컵에서 다룰 규칙이나 상세 설명을 적어주세요."
            aria-label="게시판 설명 입력"
          ></textarea>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-6 py-5 rounded-2xl flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-lg font-semibold">{{ errorMessage }}</span>
        </div>

        <div class="flex justify-end gap-5 mt-12 pt-8 border-t border-slate-100">
          <router-link
            to="/"
            class="px-8 py-4 rounded-2xl font-bold text-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            취소
          </router-link>
          <button
            @click="createBoard"
            :disabled="submitting"
            class="px-10 py-4 rounded-2xl font-extrabold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1"
          >
            {{ submitting ? '생성 중...' : '갈드컵 생성 완료' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()

const topic = ref('')
const description = ref('')
const errorMessage = ref('')
const submitting = ref(false)

async function createBoard() {
  errorMessage.value = ''
  
  if (!topic.value.trim()) {
    errorMessage.value = '갈드컵 주제를 입력하세요.'
    return
  }
  
  submitting.value = true
  try {
    const payload = {
      topic: topic.value.trim(),
      description: description.value.trim()
    }
    const res = await api.post('/boards', payload, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })

    const boardId = res.data.id
    router.push(`/boards/${boardId}`)
    
  } catch (err) {
    console.error('게시판 생성 실패:', err)
    if (err.response && err.response.data) {
      const data = err.response.data
      if (data.details && typeof data.details === 'object') {
        const detailMsgs = Object.values(data.details).join('\n')
        errorMessage.value = detailMsgs
      } else {
        errorMessage.value = data.message || '요청 처리 중 오류가 발생했습니다.'
      }
    } else {
      errorMessage.value = '알 수 없는 오류가 발생했습니다.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
textarea::-webkit-scrollbar {
  width: 10px;
}
textarea::-webkit-scrollbar-track {
  background: #f8fafc; 
  border-radius: 5px;
}
textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 5px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>