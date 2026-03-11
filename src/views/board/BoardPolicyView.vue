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

        <div class="mb-8">
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

          <div v-if="searchResults.length > 0" class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 mb-4">
            <ul class="space-y-2 mb-4">
              <li v-for="user in searchResults" :key="user.id" class="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
                <span class="font-bold text-slate-700 text-sm">👤 {{ user.nickname }}</span>
                <button @click="handleAddSubManager(user.nickname)" class="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                  권한 부여
                </button>
              </li>
            </ul>
          </div>

          <div v-if="boardPolicy?.subManagers?.length > 0" class="space-y-2">
            <li v-for="sm in boardPolicy.subManagers" :key="sm.id" class="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <span class="font-bold text-slate-700 text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                {{ sm.nickname }}
              </span>
              <button @click="handleRemoveSubManager(sm.nickname)" class="text-xs font-bold text-slate-400 hover:text-red-500 px-2 py-1 transition-colors">
                해임
              </button>
            </li>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100">
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span>🏷️</span> 게시글 카테고리 관리
          </h4>

          <div v-if="isMainManager" class="flex gap-2 mb-6">
            <input 
              v-model="newCategoryName" 
              @keyup.enter="handleAddCategory"
              maxlength="10"
              class="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
              placeholder="새 카테고리 (2~10자)" 
            />
            <button 
              @click="handleAddCategory"
              class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition"
            >
              추가
            </button>
          </div>

          <div class="space-y-3">
            <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">현재 카테고리</h5>
            <div v-if="categories.length > 0" class="flex flex-wrap gap-2">
              <div 
                v-for="cat in categories" 
                :key="cat.id"
                class="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl group"
              >
                <span class="text-xs font-bold text-slate-600">{{ cat.name }}</span>
                <button 
                  v-if="isMainManager"
                  @click="handleDeleteCategory(cat.id, cat.name)"
                  class="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                  title="삭제 및 이관"
                >
                  <span class="text-[12px] font-bold">✕</span>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <span class="text-sm font-medium text-slate-400">등록된 카테고리가 없습니다.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import { useBoardStore } from '@/stores/board'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const boardStore = useBoardStore()
const userStore = useUserStore()

const emit = defineEmits(['close'])

// --- 데이터 참조 ---
const boardId = computed(() => route.params.boardId)
const boardPolicy = computed(() => boardStore.currentPolicy)
const categories = computed(() => boardStore.categories)

// ✅ 메인 매니저(BoardManager) 권한 확인
const isMainManager = computed(() => {
  const mainManagerId = boardPolicy.value?.boardManager?.id
  return Number(mainManagerId) === Number(userStore.id)
})

const localThreshold = ref(boardPolicy.value?.likeThreshold || 0)
const newCategoryName = ref('')

watch(() => boardPolicy.value?.likeThreshold, (newVal) => {
  localThreshold.value = newVal || 0
}, { immediate: true })

// 검색/페이징 상태
const searchNickname = ref('')
const searchResults = ref([])
const totalPages = ref(0)
const currentPage = ref(0)

// 스토어 갱신 함수
async function refreshData() {
  await boardStore.fetchBoardDetails(boardId.value)
}

// --- ✨ 카테고리 관리 로직 (제공해주신 API 기반) ---

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (name.length < 2 || name.length > 10) {
    alert('카테고리 이름은 2자 이상 10자 이하로 입력해주세요.')
    return
  }
  
  try {
    // POST /api/boards/{boardId}/post-categories
    await api.post(`/boards/${boardId.value}/post-categories`, { name })
    newCategoryName.value = ''
    await refreshData()
  } catch (err) {
    alert(err?.response?.data?.message || '카테고리 추가에 실패했습니다.')
  }
}

async function handleDeleteCategory(categoryId, categoryName) {
  if (categories.value.length <= 1) {
    alert('최소 하나 이상의 카테고리가 유지되어야 하므로 삭제할 수 없습니다.')
    return
  }

  // 삭제할 카테고리 외의 다른 카테고리 하나를 찾아 글을 이관함 (moveToId)
  const targetCategory = categories.value.find(c => c.id !== categoryId)
  
  if (!confirm(`'${categoryName}' 카테고리를 삭제하시겠습니까?\n이 카테고리의 모든 글은 '${targetCategory.name}'(으)로 이동됩니다.`)) {
    return
  }

  try {
    // DELETE /api/boards/{boardId}/post-categories/{categoryId}?moveToId={targetId}
    await api.delete(`/boards/${boardId.value}/post-categories/${categoryId}`, {
      params: { moveToId: targetCategory.id }
    })
    await refreshData()
  } catch (err) {
    alert(err?.response?.data?.message || '카테고리 삭제에 실패했습니다.')
  }
}

// --- 정책/서브매니저 로직 (기존 유지) ---

async function handleUpdateThreshold() {
  try {
    await api.patch(`/boards/${boardId.value}/policy`, { likeThreshold: localThreshold.value })
    await refreshData()
    alert('정책이 저장되었습니다.')
  } catch (err) {
    alert(err?.response?.data?.message || '정책 저장 실패')
  }
}

async function handleSearchUser(page = 0) {
  if (!searchNickname.value.trim()) return
  try {
    const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value.trim())}`, {
      params: { page, size: 5 }
    })
    searchResults.value = res.data.content || []
    totalPages.value = res.data.totalPages || 0
    currentPage.value = res.data.number || 0
  } catch (err) {
    console.error('유저 검색 실패', err)
  }
}

async function handleAddSubManager(nickname) {
  try {
    await api.post(`/boards/${boardId.value}/policy/sub-managers`, { nickname })
    await refreshData()
    alert(`${nickname} 님이 서브 매니저로 추가되었습니다.`)
    searchResults.value = []; searchNickname.value = ''
  } catch (err) {
    alert(err?.response?.data?.message || '추가 실패')
  }
}

async function handleRemoveSubManager(nickname) {
  if (!confirm(`${nickname} 님을 해임하시겠습니까?`)) return
  try {
    await api.delete(`/boards/${boardId.value}/policy/sub-managers`, { data: { nickname } })
    await refreshData()
  } catch (err) {
    alert(err?.response?.data?.message || '해임 실패')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>