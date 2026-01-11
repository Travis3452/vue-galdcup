<template>
  <div class="min-h-screen bg-indigo-50 py-10 flex justify-center">
    <div class="w-[95%] max-w-3xl bg-white border-2 border-gray-200 rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-center text-indigo-700 mb-6">
        투표하기
      </h1>

      <div v-if="voteSession" class="space-y-6">
        <p class="text-center text-gray-600">
          기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
        </p>

        <!-- 옵션 선택 -->
        <div class="flex flex-wrap justify-center gap-6">
          <div
            v-for="(opt, idx) in voteSession.options"
            :key="idx"
            class="flex flex-col items-center w-40 cursor-pointer"
            @click="selectedOptionIndex = idx"
          >
            <img
              :src="opt.imageUrl || 'https://via.placeholder.com/150'"
              class="w-32 h-32 object-cover rounded border mb-2"
              :class="selectedOptionIndex === idx ? 'ring-4 ring-indigo-600' : ''"
            />
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="voteOption"
                :value="idx"
                v-model="selectedOptionIndex"
                class="form-radio text-indigo-600"
              />
              <span class="text-gray-800 font-semibold">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- 투표 버튼 -->
        <div class="flex justify-center mt-6">
          <button
            @click="submitVote"
            :disabled="selectedOptionIndex === null"
            class="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold disabled:opacity-50"
          >
            투표하기
          </button>
        </div>
      </div>

      <div v-else class="text-center text-gray-500">
        투표 세션 정보를 불러오는 중입니다...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const voteSession = ref(null)
const selectedOptionIndex = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

async function fetchVoteSession() {
  try {
    const res = await api.get(`/boards/${route.params.boardId}/vote-session`)
    voteSession.value = res.data
  } catch (err) {
    console.error('투표 세션 불러오기 실패', err)
  }
}

async function submitVote() {
  if (selectedOptionIndex.value === null) return
  try {
    await api.post(
      '/votes',
      {
        voteSessionId: voteSession.value.id,
        selectedOptionIndex: selectedOptionIndex.value
      },
      { headers: { Authorization: `Bearer ${store.accessToken}` } }
    )
    alert('투표가 완료되었습니다!')
    window.close()
  } catch (err) {
    console.error('투표 실패', err)
    if (err.response && err.response.data && err.response.data.message) {
      alert(`${err.response.data.message}`)
    } else {
      alert('알 수 없는 오류가 발생했습니다.')
    }
  }
}

onMounted(fetchVoteSession)
</script>