<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 p-0 md:p-4">
    <div class="absolute inset-0 bg-slate-900/60 transition-opacity" @click="$emit('close')"></div>

    <div class="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-full md:h-[650px] z-60 relative flex flex-col md:flex-row overflow-hidden border border-slate-100">
      
      <aside class="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col shrink-0">
        <div class="hidden md:block p-8 pb-4">
          <h3 class="text-xl font-black text-indigo-600 flex items-center gap-2">
            <span>⚙️</span> 설정
          </h3>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Board Settings</p>
        </div>

        <nav class="flex md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-hide p-2 md:p-4 md:space-y-2 flex-1">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            class="whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all shrink-0"
            :class="activeTab === tab.id ? 'bg-white md:bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-500 hover:bg-slate-100'"
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <header class="h-14 md:h-20 flex items-center justify-between px-6 md:px-10 border-b border-slate-50 shrink-0">
          <h4 class="text-base md:text-lg font-black text-slate-800">{{ currentTabLabel }}</h4>
          <button @click="$emit('close')" class="p-2 text-slate-300 hover:text-slate-500 transition text-xl">✕</button>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 min-h-0">
          
          <section v-show="activeTab === 'threshold'" class="space-y-6">
            <div class="bg-indigo-50 rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-indigo-100">
              <p class="text-xs md:text-sm text-indigo-600 font-bold mb-4 leading-relaxed">
                게시글의 좋아요 수가 설정값에 도달하면<br class="hidden md:block"/> 인기 목록에 자동으로 노출됩니다.
              </p>
              <div class="flex flex-col sm:flex-row gap-3">
                <input v-model="localThreshold" type="number" class="w-full sm:flex-1 border-2 border-white px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-black focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white/50" />
                <button @click="handleUpdateThreshold" class="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black hover:bg-indigo-700 transition">저장</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'managers'" class="space-y-6 md:space-y-8">
            <div class="flex flex-col sm:flex-row gap-2">
              <input v-model="searchNickname" @keyup.enter="handleSearchUser" class="flex-1 border border-slate-200 px-4 py-3 rounded-xl md:rounded-2xl text-sm outline-none focus:border-indigo-500" placeholder="닉네임 유저 검색" />
              <button @click="handleSearchUser" class="px-6 py-3 bg-slate-800 text-white rounded-xl md:rounded-2xl text-sm font-bold">검색</button>
            </div>

            <div class="min-h-0">
              <div v-if="searchResults.length > 0" class="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 border border-slate-100">
                <div v-for="user in searchResults" :key="user.id" class="flex justify-between items-center p-3 bg-white rounded-xl mb-2 shadow-sm">
                  <span class="text-xs md:text-sm font-bold text-slate-700 truncate mr-2">👤 {{ user.nickname }}</span>
                  <button @click="handleAddSubManager(user.nickname)" class="shrink-0 text-[10px] md:text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition">권한부여</button>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">현재 서브 매니저</p>
              <div v-for="sm in boardPolicy?.subManagers" :key="sm.id" class="flex justify-between items-center p-4 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-slate-50 transition">
                <span class="font-bold text-slate-700 text-sm">🛡️ {{ sm.nickname }}</span>
                <button @click="handleRemoveSubManager(sm.nickname)" class="text-[11px] md:text-xs font-bold text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">해임</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'categories'" class="space-y-6 md:space-y-8 pb-10">
            <div v-if="isMainManager" class="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100">
              <div class="flex flex-col sm:flex-row gap-2">
                <input v-model="newCategoryName" maxlength="10" @keyup.enter="handleAddCategory" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm" placeholder="새 카테고리명 (2~10자)" />
                <button @click="handleAddCategory" class="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">추가</button>
              </div>
            </div>

            <div class="rounded-xl border border-slate-100 overflow-x-auto shadow-sm bg-white scrollbar-hide">
              <table class="w-full text-left border-collapse min-w-[400px]">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase w-16 text-center">순서</th>
                    <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">명칭</th>
                    <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">관리</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="(cat, index) in localCategories" :key="cat.id" class="hover:bg-slate-50/30 transition-colors h-16 md:h-[72px]">
                    <td class="px-2 md:px-6 py-2">
                      <div v-if="isMainManager" class="flex flex-col items-center gap-0">
                        <button @click="moveOrder(index, -1)" :disabled="index === 0" class="text-slate-300 hover:text-indigo-600 disabled:opacity-10 px-2 py-1 transition text-xs">▲</button>
                        <button @click="moveOrder(index, 1)" :disabled="index === localCategories.length - 1" class="text-slate-300 hover:text-indigo-600 disabled:opacity-10 px-2 py-1 transition text-xs">▼</button>
                      </div>
                      <span v-else class="text-[10px] font-bold text-slate-300 text-center block">{{ index + 1 }}</span>
                    </td>
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-2">
                        <span v-if="getType(cat) === 'NOTICE'" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded">공지</span>
                        <span v-else-if="getType(cat) === 'GENERAL'" class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded">기본</span>
                        <span class="font-bold text-slate-700 text-xs md:text-sm truncate max-w-[100px]">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-right">
                      <div class="flex justify-end items-center gap-1">
                        <template v-if="deletingCategoryId !== cat.id">
                          <button @click="openEditPrompt(cat)" class="px-2 py-2 text-slate-400 hover:text-indigo-600 transition text-[10px] md:text-xs font-bold">수정</button>
                          <button v-if="getType(cat) === 'CUSTOM' && isMainManager" @click="deletingCategoryId = cat.id" class="px-2 py-2 text-slate-400 hover:text-red-500 transition text-[10px] md:text-xs font-bold">삭제</button>
                        </template>

                        <template v-else>
                          <div class="flex items-center gap-1 animate-fadeIn">
                            <select v-model="selectedMoveToId" class="text-[9px] p-1 border rounded bg-slate-50 outline-none max-w-[80px]">
                              <option value="" disabled>이관 선택</option>
                              <option v-for="dest in getMoveDestinations(cat.id)" :key="dest.id" :value="dest.id">{{ dest.name }}</option>
                            </select>
                            <button @click="handleConfirmDelete(cat)" :disabled="!selectedMoveToId" class="text-[9px] font-bold text-white bg-red-500 px-2 py-1.5 rounded disabled:opacity-30">OK</button>
                            <button @click="deletingCategoryId = null" class="text-[9px] font-bold text-slate-400 px-1">✕</button>
                          </div>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="isOrderChanged" class="flex justify-center pt-4">
              <button @click="handleSaveOrder" class="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition active:scale-95 text-sm md:text-base">
                순서 저장
              </button>
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

