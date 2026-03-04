<template>
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      @click="$emit('close')"
    ></div>

    <div class="bg-white rounded-[2rem] shadow-2xl w-[90%] max-w-md p-8 z-60 relative flex flex-col max-h-[90vh]">
      
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>⚙️</span> 게시판 정책 관리
        </h3>
        <button 
          @click="$emit('close')" 
          class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
        >
          ✕
        </button>
      </div>

      <div class="overflow-y-auto custom-scrollbar pr-2 flex-1">
        
        <div class="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
          <label class="block text-sm font-bold text-slate-700 mb-2">인기글 등극 기준 (좋아요 수)</label>
          <div class="flex gap-2">
            <input 
              v-model="localThreshold" 
              type="number" 
              class="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white" 
            />
            <button 
              @click="handleUpdateThreshold" 
              class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition"
            >
              저장
            </button>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span>🛡️</span> 서브 매니저 관리
          </h4>
          
          <div class="flex gap-2 mb-4">
            <input 
              v-model="searchNickname" 
              @keyup.enter="handleSearchUser(0)"
              class="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
              placeholder="추가할 유저 닉네임 검색" 
            />
            <button 
              @click="handleSearchUser(0)" 
              class="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-900 transition"
            >
              검색
            </button>
          </div>

          <div v-if="searchResults.length > 0" class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 mb-6">
            <h5 class="text-xs font-bold text-indigo-600 mb-3">검색 결과 ({{ searchResults.length }}명)</h5>
            <ul class="space-y-2 mb-4">
              <li 
                v-for="user in searchResults" 
                :key="user.id" 
                class="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100"
              >
                <span class="font-bold text-slate-700 text-sm">👤 {{ user.nickname }}</span>
                <button 
                  @click="handleAddSubManager(user.nickname)" 
                  class="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                >
                  권한 부여
                </button>
              </li>
            </ul>

            <div v-if="totalPages > 1" class="flex gap-1.5 justify-center items-center mt-4">
              <button
                @click="prevPageGroup"
                :disabled="pageGroupStart === 0"
                class="px-2 py-1 rounded-lg text-xs font-bold transition-colors"
                :class="pageGroupStart === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 bg-slate-100'"
              >
                ◀
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="handleSearchUser(page-1)"
                class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all"
                :class="page-1 === currentPage ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'"
              >
                {{ page }}
              </button>

              <button
                @click="nextPageGroup"
                :disabled="pageGroupStart + 5 >= totalPages"
                class="px-2 py-1 rounded-lg text-xs font-bold transition-colors"
                :class="pageGroupStart + 5 >= totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 bg-slate-100'"
              >
                ▶
              </button>
            </div>
          </div>
          
          <div v-else-if="searchNickname && totalPages === 0 && currentPage === 0" class="text-center py-4 text-sm text-slate-400 font-medium">
            검색 결과가 없습니다.
          </div>

          <div>
            <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">현재 등록된 서브 매니저</h5>
            <div v-if="boardPolicy?.subManagers?.length > 0">
              <ul class="space-y-2">
                <li 
                  v-for="sm in boardPolicy.subManagers" 
                  :key="sm.id" 
                  class="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 group"
                >
                  <span class="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    {{ sm.nickname }}
                  </span>
                  <button 
                    @click="handleRemoveSubManager(sm.nickname)" 
                    class="text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    해임
                  </button>
                </li>
              </ul>
            </div>
            <div v-else class="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <span class="text-sm font-medium text-slate-400">등록된 서브 매니저가 없습니다.</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 스크립트 부분은 기존 로직을 완벽히 유지했습니다!
import { ref, computed } from 'vue'
import api from '@/axios'

const props = defineProps({
  boardId: { type: String, required: true },
  boardPolicy: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])

const localThreshold = ref(props.boardPolicy?.likeThreshold || 0)
const searchNickname = ref('')
const searchResults = ref([])
const totalPages = ref(0)
const currentPage = ref(0)
const pageGroupStart = ref(0)

const visiblePages = computed(() => {
  const end = Math.min(pageGroupStart.value + 5, totalPages.value)
  const pages = []
  for (let i = pageGroupStart.value + 1; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

async function handleUpdateThreshold() {
  try {
    await api.patch(`/boards/${props.boardId}/policy`, { likeThreshold: localThreshold.value })
    emit('updated')
    alert('정책이 업데이트되었습니다.')
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '정책 업데이트 중 오류가 발생했습니다.')
  }
}

async function handleSearchUser(page = 0, size = 5) {
  if (!searchNickname.value.trim()) {
    alert('닉네임을 입력하세요.')
    return
  }
  try {
    const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value.trim())}`, {
      params: { page, size }
    })
    searchResults.value = res.data.content || []
    totalPages.value = res.data.totalPages || 0
    currentPage.value = res.data.number || 0
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '유저 검색 중 오류가 발생했습니다.')
  }
}

async function handleAddSubManager(nickname) {
  try {
    await api.post(`/boards/${props.boardId}/policy/sub-managers`, { nickname })
    emit('updated')
    alert(`${nickname} 님이 서브 매니저로 추가되었습니다.`)
    // 추가 완료 시 검색 결과 비우기 (선택 사항)
    searchResults.value = []
    searchNickname.value = ''
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 추가 중 오류가 발생했습니다.')
  }
}

async function handleRemoveSubManager(nickname) {
  if (!confirm(`${nickname} 님을 서브 매니저에서 해임하시겠습니까?`)) return
  try {
    await api.delete(`/boards/${props.boardId}/policy/sub-managers`, { data: { nickname } })
    emit('updated')
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 삭제 중 오류가 발생했습니다.')
  }
}

function prevPageGroup() {
  if (pageGroupStart.value >= 5) {
    pageGroupStart.value -= 5
  }
}
function nextPageGroup() {
  if (pageGroupStart.value + 5 < totalPages.value) {
    pageGroupStart.value += 5
  }
}
</script>

<style scoped>
.z-60 { z-index: 60; }

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>