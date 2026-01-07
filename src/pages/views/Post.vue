<template>
  <div class="min-h-screen bg-indigo-50 py-10 flex justify-center">
    <div class="w-[90%] max-w-4xl bg-white border-2 border-gray-200 rounded-lg shadow-md p-8">
      
      <!-- 게시글 -->
      <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ post?.title }}</h1>
      <div class="flex justify-between items-center text-sm text-gray-600 border-b pb-3 mb-6">
        <span>👤 {{ post?.authorNickname }}</span>
        <div class="flex items-center space-x-4">
          <span>⏰ {{ formatDate(post?.createdAt) }}</span>
          <span>👁️ 조회수 {{ post?.view }}</span>
          <template v-if="store.id && post?.authorId === store.id">
            <button @click="editPost" class="px-3 py-1 bg-yellow-500 text-white rounded text-xs">수정</button>
            <button @click="deletePost" class="px-3 py-1 bg-red-500 text-white rounded text-xs">삭제</button>
          </template>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div class="prose max-w-none text-gray-800 mb-8 min-h-[300px]" v-html="post?.content"></div>

      <!-- 좋아요/싫어요 버튼 -->
      <div class="flex justify-center items-center space-x-6 mb-6">
        <button @click="reactToPost('LIKE')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          👍 좋아요 {{ post?.likeCount }}
        </button>
        <button @click="reactToPost('DISLIKE')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          👎 싫어요 {{ post?.dislikeCount }}
        </button>
      </div>

      <!-- 댓글 영역 -->
      <div class="bg-gray-100 border-t border-gray-300 rounded-lg p-6 mt-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">💬 댓글</h2>
        
        <!-- 댓글 목록 -->
        <div v-if="comments.length > 0" class="space-y-4 mb-6">
          <div v-for="comment in comments" :key="comment.id" class="border rounded p-4 bg-white">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>👤 {{ comment.authorNickname }}</span>
              <div class="flex items-center space-x-2">
                <span>{{ formatDate(comment.createdAt) }}</span>
                <template v-if="store.id && comment.authorId === store.id">
                  <button @click="editComment(comment)" class="px-2 py-1 bg-yellow-500 text-white rounded text-xs">수정</button>
                  <button @click="deleteComment(comment.id)" class="px-2 py-1 bg-red-500 text-white rounded text-xs">삭제</button>
                </template>
              </div>
            </div>
            <p class="text-gray-800 mb-2">{{ comment.content }}</p>

            <!-- 대댓글 달기 버튼 -->
            <button 
              @click="toggleReplyBox(comment.id)" 
              class="text-xs text-indigo-600 hover:underline"
            >
              ↳ 대댓글 달기
            </button>

            <!-- 대댓글 목록 -->
            <div v-if="replies[comment.id]" class="ml-6 space-y-2 mt-2">
              <div v-for="reply in replies[comment.id]" :key="reply.id" class="border-l-2 pl-3 text-sm text-gray-700">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>↳ {{ reply.authorNickname }}</span>
                  <div class="flex items-center space-x-2">
                    <span>{{ formatDate(reply.createdAt) }}</span>
                    <template v-if="store.id && reply.authorId === store.id">
                      <button @click="editReply(reply)" class="px-2 py-1 bg-yellow-500 text-white rounded text-xs">수정</button>
                      <button @click="deleteReply(reply.id)" class="px-2 py-1 bg-red-500 text-white rounded text-xs">삭제</button>
                    </template>
                  </div>
                </div>
                <p>{{ reply.content }}</p>
              </div>
            </div>

            <!-- 대댓글 입력창 -->
            <div v-if="activeReplyBox === comment.id" class="mt-2 ml-6 bg-white border rounded p-3">
              <textarea
                v-model="newReplies[comment.id]"
                rows="2"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="대댓글을 입력하세요..."
              ></textarea>
              <div class="flex justify-end mt-1">
                <button
                  @click="createReply(comment.id)"
                  class="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500">아직 댓글이 없습니다.</p>

        <!-- 댓글 작성 -->
        <div class="mt-6 bg-white border rounded p-4">
          <textarea
            v-model="newComment"
            rows="3"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="댓글을 입력하세요..."
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="createComment"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              등록
            </button>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-center space-x-2 mt-6">
          <button
            @click="prevPage"
            :disabled="currentPage === 0"
            class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            이전
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page - 1)"
            :class="[
              'px-3 py-1 rounded',
              currentPage + 1 === page ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="nextPage"
            :disabled="!hasNextPage"
            class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import usePost from '@/pages/scripts/Post.js'

const {
  store,
  post,
  comments,
  replies,
  newComment,
  newReplies,
  currentPage,
  totalPages,
  hasNextPage,
  activeReplyBox,
  visiblePages,
  formatDate,
  fetchPost,
  fetchComments,
  createComment,
  createReply,
  toggleReplyBox,
  prevPage,
  nextPage,
  goToPage,
  editComment,
  deleteComment,
  editReply,
  deleteReply,
  editPost,
  deletePost,
  reactToPost
} = usePost()

onMounted(() => {
  const boardId = route.params.boardId
  const postId = route.params.postId
  fetchPost(boardId, postId)
  fetchComments(boardId, postId)
})

</script>