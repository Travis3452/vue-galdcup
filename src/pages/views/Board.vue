<template>
  <div class="min-h-screen bg-indigo-50 py-10 flex justify-center">
    <div class="w-[95%] max-w-7xl bg-white border-2 border-gray-200 rounded-lg shadow-md flex flex-col">
      <!-- 게시판 정보 -->
      <div class="border-b-2 border-gray-200 px-6 py-6 bg-indigo-50 rounded-t-lg">
        <h1 class="text-3xl font-extrabold text-black flex items-center gap-2 justify-center">
          <span class="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">G</span>
          <span>{{ board?.topic }}</span>
        </h1>
        <p class="text-base text-gray-700 mt-2 italic text-center">{{ board?.description }}</p>
        <div class="text-sm text-gray-500 mt-2 text-center">
          상태:
          <span :class="board?.status === 'OPEN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
            {{ board?.status }}
          </span>
          · 생성일: {{ formatDate(board?.createdAt) }}
        </div>
      </div>

      <!-- 투표 정보 (아직 구현 X, 그대로 둠) -->
      <div v-if="voteSession" class="px-6 py-6 border-b-2 border-gray-200 bg-yellow-50 text-center">
        <h2 class="text-lg font-semibold text-indigo-700 mb-4">⚔️ 투표</h2>
        <p class="text-sm text-gray-700 mb-4">
          기간: {{ formatDate(voteSession.startTime) }} ~ {{ formatDate(voteSession.endTime) }}
        </p>
        <div class="flex items-center justify-center gap-6" :class="voteSession.options.length === 2 ? 'flex-row' : 'flex-wrap'">
          <template v-for="(opt, idx) in voteSession.options" :key="idx">
            <div class="flex flex-col items-center w-40">
              <img :src="voteSession.optionImages?.[idx] || 'https://via.placeholder.com/150'" class="w-32 h-32 object-cover rounded border mb-2" />
              <span class="text-gray-800 font-semibold">{{ opt }}</span>
            </div>
            <div v-if="idx < voteSession.options.length - 1" class="text-2xl font-bold text-red-600">VS</div>
          </template>
        </div>
        <div class="flex justify-center mt-6">
          <!-- 투표하기 라우트는 아직 구현되지 않았으므로 그대로 둠 -->
          <router-link :to="`/boards/${route.params.id}/vote-session/${voteSession.id}/participate`"
            class="inline-block px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold">
            투표하기
          </router-link>
        </div>
      </div>

      <!-- 게시글 목록 -->
      <div class="flex justify-between items-center px-6 py-3 border-b-2 border-gray-300 bg-gray-50">
        <h2 class="text-base font-semibold text-gray-700">게시글 목록</h2>
        <router-link :to="`/boards/${route.params.boardId}/posts/create`"
          class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
          글쓰기
        </router-link>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b-2 border-gray-300 text-gray-600">
            <th class="px-4 py-2 text-left w-2/5">제목</th>
            <th class="px-4 py-2 text-center w-1/5">작성자</th>
            <th class="px-4 py-2 text-center w-1/5">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id" class="border-b border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-2 truncate">
              <router-link :to="`/boards/${route.params.boardId}/posts/${post.id}`" class="text-gray-800 hover:text-indigo-600">
                {{ post.title }}
              </router-link>
            </td>
            <td class="px-4 py-2 text-center text-gray-600">{{ post.authorNickname }}</td>
            <td class="px-4 py-2 text-center text-gray-600">{{ formatDate(post.createdAt) }}</td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="3" class="px-4 py-6 text-center text-gray-500">아직 게시글이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div class="flex justify-center py-4 space-x-1">
        <button @click="goToBlock(currentBlock - 1)" :disabled="pageInfo.number === 0"
          class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          이전
        </button>
        <button v-for="page in visiblePages" :key="page" @click="fetchPosts(page - 1)"
          class="px-3 py-1 border border-gray-300 rounded text-sm"
          :class="pageInfo.number === page - 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-100'">
          {{ page }}
        </button>
        <button @click="goToBlock(currentBlock + 1)" :disabled="pageInfo.number >= pageInfo.totalPages - 1"
          class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useBoard from '@/pages/scripts/Board.js'

const route = useRoute()
const {
  board, posts, voteSession, pageInfo,
  visiblePages, currentBlock,
  fetchBoard, fetchVoteSession, fetchPosts, goToBlock, formatDate
} = useBoard(route.params.boardId)

onMounted(async () => {
  await fetchBoard()
  await fetchVoteSession()
  await fetchPosts(0)
})
</script>