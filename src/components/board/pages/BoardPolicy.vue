<template>
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <!-- 배경 -->
    <div class="absolute inset-0 bg-black opacity-30" @click="$emit('close')"></div>

    <!-- 모달 본문 -->
    <div class="bg-white rounded-lg shadow-lg w-[90%] max-w-xl p-6 z-60">
      <h3 class="text-lg font-semibold mb-4">게시판 정책 변경</h3>

      <!-- 인기글 정책 -->
      <div class="mb-6">
        <label class="block text-sm text-gray-700 mb-1">인기글 좋아요 기준</label>
        <input v-model="localThreshold" type="number" class="w-full border px-3 py-2 rounded" />
        <div class="flex justify-end mt-2">
          <button @click="handleUpdateThreshold" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
            저장
          </button>
        </div>
      </div>

      <!-- 유저 검색 -->
      <div class="mb-6">
        <label class="block text-sm text-gray-700 mb-1">유저 검색 (닉네임)</label>
        <input v-model="searchNickname" class="w-full border px-3 py-2 rounded" placeholder="닉네임 입력" />
        <div class="flex justify-end mt-2">
          <button @click="handleSearchUser(0)" class="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
            검색
          </button>
        </div>
      </div>

      <!-- 검색 결과 -->
      <div v-if="searchResults.length" class="mt-4">
        <h4 class="text-sm font-semibold mb-2">검색 결과</h4>
        <ul class="text-sm text-gray-700 space-y-1">
          <li v-for="user in searchResults" :key="user.id" class="flex justify-between items-center">
            <span>{{ user.nickname }}</span>
            <button @click="handleAddSubManager(user.nickname)" class="px-2 py-1 bg-green-600 text-white rounded text-xs">
              추가
            </button>
          </li>
        </ul>

        <!-- 페이지네이션 -->
        <div class="flex gap-2 mt-4 justify-center">
          <button
            @click="prevPageGroup"
            :disabled="pageGroupStart === 0"
            class="px-2 py-1 border rounded"
          >
            이전
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="handleSearchUser(page-1)"
            :class="page-1 === currentPage ? 'bg-indigo-600 text-white' : 'bg-gray-200'"
            class="px-2 py-1 rounded"
          >
            {{ page }}
          </button>

          <button
            @click="nextPageGroup"
            :disabled="pageGroupStart + 5 >= totalPages"
            class="px-2 py-1 border rounded"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 현재 서브 매니저 목록 -->
      <div v-if="boardPolicy?.subManagers?.length" class="mt-6">
        <h4 class="text-sm font-semibold mb-2">현재 서브 매니저</h4>
        <ul class="text-sm text-gray-700 space-y-1">
          <li v-for="sm in boardPolicy.subManagers" :key="sm.id" class="flex justify-between items-center">
            <span>{{ sm.nickname }}</span>
            <button @click="handleRemoveSubManager(sm.nickname)" class="text-red-600 text-sm">삭제</button>
          </li>
        </ul>
      </div>

      <!-- 닫기 버튼 -->
      <div class="flex justify-end mt-6">
        <button @click="$emit('close')" class="px-3 py-1 border rounded text-sm">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/axios'

const props = defineProps({
  boardId: { type: String, required: true },
  boardPolicy: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])

const localThreshold = ref(props.boardPolicy.likeThreshold || 0)
const searchNickname = ref('')
const searchResults = ref([])
const totalPages = ref(0)
const currentPage = ref(0)
const pageGroupStart = ref(0)

// 현재 보여줄 페이지 번호들 (5개씩)
const visiblePages = computed(() => {
  const end = Math.min(pageGroupStart.value + 5, totalPages.value)
  const pages = []
  for (let i = pageGroupStart.value + 1; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

/** 정책 업데이트 */
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

/** 유저 검색 (페이징) */
async function handleSearchUser(page = 0, size = 5) {
  if (!searchNickname.value) {
    alert('닉네임을 입력하세요.')
    return
  }
  try {
    const res = await api.get(`/users/nickname/${encodeURIComponent(searchNickname.value)}`, {
      params: { page, size }
    })
    searchResults.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '유저 검색 중 오류가 발생했습니다.')
  }
}

/** 서브 매니저 추가 */
async function handleAddSubManager(nickname) {
  try {
    await api.post(`/boards/${props.boardId}/policy/sub-managers`, { nickname })
    emit('updated')
    alert(`${nickname} 님이 서브 매니저로 추가되었습니다.`)
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 추가 중 오류가 발생했습니다.')
  }
}

/** 서브 매니저 삭제 */
async function handleRemoveSubManager(nickname) {
  if (!confirm(`${nickname} 을(를) 서브 매니저에서 삭제하시겠습니까?`)) return
  try {
    await api.delete(`/boards/${props.boardId}/policy/sub-managers`, { data: { nickname } })
    emit('updated')
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || '서브 매니저 삭제 중 오류가 발생했습니다.')
  }
}

/** 페이지 그룹 이동 */
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
</style>