const activeTab = ref('threshold')
const tabs = [
  { id: 'threshold', label: '인기글 기준', icon: '🔥' },
  { id: 'managers', label: '서브 매니저 관리', icon: '🛡️' },
  { id: 'categories', label: '카테고리 관리', icon: '🏷️' }
]
const currentTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

const boardId = computed(() => route.params.boardId)
const boardPolicy = computed(() => boardStore.currentPolicy)
const categories = computed(() => boardStore.categories)

const isMainManager = computed(() => {
  const managerId = boardPolicy.value?.boardManager?.id
  const myId = userStore.id
  return managerId && myId && Number(managerId) === Number(myId)
})

const getType = (cat) => (cat.categoryType || cat.type || '').toUpperCase()

// --- 상태 관리 ---
const localCategories = ref([])
const isOrderChanged = ref(false)
const newCategoryName = ref('')
const deletingCategoryId = ref(null) // 현재 삭제 확인 중인 카테고리 ID
const selectedMoveToId = ref('')      // 이관할 대상 카테고리 ID

watch(categories, (newVal) => {
  if (newVal) {
    localCategories.value = [...newVal]
    isOrderChanged.value = false
  }
}, { immediate: true })

function moveOrder(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localCategories.value.length) return
  const temp = [...localCategories.value]
  const [movedItem] = temp.splice(index, 1)
  temp.splice(newIndex, 0, movedItem)
  localCategories.value = temp
  isOrderChanged.value = true
}

