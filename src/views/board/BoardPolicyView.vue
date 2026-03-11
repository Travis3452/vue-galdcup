<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[650px] z-60 relative flex overflow-hidden border border-slate-100">
      
      <aside class="w-64 bg-slate-50 border-r border-slate-100 p-8 flex flex-col shrink-0">
        <div class="mb-10 px-2">
          <h3 class="text-xl font-black text-indigo-600 flex items-center gap-2">
            <span>⚙️</span> 설정
          </h3>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Board Settings</p>
        </div>

        <nav class="space-y-2 flex-1">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200"
            :class="activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-500 hover:bg-slate-100'"
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>

        <button @click="$emit('close')" class="mt-auto px-4 py-3 bg-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-300 transition">
          닫기 (ESC)
        </button>
      </aside>

      <main class="flex-1 flex flex-col min-w-0 bg-white">
        <header class="h-20 flex items-center justify-between px-10 border-b border-slate-50">
          <h4 class="text-lg font-black text-slate-800">{{ currentTabLabel }}</h4>
          <button @click="$emit('close')" class="text-slate-300 hover:text-slate-500 transition">✕</button>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-10">
          
          <section v-if="activeTab === 'threshold'" class="space-y-6">
            <div class="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
              <p class="text-sm text-indigo-600 font-bold mb-4 leading-relaxed">
                게시글의 좋아요 수가 설정값에 도달하면<br/>인기 게시판 목록에 자동으로 노출됩니다.
              </p>
              <div class="flex gap-3">
                <input 
                  v-model="localThreshold" type="number" 
                  class="flex-1 border-2 border-white px-6 py-4 rounded-2xl text-lg font-black focus:ring-4 focus:ring-indigo-100 outline-none transition shadow-inner bg-white/50" 
                />
                <button @click="handleUpdateThreshold" class="px-8 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                  저장
                </button>
              </div>
            </div>
          </section>

          <section v-if="activeTab === 'managers'" class="space-y-8">
            <div class="flex gap-2">
              <input v-model="searchNickname" @keyup.enter="handleSearchUser(0)" class="flex-1 border border-slate-200 px-5 py-3 rounded-2xl text-sm outline-none focus:border-indigo-500" placeholder="닉네임으로 유저 검색" />
              <button @click="handleSearchUser(0)" class="px-6 bg-slate-800 text-white rounded-2xl text-sm font-bold">검색</button>
            </div>

            <div v-if="searchResults.length > 0" class="bg-slate-50 rounded-2xl p-4">
              <div v-for="user in searchResults" :key="user.id" class="flex justify-between items-center p-3 bg-white rounded-xl mb-2 shadow-sm">
                <span class="text-sm font-bold text-slate-700">👤 {{ user.nickname }}</span>
                <button @click="handleAddSubManager(user.nickname)" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition">권한부여</button>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Sub-Managers</p>
              <div v-for="sm in boardPolicy?.subManagers" :key="sm.id" class="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
                <span class="font-bold text-slate-700">🛡️ {{ sm.nickname }}</span>
                <button @click="handleRemoveSubManager(sm.nickname)" class="text-xs font-bold text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg">해임</button>
              </div>
            </div>
          </section>

          <section v-if="activeTab === 'categories'" class="space-y-8">
            <div v-if="isMainManager" class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1 text-center">New Category</label>
              <div class="flex gap-2">
                <input v-model="newCategoryName" maxlength="10" @keyup.enter="handleAddCategory" class="flex-1 px-5 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="추가할 카테고리명 (2~10자)" />
                <button @click="handleAddCategory" class="px-6 bg-indigo-600 text-white rounded-xl font-bold">추가</button>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="w-full text-left border-collapse bg-white">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter">Category Name</th>
                    <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="cat in categories" :key="cat.id" class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span v-if="cat.type === 'NOTICE'" class="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-md">공지</span>
                        <span v-else-if="cat.type === 'GENERAL'" class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md">기본</span>
                        <span class="font-bold text-slate-700">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button 
                          @click="openEditPrompt(cat)"
                          class="p-2 text-slate-400 hover:text-indigo-600 transition"
                        >
                          <span class="text-xs font-bold">수정</span>
                        </button>
                        <button 
                          v-if="cat.type === 'CUSTOM' && isMainManager"
                          @click="handleDeleteCategory(cat.id, cat.name)"
                          class="p-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <span class="text-xs font-bold">삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
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

