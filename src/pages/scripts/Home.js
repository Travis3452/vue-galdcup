import { ref, onMounted } from 'vue'
import api from '@/axios'
import { useRouter } from 'vue-router'

export default function useHome() {
  const boards = ref([])
  const popularBoards = ref([])
  const page = ref(0)
  const size = 10
  const totalPages = ref(1)
  const router = useRouter()

  async function fetchBoards() {
    try {
      const res = await api.get(`/boards`, { params: { page: page.value, size } })
      boards.value = res.data.content
      totalPages.value = Math.max(res.data.totalPages, 1)
    } catch (err) {
      console.error('API 호출 실패:', err)
    }
  }

  // 게시판 검색
  async function searchBoards(pageNum, keyword) {
    try {
      const res = await api.get(`/boards/search`, {
        params: { page: pageNum, size, keyword }
      })
      boards.value = res.data.content
      page.value = res.data.number
      totalPages.value = Math.max(res.data.totalPages, 1)
    } catch (err) {
      console.error('검색 API 호출 실패:', err)
    }
  }

  // 인기 게시판 조회
  async function fetchPopularBoards() {
    try {
      const res = await api.get(`/boards/popular`)
      popularBoards.value = res.data
    } catch (err) {
      console.error('인기 게시판 API 호출 실패:', err)
    }
  }

  // 날짜 포맷
  function formatDate(dateString) {
    const date = new Date(dateString)
    const year = String(date.getFullYear()).slice(2)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 게시판 이동
  function goToBoard(boardId) {
    router.push(`/boards/${boardId}`)
  }

  // 최근 생성된 게시판 페이지네이션
  function nextPage() {
    if (page.value < totalPages.value - 1) {
      page.value++
      fetchBoards()
    }
  }

  function prevPage() {
    if (page.value > 0) {
      page.value--
      fetchBoards()
    }
  }

  onMounted(() => {
    fetchBoards()
    fetchPopularBoards()
  })

  return {
    boards,
    popularBoards,
    page,
    totalPages,
    formatDate,
    goToBoard,
    nextPage,
    prevPage,
    searchBoards,
    fetchPopularBoards
  }
}