// ✅ [2번 규칙] 부분 업데이트: 전체 Fetch 대신 스토어 데이터만 교체
async function handleSaveOrder() {
  try {
    const payload = localCategories.value.map((cat, idx) => ({ id: cat.id, sortOrder: idx, name: cat.name }))
    await api.patch(`/boards/${boardId.value}/post-categories/batch`, payload)
    boardStore.categories = [...localCategories.value]
    isOrderChanged.value = false
    alert('순서가 저장되었습니다.')
  } catch (err) { alert('저장 실패') }
}

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (name.length < 2 || name.length > 10) return alert('2~10자로 입력해주세요.')
  
  try {
    const res = await api.post(`/boards/${boardId.value}/post-categories`, { name })
    
    boardStore.categories.push(res.data) 
    
    localCategories.value.push(res.data) 
    
    newCategoryName.value = ''
    alert('카테고리가 추가되었습니다.')
  } catch (err) { 
    console.error(err)
    alert('추가 실패: 관리자 권한을 확인하거나 이미 존재하는 이름인지 확인하세요.') 
  }
}

async function openEditPrompt(category) {
  const newName = prompt(`'${category.name}'의 새로운 이름을 입력하세요.`, category.name)
  if (!newName || newName === category.name) return
  try {
    const res = await api.patch(`/boards/${boardId.value}/post-categories`, { id: category.id, name: newName })
    const target = boardStore.categories.find(c => c.id === category.id)
    if (target) target.name = res.data.name // 부분 업데이트
  } catch (err) { alert('수정 실패') }
}

// --- 삭제 및 이관 관련 로직 ---
function getMoveDestinations(targetId) {
  // 본인 카테고리와 공지사항을 제외한 모든 곳으로 이관 가능
  return localCategories.value.filter(c => c.id !== targetId && getType(c) !== 'NOTICE')
}

async function handleConfirmDelete(cat) {
  if (!selectedMoveToId.value) return
  const targetName = localCategories.value.find(c => c.id === selectedMoveToId.value)?.name
  
  if (!confirm(`'${cat.name}' 삭제 시 모든 글이 '${targetName}'으로 이동합니다. 계속하시겠습니까?`)) return

  try {
    await api.delete(`/boards/${boardId.value}/post-categories/${cat.id}`, { 
      params: { moveToId: selectedMoveToId.value } 
    })
    boardStore.categories = boardStore.categories.filter(c => c.id !== cat.id) // 부분 업데이트
    deletingCategoryId.value = null
    selectedMoveToId.value = ''
  } catch (err) { alert('삭제 실패') }
}

// --- 기타 정책 로직 ---
const localThreshold = ref(0)
watch(() => boardPolicy.value?.likeThreshold, (n) => localThreshold.value = n || 0, { immediate: true })

async function handleUpdateThreshold() {
  try {
    await api.patch(`/boards/${boardId.value}/policy`, { likeThreshold: localThreshold.value })
    if (boardStore.currentPolicy) boardStore.currentPolicy.likeThreshold = localThreshold.value
    alert('저장되었습니다.')
  } catch (err) { alert('저장 실패') }
}

const searchNickname = ref(''); const searchResults = ref([])
async function handleSearchUser() {
  if (!searchNickname.value.trim()) return
  const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value.trim())}`, { params: { size: 5 } })
  searchResults.value = res.data.content || []
}

async function handleAddSubManager(nickname) {
  try {
    const res = await api.post(`/boards/${boardId.value}/policy/sub-managers`, { nickname })
    if (boardStore.currentPolicy) boardStore.currentPolicy.subManagers.push(res.data)
    searchResults.value = []; searchNickname.value = ''
  } catch (err) { alert('추가 실패') }
}

async function handleRemoveSubManager(nickname) {
  if (!confirm(`${nickname}님을 해임하시겠습니까?`)) return
  try {
    await api.delete(`/boards/${boardId.value}/policy/sub-managers`, { data: { nickname } })
    if (boardStore.currentPolicy) {
      boardStore.currentPolicy.subManagers = boardStore.currentPolicy.subManagers.filter(sm => sm.nickname !== nickname)
    }
  } catch (err) { alert('해임 실패') }
}
</script>

<style scoped>
/* 모바일에서 사이드바 가로 스크롤 시 스크롤바 숨기기 */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }

.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(5px); } to { opacity: 1; transform: translateX(0); } }

/* 테이블 헤더 고정 (데스크탑 위주) */
thead { position: sticky; top: 0; z-index: 10; }
</style>