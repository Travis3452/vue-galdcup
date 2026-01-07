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
      errorMessage.value = '토픽을 입력하세요.'
      return
    }
    submitting.value = true
    try {
      const payload = {
        topic: topic.value.trim(),
        description: description.value.trim()
      }
      await api.post('/boards', payload, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      })
      router.push('/')
    } catch (err) {
      console.error('게시판 생성 실패:', err)
      errorMessage.value = '게시판 생성에 실패했습니다.'
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