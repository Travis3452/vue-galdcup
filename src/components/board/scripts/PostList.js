import { ref, computed } from 'vue'
import api from '@/axios'

export default function useBoardPosts(boardId) {
  const posts = ref([])
  const pageInfo = ref({ totalPages: 0, number: 0, first: true, last: true })
  const blockSize = 5

  const currentBlock = computed(() => Math.floor(pageInfo.value.number / blockSize))

  const visiblePages = computed(() => {
    const start = currentBlock.value * blockSize + 1
    const end = Math.min(start + blockSize - 1, pageInfo.value.totalPages || 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  /**
   * 게시글 목록 조회
   * @param {number} page - 페이지 번호
   * @param {'latest'|'popular'} type - 탭 타입 (최신글 / 인기글)
   */
  async function fetchPosts(page, type = 'latest') {
    const url =
      type === 'popular'
        ? `/posts/board/${boardId}/popular`
        : `/posts/board/${boardId}`

    const res = await api.get(url, { params: { page, size: 30 } })
    posts.value = res.data.content
    pageInfo.value = {
      totalPages: res.data.totalPages,
      number: res.data.number,
      first: res.data.first,
      last: res.data.last
    }
  }

  function goToBlock(block, type = 'latest') {
    const page = Math.max(0, Math.min(block * blockSize, pageInfo.value.totalPages - 1))
    fetchPosts(page, type)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return {
    posts,
    pageInfo,
    currentBlock,
    visiblePages,
    fetchPosts,
    goToBlock,
    formatDate
  }
}