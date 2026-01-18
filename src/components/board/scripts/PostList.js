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
   * 게시글 목록 조회 (최신글 / 인기글)
   * @param {number} page - 페이지 번호
   * @param {'latest'|'popular'} type - 탭 타입
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

  /**
   * 페이지 블록 이동
   */
  function goToBlock(block, type = 'latest') {
    const page = Math.max(0, Math.min(block * blockSize, pageInfo.value.totalPages - 1))
    fetchPosts(page, type)
  }

  /**
   * 날짜 포맷
   */
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  /**
   * 🔍 게시글 검색 (최신글 / 인기글)
   * @param {number} page - 페이지 번호
   * @param {'titleContent'|'author'} mode - 검색 모드
   * @param {string} keyword - 검색어
   * @param {'latest'|'popular'} type - 탭 타입
   */
  async function searchPosts(page, mode, keyword, type = 'latest') {
    let url
    let params = { page, size: 30 }

    if (mode === 'titleContent') {
      url =
        type === 'popular'
          ? `/posts/board/${boardId}/popular/search/keyword`
          : `/posts/board/${boardId}/search/keyword`
      params.keyword = keyword
    } else if (mode === 'author') {
      url =
        type === 'popular'
          ? `/posts/board/${boardId}/popular/search/nickname`
          : `/posts/board/${boardId}/search/nickname`
      params.nickname = keyword
    } else {
      throw new Error('Invalid search mode')
    }

    const res = await api.get(url, { params })
    posts.value = res.data.content
    pageInfo.value = {
      totalPages: res.data.totalPages,
      number: res.data.number,
      first: res.data.first,
      last: res.data.last
    }
  }

  return {
    posts,
    pageInfo,
    currentBlock,
    visiblePages,
    fetchPosts,
    goToBlock,
    formatDate,
    searchPosts
  }
}