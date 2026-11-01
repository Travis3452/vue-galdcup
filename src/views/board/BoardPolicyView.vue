<template>
  <Teleport to="body">
  <div class="dialog-overlay">
    <div class="absolute inset-0 bg-[var(--ui-overlay)] transition-opacity" @click="closeDialog"></div>

    <div ref="dialog" role="dialog" aria-modal="true" aria-labelledby="board-settings-title" tabindex="-1" class="policy-dialog">
      
      <aside class="policy-sidebar">
        <div class="hidden md:block p-8 pb-4">
          <h3 class="text-xl font-semibold text-indigo-600 flex items-center gap-2">
            <span>⚙️</span> 설정
          </h3>
          <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Board Settings</p>
        </div>

        <nav class="policy-tabs" aria-label="게시판 설정 메뉴">
          <button 
            v-for="tab in filteredTabs" :key="tab.id"
            @click="activeTab = tab.id" :aria-pressed="activeTab === tab.id" :disabled="pending"
            class="policy-tab"
            :class="activeTab === tab.id ? 'bg-[var(--ui-surface)] md:bg-[var(--ui-surface)] text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-500 hover:bg-slate-100'"
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <div class="policy-main">
        <header class="h-14 md:h-20 flex items-center justify-between px-6 md:px-10 border-b border-slate-50 shrink-0">
          <h4 id="board-settings-title" class="text-base md:text-lg font-semibold text-slate-800">{{ currentTabLabel }}</h4>
          <button aria-label="게시판 설정 닫기" :disabled="pending" @click="closeDialog" class="icon-button">✕</button>
        </header>

        <div class="policy-body">
          <p v-if="errorMessage" role="alert" class="mb-4 text-sm text-rose-700">{{ errorMessage }}</p>
          <p v-if="pending" role="status" class="mb-4 text-sm text-indigo-700">처리하는 중입니다…</p>
          <section v-show="activeTab === 'threshold'" class="space-y-6">
            <div class="bg-indigo-50 rounded-2xl md:rounded-2xl p-6 md:p-8 border border-indigo-100">
              <p class="text-xs md:text-sm text-indigo-600 font-bold mb-4 leading-relaxed">
                게시글의 좋아요 수가 설정값에 도달하면 인기 목록에 자동으로 노출됩니다.
              </p>
              <div class="flex flex-col sm:flex-row gap-3">
                <input v-model="localThreshold" aria-label="인기글 좋아요 기준" type="number" min="0" step="1" class="form-control" />
                <button @click="handleUpdateThreshold" :disabled="pending" class="ui-button ui-button-secondary">저장</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'managers'" class="space-y-6">
            <div class="flex flex-col sm:flex-row gap-2">
              <input v-model="searchNickname" aria-label="서브 매니저 닉네임 검색" @keyup.enter="handleSearchUser" class="form-control" placeholder="서브 매니저로 추가할 유저 검색" />
              <button @click="handleSearchUser" :disabled="pending" class="ui-button ui-button-secondary">검색</button>
            </div>

            <div v-if="searchResults.length > 0" class="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 border border-slate-100">
              <div v-for="user in searchResults" :key="user.id" class="flex justify-between items-center p-3 bg-[var(--ui-surface)] rounded-xl mb-2 shadow-sm">
                <span class="text-xs md:text-sm font-bold text-slate-700 truncate mr-2">👤 {{ user.nickname }}</span>
                <button @click="handleAddSubManager(user.nickname)" class="ui-button ui-button-secondary">권한부여</button>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">현재 서브 매니저</p>
              <div v-for="sm in boardPolicy?.subManagers" :key="sm.id" class="flex justify-between items-center p-4 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-slate-50 transition">
                <span class="font-bold text-slate-700 text-sm">🛡️ {{ sm.nickname }}</span>
                <button @click="handleRemoveSubManager(sm.nickname)" class="ui-button ui-button-danger-outline">해임</button>
              </div>
            </div>
          </section>

          <section v-show="activeTab === 'categories'" class="space-y-6 pb-10">
            <div v-if="isMainManager" class="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-2xl border border-slate-100">
              <div class="flex flex-col sm:flex-row gap-2">
                <input v-model="newCategoryName" aria-label="새 카테고리 이름" maxlength="10" @keyup.enter="handleAddCategory" class="form-control" placeholder="새 카테고리명 (2~10자)" />
                <button @click="handleAddCategory" :disabled="pending" class="ui-button ui-button-secondary">추가</button>
              </div>
            </div>

            <div class="table-scroll">
              <table class="data-table policy-table"><caption class="sr-only">카테고리 순서와 이름 및 관리 작업</caption>
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-16 text-center">순서</th>
                    <th scope="col" class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">명칭</th>
                    <th scope="col" class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">관리</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="(cat, index) in localCategories" :key="cat.id" class="hover:bg-slate-50/30 transition-colors h-16 md:h-[72px]">
                    <td class="px-2 md:px-6 py-2 text-center">
                      <div v-if="isMainManager" class="flex flex-col items-center gap-0">
                        <button aria-label="카테고리 위로 이동" @click="moveOrder(index, -1)" :disabled="pending || index === 0" class="icon-button">▲</button>
                        <button aria-label="카테고리 아래로 이동" @click="moveOrder(index, 1)" :disabled="pending || index === localCategories.length - 1" class="icon-button">▼</button>
                      </div>
                      <span v-else class="text-xs font-bold text-slate-300">{{ index + 1 }}</span>
                    </td>
                    <td class="px-4 py-2">
                      <div class="flex items-center gap-2">
                        <span v-if="getType(cat) === 'NOTICE'" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">공지</span>
                        <span v-else-if="getType(cat) === 'GENERAL'" class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded">기본</span>
                        <span class="font-bold text-slate-700 text-xs md:text-sm truncate max-w-[150px]">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-right">
                      <div class="flex justify-end items-center gap-1">
                        <template v-if="deletingCategoryId !== cat.id">
                          <button v-if="isMainManager" @click="openEditPrompt(cat)" class="ui-button ui-button-secondary">수정</button>
                          <button v-if="getType(cat) === 'CUSTOM' && isMainManager" @click="deletingCategoryId = cat.id" class="ui-button ui-button-danger-outline">삭제</button>
                        </template>
                        <template v-else>
                          <div class="flex items-center gap-1 animate-fadeIn">
                            <select v-model="selectedMoveToId" aria-label="게시글을 옮길 카테고리" class="form-control">
                              <option value="" disabled>이관 선택</option>
                              <option v-for="dest in getMoveDestinations(cat.id)" :key="dest.id" :value="dest.id">{{ dest.name }}</option>
                            </select>
                            <button @click="handleConfirmDelete(cat)" :disabled="pending || !selectedMoveToId" class="ui-button ui-button-danger">이관 후 삭제</button>
                            <button @click="deletingCategoryId = null" aria-label="카테고리 삭제 취소" class="icon-button">✕</button>
                          </div>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="isOrderChanged" class="flex justify-center pt-4">
              <button @click="handleSaveOrder" :disabled="pending" class="ui-button ui-button-secondary">순서 저장</button>
            </div>
          </section>

          <section v-show="activeTab === 'delegate'" class="space-y-6">
            <div class="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8">
              <h5 class="text-red-600 font-semibold text-lg mb-2">⚠️ 권한 위임 주의사항</h5>
              <ul class="text-red-500 text-xs md:text-sm font-bold space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>게시판 관리자 권한을 다른 유저에게 완전히 넘깁니다.</li>
                <li>이 작업은 취소할 수 없으며, 권한이 위임되면 즉시 일반 사용자로 전환됩니다.</li>
              </ul>
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <input v-model="delegateNickname" aria-label="위임할 관리자 닉네임 검색" @keyup.enter="handleSearchDelegate" class="form-control" placeholder="새로운 메인 관리자 닉네임 검색" />
              
              <button  @click="handleSearchDelegate" :disabled="pending" class="ui-button ui-button-secondary"> 검색 </button>
            </div>

            <div v-if="delegateSearchResults.length > 0" class="bg-slate-50 rounded-xl md:rounded-2xl p-4 border border-slate-100">
              <div v-for="user in delegateSearchResults" :key="user.id" class="flex justify-between items-center p-4 bg-[var(--ui-surface)] rounded-xl mb-2 shadow-sm border border-red-50">
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-slate-800">👤 {{ user.nickname }}</span>
                  <span class="text-xs text-slate-500 font-bold">이 유저에게 모든 권한을 넘깁니다.</span>
                </div>
                <button @click="handleDelegateManager(user.nickname)" class="ui-button ui-button-danger-outline">위임하기</button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import { useBoardStore } from '@/stores/board'
