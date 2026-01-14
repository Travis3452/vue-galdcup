<template>
  <div v-if="voteSession" class="px-6 py-6 border-b-2 border-gray-200 bg-yellow-50 text-center">
    <h2 class="text-lg font-semibold text-indigo-700 mb-4">⚔️ 투표</h2>
    <p class="text-sm text-gray-700 mb-4">
      기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
    </p>

    <div class="flex items-center justify-center gap-6" :class="voteSession.options?.length === 2 ? 'flex-row' : 'flex-wrap'">
      <template v-for="(opt, idx) in voteSession.options" :key="idx">
        <div class="flex flex-col items-center w-40">
          <img :src="opt.imageUrl || 'https://via.placeholder.com/150'"
               class="w-32 h-32 object-cover rounded border mb-2" />
          <span class="text-gray-800 font-semibold">{{ opt.label }}</span>
        </div>
        <div v-if="idx < (voteSession.options?.length || 0) - 1" class="text-2xl font-bold text-red-600">VS</div>
      </template>
    </div>

    <div class="flex justify-center mt-6 gap-4">
      <button
        @click="openVoteWindow(voteSession.id)"
        class="inline-block px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold"
      >
        투표하기
      </button>

      <button
        v-if="voteSession"
        @click="openVoteStatusWindow(route.params.boardId)"
        class="inline-block px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm font-semibold"
      >
        투표 현황 보기
      </button>
    </div>
  </div>

  <div v-else class="px-6 py-6 border-b-2 border-gray-200 bg-yellow-50 text-center text-sm text-gray-500">
    현재 진행 중인 투표가 없습니다.
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useVoteSession from '@/components/board/scripts/VoteSession.js'
import useBoardInfo from '@/components/board/scripts/BoardInfo.js' // formatDate 재사용

const route = useRoute()
const boardId = route.params.boardId

const { voteSession, fetchVoteSession, openVoteWindow, openVoteStatusWindow, formatDate: formatFromVote } = useVoteSession(boardId)
const { formatDate: formatFromBoardInfo } = useBoardInfo(boardId)
const formatDate = formatFromBoardInfo || formatFromVote

onMounted(async () => {
  await fetchVoteSession()
})
</script>