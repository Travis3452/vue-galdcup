import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'
import { useUserStore } from '@/stores/user'

export default function useCreateBoard() {
  const router = useRouter()
  const store = useUserStore()

  const topic = ref('')
  const description = ref('')
  const errorMessage = ref('')
  const submitting = ref(false)

  async function createBoard() {
    errorMessage.value = ''
    if (!topic.value.trim()) {
      errorMessage.value = '갈드컵 주제를 입력하세요.'
      return
    }
    submitting.value = true
    try {
      const payload = {
        topic: topic.value.trim(),
        description: description.value.trim()
      }
      const res = await api.post('/boards', payload, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })

      const boardId = res.data.id
      router.push(`/boards/${boardId}/createVoteSession`)
    } catch (err) {
      console.error('게시판 생성 실패:', err)
      if (err.response && err.response.data) {
        const data = err.response.data
        // details가 있으면 필드별 메시지만 보여주기
        if (data.details && typeof data.details === 'object') {
          const detailMsgs = Object.values(data.details).join('\n')
          errorMessage.value = detailMsgs
          alert(detailMsgs)
        } else {
          // details가 없으면 기본 메시지 사용
          errorMessage.value = data.message || '요청 처리 중 오류가 발생했습니다.'
          alert(errorMessage.value)
        }
      } else {
        errorMessage.value = '알 수 없는 오류가 발생했습니다.'
        alert('알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      submitting.value = false
    }
  }

  return {
    topic,
    description,
    errorMessage,
    submitting,
    createBoard
  }
}