import { ref, computed } from 'vue'
import api from '@/axios'

export default function useBoard(boardId) {
  const board = ref(null)
  const posts = ref([])
  const voteSession = ref(null)
  const pageInfo = ref({ totalPages: 0, number: 0, first: true, last: true })

  const blockSize = 5
  const currentBlock = computed(() => Math.floor(pageInfo.value.number / blockSize))

  const visiblePages = computed(() => {
    const start = currentBlock.value * blockSize + 1
    const end = Math.min(start + blockSize - 1, pageInfo.value.totalPages || 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  async function fetchBoard() {
    const res = await api.get(`/boards/${boardId}`)
    board.value = res.data
  }

  async function fetchVoteSession() {
    try {
      const res = await api.get(`/boards/${boardId}/vote-session`)
      voteSession.value = res.data
    } catch {
      voteSession.value = null
    }
  }

  async function fetchPosts(page) {
    const res = await api.get(`/posts/board/${boardId}`, { params: { page, size: 30 } })
    posts.value = res.data.content
    pageInfo.value = {
      totalPages: res.data.totalPages,
      number: res.data.number,
      first: res.data.first,
      last: res.data.last
    }
  }

  function goToBlock(block) {
    const page = Math.max(0, Math.min(block * blockSize, pageInfo.value.totalPages - 1))
    fetchPosts(page)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return {
    board, posts, voteSession, pageInfo,
    visiblePages, currentBlock,
    fetchBoard, fetchVoteSession, fetchPosts, goToBlock, formatDate
  }
}