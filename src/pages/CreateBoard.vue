<template>
  <div class="min-h-screen bg-indigo-50 flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white shadow rounded-lg p-10">
      <h1 class="text-2xl font-bold text-indigo-700 mb-3">새 게시판 생성</h1>
      <p class="text-base text-gray-600 mb-8">
        주제와 설명을 입력해 새로운 토론 공간을 만들어보세요.
      </p>

      <form @submit.prevent="createBoard" class="space-y-6">
        <div>
          <label class="block text-gray-700 text-sm mb-2">주제</label>
          <input
            v-model="topic"
            type="text"
            class="w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="게시판 주제를 입력하세요"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm mb-2">설명 (선택)</label>
          <textarea
            v-model="description"
            rows="6"
            class="w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="간단한 설명을 입력하세요"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? '생성 중...' : '게시판 생성하기' }}
        </button>
      </form>

      <div v-if="errorMessage" class="mt-6 bg-red-100 text-red-700 px-4 py-2 rounded">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const topic = ref('')
const description = ref('')
const errorMessage = ref('')
const loading = ref(false)
const store = useUserStore()
const router = useRouter()

async function createBoard() {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/boards`,
      {
        topic: topic.value,
        description: description.value?.trim() || null,
      },
      {
        headers: {
          Authorization: `Bearer ${store.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const boardId = response.data.id
    router.push(`/boards/${boardId}/votesession/create`)
  } catch (e) {
    errorMessage.value = '게시판 생성에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>