// --- 탭 설정 ---
const activeTab = ref('threshold')
const tabs = [
  { id: 'threshold', label: '인기글 기준', icon: '🔥' },
  { id: 'managers', label: '서브 매니저 관리', icon: '🛡️' },
  { id: 'categories', label: '카테고리 관리', icon: '🏷️' }
]
const currentTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

// --- 데이터 참조 ---
const boardId = computed(() => route.params.boardId)
const boardPolicy = computed(() => boardStore.currentPolicy)
const categories = computed(() => boardStore.categories)

const isMainManager = computed(() => {
  const mainManagerId = boardPolicy.value?.boardManager?.id
  return Number(mainManagerId) === Number(userStore.id)
})

const localThreshold = ref(boardPolicy.value?.likeThreshold || 0)
const newCategoryName = ref('')

watch(() => boardPolicy.value?.likeThreshold, (newVal) => {
  localThreshold.value = newVal || 0
}, { immediate: true })

async function refreshData() {
  await boardStore.fetchBoardDetails(boardId.value)
}

// --- ✨ 카테고리 관리 로직 (수정 기능 추가) ---

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (name.length < 2 || name.length > 10) return alert('2~10자로 입력해주세요.')
  try {
    await api.post(`/boards/${boardId.value}/post-categories`, { name })
    newCategoryName.value = ''; await refreshData()
  } catch (err) { alert(err?.response?.data?.message || '추가 실패') }
}

async function openEditPrompt(category) {
  const newName = prompt(`'${category.name}' 카테고리의 새로운 이름을 입력하세요.`, category.name)
  if (!newName || newName === category.name) return
  if (newName.length < 2 || newName.length > 10) return alert('2~10자로 입력해주세요.')

  try {
    // PATCH /api/boards/{boardId}/post-categories/{categoryId}
    await api.patch(`/boards/${boardId.value}/post-categories/${category.id}`, { name: newName })
    await refreshData()
  } catch (err) { alert(err?.response?.data?.message || '수정 실패') }
}

async function handleDeleteCategory(categoryId, categoryName) {
  const targetCategory = categories.value.find(c => c.id !== categoryId && c.type !== 'NOTICE')
  if (!targetCategory) return alert('삭제 후 이동할 대체 카테고리가 없습니다.')
  
  if (!confirm(`'${categoryName}'을 삭제하면 모든 게시글이 '${targetCategory.name}'으로 이동합니다.`)) return
  try {
    await api.delete(`/boards/${boardId.value}/post-categories/${categoryId}`, {
      params: { moveToId: targetCategory.id }
    })
    await refreshData()
  } catch (err) { alert(err?.response?.data?.message || '삭제 실패') }
}

// --- 정책/서브매니저 로직 ---
const searchNickname = ref(''); const searchResults = ref([])
async function handleUpdateThreshold() {
  try {
    await api.patch(`/boards/${boardId.value}/policy`, { likeThreshold: localThreshold.value })
    await refreshData(); alert('저장되었습니다.')
  } catch (err) { alert('저장 실패') }
}
async function handleSearchUser(page = 0) {
  const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value.trim())}`, { params: { page, size: 5 } })
  searchResults.value = res.data.content || []
}
async function handleAddSubManager(nickname) {
  await api.post(`/boards/${boardId.value}/policy/sub-managers`, { nickname })
  await refreshData(); searchResults.value = []; searchNickname.value = ''
}
async function handleRemoveSubManager(nickname) {
  if (!confirm('해임하시겠습니까?')) return
  await api.delete(`/boards/${boardId.value}/policy/sub-managers`, { data: { nickname } })
  await refreshData()
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
</style>