import { useUserStore } from '@/stores/user'
import { useDialog } from '@/composables/useDialog'
import { getErrorMessage } from '@/utils/request'

const route = useRoute()
const boardStore = useBoardStore()
const userStore = useUserStore()
const emit = defineEmits(['close'])

const activeTab = ref('categories')
const dialog = ref(null)
const pending = ref(false)
const errorMessage = ref('')
function closeDialog() { if (!pending.value) emit('close') }
useDialog(dialog, () => true, closeDialog)
const boardId = computed(() => route.params.boardId)
const boardPolicy = computed(() => boardStore.currentPolicy)
const categories = computed(() => boardStore.categories)

const isMainManager = computed(() => {
  const managerId = boardPolicy.value?.boardManager?.id
  const myId = userStore.id
  return managerId && myId && Number(managerId) === Number(myId)
})

// 메인 관리자 여부에 따라 탭 필터링
const tabs = [
  { id: 'threshold', label: '인기글 기준', icon: '🔥' },
  { id: 'managers', label: '서브 매니저 관리', icon: '🛡️' },
  { id: 'categories', label: '카테고리 관리', icon: '🏷️' },
  { id: 'delegate', label: '권한 위임', icon: '👑' }
]
const filteredTabs = computed(() => {
  if (isMainManager.value) return tabs
  return tabs.filter(t => t.id === 'categories')
})

const currentTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

// --- 권한 위임 관련 상태 및 로직 ---
const delegateNickname = ref('')
const delegateSearchResults = ref([])

async function handleSearchDelegateAction() {
  if (!delegateNickname.value.trim()) return
  try {
    const res = await api.get(`/users/nickname/${encodeURIComponent(delegateNickname.value.trim())}`, { params: { size: 3 } })
    delegateSearchResults.value = res.data.content || []
  } catch (err) { errorMessage.value = getErrorMessage(err, '검색에 실패했습니다.') }
}

async function handleDelegateManagerAction(nickname) {
  if (!confirm(`정말로 모든 관리 권한을 ${nickname}님에게 위임하시겠습니까? \n이 작업은 즉시 본인의 관리자 권한을 해제합니다.`)) return
  
  try {
    // 백엔드: @PostMapping("/{boardId}/delegate")
    // 데이터: BoardRequest.Delegate { String nickname }
    const res = await api.post(`/boards/${boardId.value}/delegate`, { nickname })
    
    alert(`${nickname}님에게 권한이 위임되었습니다. 일반 유저로 전환됩니다.`)
    
    // 권한이 상실되었으므로 스토어 업데이트 및 모달 닫기
    if (boardStore.currentPolicy) {
      boardStore.currentPolicy.boardManager = res.data.boardManager
      boardStore.currentPolicy.subManagers = res.data.subManagers
    }
    emit('close')

  } catch (err) {
    alert(err.response?.data?.message || '위임 실패')
  }
}

// --- 기존 로직 (생략 방지를 위해 핵심만 유지) ---
const getType = (cat) => (cat.categoryType || cat.type || '').toUpperCase()
const localCategories = ref([])
const isOrderChanged = ref(false)
const newCategoryName = ref('')
const deletingCategoryId = ref(null)
const selectedMoveToId = ref('')

