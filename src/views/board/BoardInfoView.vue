<template>
  <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 mb-8 relative overflow-hidden border border-indigo-50">
    <div class="relative z-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div v-if="isLoading" class="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0"></div>
            <span v-else class="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-black shadow-md shrink-0">G</span>
            
            <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div v-if="isLoading" class="h-8 w-48 md:w-64 bg-slate-200 rounded animate-pulse"></div>
              <router-link v-else :to="`/boards/${boardId}`" class="group">
                <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight break-keep group-hover:text-indigo-600 transition-colors">
                  {{ board?.topic }}
                </h1>
              </router-link>
            </div>
          </div>
          
          <div class="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm font-medium">
            <div v-if="isLoading" class="h-8 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
            <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">👤</span>
              <span class="text-slate-400 mr-1">매니저</span>
              <span class="text-slate-800">{{ boardPolicy?.boardManager?.nickname || '없음' }}</span>
            </div>

            <div v-if="isLoading" class="h-8 w-40 bg-slate-200 rounded-xl animate-pulse"></div>
            <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl">
              <span class="text-indigo-500">📅</span>
              <span class="text-slate-400 mr-1">생성일</span>
              <span class="text-slate-800">{{ formatDate(board?.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative mt-6">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
        <div v-if="isLoading" class="pl-6 py-1 space-y-2">
          <div class="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <p v-else class="text-sm font-medium text-slate-500 leading-relaxed pl-6 py-1">
          {{ board?.description }}
        </p>
      </div>

      <div class="mt-8" v-if="!isLoading && !boardPolicy?.boardManager">
        <button @click="applyForBoardManager" class="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition text-base font-bold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5">
          갈드컵 매니저 권한 신청하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '@/axios'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()

const board = computed(() => boardStore.currentBoard)
const boardPolicy = computed(() => boardStore.currentPolicy)
const boardId = computed(() => boardStore.currentBoard?.id)
const isLoading = computed(() => boardStore.isLoading)

/** * 관리자 권한 신청 API 호출 (일반 유저용 기능이므로 유지) */
async function applyForBoardManager() {
  try {
    const res = await api.post(`/boards/${boardId.value}/apply`)
    
    if (res.data.status === 'APPROVED') {
      alert('관리자가 공석이기 때문에 즉시 관리자로 임명되었습니다!')
      await boardStore.fetchBoardDetails(String(boardId.value))
    } else {
      alert('권한 위임 신청이 접수되었습니다. 기존 관리자의 승인을 기다려주세요.')
    }
  } catch (err) {
    console.error('권한 위임 신청 실패', err)
    alert(err.response?.data?.message || '권한 위임 신청 실패')
  }
}

/** 날짜 포맷 헬퍼 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>