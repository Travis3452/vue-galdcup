<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" @click="$emit('close')"></div>

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

        </aside>

      <main class="flex-1 flex flex-col min-w-0 bg-white">
        <header class="h-20 flex items-center justify-between px-10 border-b border-slate-50">
          <h4 class="text-lg font-black text-slate-800">{{ currentTabLabel }}</h4>
          <button @click="$emit('close')" class="text-slate-300 hover:text-slate-500 transition">✕</button>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-10">
          
          <section v-show="activeTab === 'threshold'" class="space-y-6">
            <div class="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
              <p class="text-sm text-indigo-600 font-bold mb-4 leading-relaxed">
                게시글의 좋아요 수가 설정값에 도달하면<br/>인기 게시판 목록에 자동으로 노출됩니다.
              </p>
              <div class="flex gap-3">
                <input v-model="localThreshold" type="number" class="flex-1 border-2 border-white px-6 py-4 rounded-2xl text-lg font-black focus:ring-4 focus:ring-indigo-100 outline-none transition shadow-inner bg-white/50" />
                <button @click="handleUpdateThreshold" class="px-8 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">저장</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'managers'" class="space-y-8">
            <div class="flex gap-2">
              <input v-model="searchNickname" @keyup.enter="handleSearchUser" class="flex-1 border border-slate-200 px-5 py-3 rounded-2xl text-sm outline-none focus:border-indigo-500" placeholder="닉네임으로 유저 검색" />
              <button @click="handleSearchUser" class="px-6 bg-slate-800 text-white rounded-2xl text-sm font-bold">검색</button>
            </div>
            <div class="min-h-[80px]">
              <div v-if="searchResults.length > 0" class="bg-slate-50 rounded-2xl p-4 mb-4">
                <div v-for="user in searchResults" :key="user.id" class="flex justify-between items-center p-3 bg-white rounded-xl mb-2 shadow-sm">
                  <span class="text-sm font-bold text-slate-700">👤 {{ user.nickname }}</span>
                  <button @click="handleAddSubManager(user.nickname)" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition">권한부여</button>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">현재 서브 매니저</p>
              <div v-for="sm in boardPolicy?.subManagers" :key="sm.id" class="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
                <span class="font-bold text-slate-700">🛡️ {{ sm.nickname }}</span>
                <button @click="handleRemoveSubManager(sm.nickname)" class="text-xs font-bold text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">해임</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'categories'" class="space-y-8">
            <div v-if="isMainManager" class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div class="flex gap-2">
                <input v-model="newCategoryName" maxlength="10" @keyup.enter="handleAddCategory" class="flex-1 px-5 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="새 카테고리명 (2~10자)" />
                <button @click="handleAddCategory" class="px-6 bg-indigo-600 text-white rounded-xl font-bold">추가</button>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table class="w-full text-left border-collapse bg-white">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter w-20 text-center">순서</th>
                    <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter">카테고리명</th>
                    <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter text-right">관리</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="(cat, index) in localCategories" :key="cat.id" class="hover:bg-slate-50/30 transition-colors">
                    <td class="px-6 py-4">
                      <div v-if="isMainManager" class="flex flex-col items-center gap-0.5">
                        <button @click="moveOrder(index, -1)" :disabled="index === 0" class="text-slate-300 hover:text-indigo-600 disabled:opacity-10 transition p-1">▲</button>
                        <button @click="moveOrder(index, 1)" :disabled="index === localCategories.length - 1" class="text-slate-300 hover:text-indigo-600 disabled:opacity-10 transition p-1">▼</button>
                      </div>
                      <span v-else class="text-xs font-bold text-slate-300 text-center block">{{ index + 1 }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span v-if="getType(cat) === 'NOTICE'" class="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-md">공지</span>
                        <span v-else-if="getType(cat) === 'GENERAL'" class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md">기본</span>
                        <span class="font-bold text-slate-700">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end items-center gap-2">
                        <template v-if="deletingCategoryId !== cat.id">
                          <button @click="openEditPrompt(cat)" class="px-3 py-2 text-slate-400 hover:text-indigo-600 transition text-xs font-bold">수정</button>
                          <button v-if="getType(cat) === 'CUSTOM' && isMainManager" @click="startDelete(cat.id)" class="px-3 py-2 text-slate-400 hover:text-red-500 transition text-xs font-bold">삭제</button>
                        </template>

                        <template v-else>
                          <select v-model="selectedMoveToId" class="text-xs p-1 border rounded bg-white outline-none focus:ring-1 focus:ring-red-400">
                            <option value="" disabled>이동할 곳 선택</option>
                            <option v-for="dest in getMoveDestinations(cat.id)" :key="dest.id" :value="dest.id">
                              {{ dest.name }} (으)로 이동
                            </option>
                          </select>
                          <button @click="handleConfirmDelete" :disabled="!selectedMoveToId" class="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">확인</button>
                          <button @click="deletingCategoryId = null" class="text-xs font-bold text-slate-400 px-2 py-1">취소</button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="isOrderChanged" class="flex justify-center pt-2">
              <button @click="handleSaveOrder" class="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                변경된 순서 저장하기
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

// --- 정렬 및 삭제 상태 ---
const localCategories = ref([])
const isOrderChanged = ref(false)
const deletingCategoryId = ref(null) // 현재 삭제를 시도 중인 카테고리 ID
const selectedMoveToId = ref('')      // 게시글을 이동할 대상 카테고리 ID

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

// 2번 반영: 부분 업데이트
async function handleSaveOrder() {
  try {
    const payload = localCategories.value.map((cat, idx) => ({ id: cat.id, sortOrder: idx, name: cat.name }))
    await api.patch(`/boards/${boardId.value}/post-categories/batch`, payload)
    boardStore.categories = [...localCategories.value] // 스토어 즉시 업데이트
    isOrderChanged.value = false
    alert('저장되었습니다.')
  } catch (err) { alert('저장 실패') }
}

// --- 카테고리 관리 로직 ---
const newCategoryName = ref('')
async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (name.length < 2 || name.length > 10) return alert('2~10자로 입력해주세요.')
  try {
    const res = await api.post(`/boards/${boardId.value}/post-categories`, { name })
    boardStore.categories.push(res.data) // 부분 업데이트
    newCategoryName.value = ''
  } catch (err) { alert(err?.response?.data?.message || '추가 실패') }
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

// --- 삭제 개선 로직 ---
function startDelete(id) {
  deletingCategoryId.value = id
  selectedMoveToId.value = '' // 초기화
}

function getMoveDestinations(targetId) {
  // 나 자신과 공지사항을 제외한 모든 카테고리가 이동 대상이 될 수 있음
  return localCategories.value.filter(c => c.id !== targetId && getType(c) !== 'NOTICE')
}

async function handleConfirmDelete() {
  const targetId = deletingCategoryId.value
  const moveToId = selectedMoveToId.value
  const categoryName = localCategories.value.find(c => c.id === targetId)?.name

  if (!confirm(`'${categoryName}'을(를) 삭제하고 모든 게시글을 이동하시겠습니까?`)) return

  try {
    await api.delete(`/boards/${boardId.value}/post-categories/${targetId}`, { params: { moveToId } })
    boardStore.categories = boardStore.categories.filter(c => c.id !== targetId) // 부분 업데이트
    deletingCategoryId.value = null
  } catch (err) { alert('삭제 실패') }
}

// --- 기타 정책 로직 (부분 업데이트 적용) ---
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
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
section { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>