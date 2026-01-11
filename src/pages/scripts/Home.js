import { ref, onMounted } from 'vue'
import api from '@/axios'
import { useRouter } from 'vue-router'

export default function useHome() {
  const boards = ref([])
  const page = ref(0)
  const size = 10
  const totalPages = ref(1)
  const router = useRouter()

  async function fetchBoards() {
    try {
      const res = await api.get(`/boards?page=${page.value}&size=${size}`)
      boards.value = res.data.content
      totalPages.value = Math.max(res.data.totalPages, 1)
    } catch (err) {
      console.error('API 호출 실패:', err)
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const year = String(date.getFullYear()).slice(2)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function goToBoard(boardId) {
    router.push(`/boards/${boardId}`)
  }

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

  onMounted(fetchBoards)

  return {
    boards,
    page,
    totalPages,
    formatDate,
    goToBoard,
    nextPage,
    prevPage
  }
}