import { ref, onMounted } from 'vue'
import api from '@/axios'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { uploadImage } from '@/services/uploadImage'

export default function useCreateVoteSession() {
  const route = useRoute()
  const router = useRouter()
  const store = useUserStore()

  const boardTitle = ref('')

  // 기본값: 내일 0시 (Asia/Seoul 기준)
  function getTomorrowMidnight() {
    const now = new Date()
    now.setDate(now.getDate() + 1)
    // 한국 시간 기준으로 문자열 생성
    return new Date(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}T00:00:00+09:00`
    ).toISOString()
  }

  const startTime = ref(getTomorrowMidnight())
  const endTime = ref('')
  const options = ref(['', ''])
  const optionImages = ref([null, null])

  onMounted(async () => {
    const boardId = route.params.boardId
    const res = await api.get(`/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    boardTitle.value = res.data.topic
  })

  function addOption() {
    options.value.push('')
    optionImages.value.push(null)
  }

  function removeOption(idx) {
    if (options.value.length > 2) {
      options.value.splice(idx, 1)
      optionImages.value.splice(idx, 1)
    }
  }

  // LocalDateTime → OffsetDateTime(+09:00) 변환
  function toSeoulOffsetDateTime(dtLocalValue) {
    if (!dtLocalValue) return null
    // "YYYY-MM-DDTHH:mm" → "YYYY-MM-DDTHH:mm:00+09:00"
    const normalized = dtLocalValue.length === 16 ? `${dtLocalValue}:00` : dtLocalValue
    return new Date(normalized + '+09:00').toISOString()
  }

  async function onImageUpload(event, idx) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file)
      optionImages.value[idx] = url
    } catch (err) {
      console.error('이미지 업로드 실패', err)
    }
  }

  async function createVoteSession() {
    const boardId = route.params.boardId
    const payload = {
      startTime: toSeoulOffsetDateTime(startTime.value),
      endTime: toSeoulOffsetDateTime(endTime.value),
      options: options.value.filter(o => o.trim() !== ''),
      optionImages: optionImages.value.filter(img => img)
    }

    await api.post(`/boards/${boardId}/vote-session`, payload, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    router.push(`/boards/${boardId}`)
  }

  return {
    boardTitle,
    startTime,
    endTime,
    options,
    optionImages,
    addOption,
    removeOption,
    onImageUpload,
    createVoteSession
  }
}