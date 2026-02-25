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

  function getTomorrowMidnight() {
    const now = new Date()
    now.setDate(now.getDate() + 1)
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

  function toSeoulOffsetDateTime(dtLocalValue) {
    if (!dtLocalValue) return null
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
  const boardId = route.params.boardId;

  const mappedOptions = options.value
    .map((label, idx) => ({
      label: label.trim(),
      imageUrl: optionImages.value[idx]
    }))
    .filter(opt => opt.label !== "");

  if (mappedOptions.length < 2) {
    alert("최소 2개 이상의 선택지를 입력해야 합니다.");
    return;
  }

  const payload = {
    startTime: toSeoulOffsetDateTime(startTime.value),
    endTime: toSeoulOffsetDateTime(endTime.value),
    options: mappedOptions
  };

  try {
    await api.post(`/boards/${boardId}/vote-session`, payload, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    });
    router.push(`/boards/${boardId}`);
  } catch (err) {
    console.error("생성 실패:", err.response?.data);
    alert("갈드컵 생성에 실패했습니다. 모든 이미지를 업로드했는지 확인해주세요.");
  }
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