watch(categories, (newVal) => {
  if (newVal) {
    localCategories.value = [...newVal]
    isOrderChanged.value = false
  }
}, { immediate: true })

const localThreshold = ref(0)
watch(() => boardPolicy.value?.likeThreshold, (n) => localThreshold.value = n || 0, { immediate: true })

async function handleUpdateThresholdAction() {
  const threshold = Number(localThreshold.value)
  if (!Number.isSafeInteger(threshold) || threshold < 0) { errorMessage.value = '기준은 0 이상의 정수로 입력해 주세요.'; return }
  localThreshold.value = threshold
  try {
    await api.patch(`/boards/${boardId.value}/policy`, { likeThreshold: localThreshold.value })
    if (boardStore.currentPolicy) boardStore.currentPolicy.likeThreshold = localThreshold.value
    alert('정책 수정 완료')
  } catch (err) { alert('저장 실패') }
}

const searchNickname = ref(''); const searchResults = ref([])
async function handleSearchUserAction() {
  if (!searchNickname.value.trim()) return
  try {
    const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value.trim())}`)
    searchResults.value = res.data.content || []
  } catch (error) { errorMessage.value = getErrorMessage(error, '검색에 실패했습니다.') }
}

async function handleAddSubManagerAction(nickname) {
  try {
    const res = await api.post(`/boards/${boardId.value}/policy/sub-managers`, { nickname })
    if (boardStore.currentPolicy) boardStore.currentPolicy.subManagers = res.data.subManagers
    searchResults.value = []; searchNickname.value = ''
    alert('서브 매니저 임명 완료')
  } catch (err) { alert('추가 실패') }
}

async function handleRemoveSubManagerAction(nickname) {
  if (!confirm('해임하시겠습니까?')) return
  try {
    const res = await api.delete(`/boards/${boardId.value}/policy/sub-managers`, { data: { nickname } })
    if (boardStore.currentPolicy) boardStore.currentPolicy.subManagers = res.data.subManagers
  } catch (err) { alert('해임 실패') }
}

async function handleAddCategoryAction() {
  const name = newCategoryName.value.trim()
  if (name.length < 2) return alert('2자 이상 입력')
  try {
    const res = await api.post(`/boards/${boardId.value}/post-categories`, { name })
    boardStore.categories = [...boardStore.categories, res.data]
    newCategoryName.value = ''
  } catch (err) { alert('추가 실패') }
}

function getMoveDestinations(targetId) {
  return localCategories.value.filter(c => c.id !== targetId && getType(c) !== 'NOTICE')
}

async function handleConfirmDeleteAction(cat) {
  if (!selectedMoveToId.value) return
  try {
    await api.delete(`/boards/${boardId.value}/post-categories/${cat.id}`, { params: { moveToId: selectedMoveToId.value } })
    boardStore.categories = boardStore.categories.filter(c => c.id !== cat.id)
    deletingCategoryId.value = null; selectedMoveToId.value = ''
  } catch (err) { alert('삭제 실패') }
}

function moveOrder(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localCategories.value.length) return
  const temp = [...localCategories.value]
  const [movedItem] = temp.splice(index, 1)
  temp.splice(newIndex, 0, movedItem)
  localCategories.value = temp
  isOrderChanged.value = true
}

async function handleSaveOrderAction() {
  try {
    const payload = localCategories.value.map((cat, idx) => ({ id: cat.id, sortOrder: idx, name: cat.name }))
    await api.patch(`/boards/${boardId.value}/post-categories/batch`, payload)
    boardStore.categories = [...localCategories.value]
    isOrderChanged.value = false
    alert('저장 완료')
  } catch (err) { alert('저장 실패') }
}
async function openEditPromptAction(category) {
  if (!isMainManager.value) return
  const answer = window.prompt('카테고리 이름 (2~10자)', category.name)
  if (answer === null) return
  const name = answer.trim()
  if (name.length < 2 || name.length > 10) { errorMessage.value = '이름은 2~10자로 입력해 주세요.'; return }
  const response = await api.patch(`/boards/${boardId.value}/post-categories`, { id: category.id, name })
  boardStore.categories = boardStore.categories.map(item => item.id === category.id ? response.data : item)
}
function withPending(action) {
  return async (...args) => {
    if (pending.value) return
    pending.value = true
    errorMessage.value = ''
    try { return await action(...args) }
    catch (error) { errorMessage.value = getErrorMessage(error) }
    finally { pending.value = false }
  }
}
const handleSearchDelegate = withPending(handleSearchDelegateAction)
const handleDelegateManager = withPending(handleDelegateManagerAction)
const handleUpdateThreshold = withPending(handleUpdateThresholdAction)
const handleSearchUser = withPending(handleSearchUserAction)
const handleAddSubManager = withPending(handleAddSubManagerAction)
const handleRemoveSubManager = withPending(handleRemoveSubManagerAction)
const handleAddCategory = withPending(handleAddCategoryAction)
const handleConfirmDelete = withPending(handleConfirmDeleteAction)
const handleSaveOrder = withPending(handleSaveOrderAction)
const openEditPrompt = withPending(openEditPromptAction)
watch(isMainManager, () => { activeTab.value = isMainManager.value ? 'threshold' : 'categories' }, { immediate: true })
</script>
<style scoped>
.policy-dialog { position:relative; z-index:1; display:flex; flex-direction:column; width:100%; max-width:920px; height:min(720px,calc(100dvh - 24px)); overflow:hidden; border:1px solid var(--ui-border); border-radius:20px; background:var(--ui-surface); box-shadow:var(--ui-shadow-overlay); }
.policy-sidebar { flex:0 0 auto; min-width:0; padding:12px; border-bottom:1px solid var(--ui-border); background:var(--ui-surface-subtle); }
.policy-tabs { display:flex; flex-wrap:wrap; gap:6px; }
.policy-tab { display:flex; align-items:center; gap:6px; min-height:44px; padding:10px 12px; border:1px solid var(--ui-control-border); background:var(--ui-surface); border-radius:10px; color:var(--ui-secondary); font-size:13px; font-weight:550; text-align:left; }
.policy-tab:hover { border-color:var(--ui-primary); background:var(--ui-primary-soft); }
.policy-tab[aria-pressed="true"] { border-color:var(--ui-primary); color:var(--ui-primary); background:var(--ui-primary-soft); }
.policy-main { display:flex; flex:1; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.policy-main > header { min-height:64px; height:auto; padding:12px 20px; border-bottom:1px solid var(--ui-border); }
.policy-body { flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:20px; }
.policy-body section { min-width:0; }
.policy-body .form-control { min-width:0; }
.policy-table td:last-child > div { flex-wrap:wrap; }
.policy-table td:last-child .ui-button { padding-inline:10px; font-size:12px; }
@media(min-width:768px) { .policy-dialog { flex-direction:row; } .policy-sidebar { width:208px; border-bottom:0; border-right:1px solid var(--ui-border); padding:16px 12px; } .policy-tabs { flex-direction:column; } .policy-tab { width:100%; } }
@media(max-width:639px) {
  .policy-table thead { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
  .policy-table tbody { display:block; }
  .policy-table tbody tr { display:grid; grid-template-columns:56px minmax(0,1fr); height:auto; border-top:1px solid var(--ui-border); }
  .policy-table td { min-width:0; border-top:0; padding:12px; }
  .policy-table td:last-child { grid-column:1 / -1; border-top:1px solid var(--ui-divider); }
  .policy-table td:last-child > div { justify-content:flex-start; }
  .policy-table td .form-control { max-width:100%; }
}
.policy-table .text-slate-500 { color:var(--ui-text-muted); }
</style>
