import { ref, onMounted } from 'vue'
import api from '@/axios'

export default function useRoleApproval() {
  const requests = ref([])

  onMounted(async () => {
    await fetchRequests()
  })

  async function fetchRequests() {
    try {
      const res = await api.get('/role-changes')
      requests.value = res.data
    } catch (err) {
      console.error('권한 요청 목록 불러오기 실패:', err)
    }
  }

  async function approve(id) {
    try {
      await api.post(`/role-changes/${id}/approve`)
      requests.value = requests.value.filter(r => r.id !== id)
      alert('요청을 승인했습니다.')
    } catch (err) {
      console.error('승인 실패:', err)
      alert('승인에 실패했습니다.')
    }
  }

  async function deny(id) {
    try {
      await api.post(`/role-changes/${id}/deny`)
      requests.value = requests.value.filter(r => r.id !== id)
      alert('요청을 거절했습니다.')
    } catch (err) {
      console.error('거절 실패:', err)
      alert('거절에 실패했습니다.')
    }
  }

  return {
    requests,
    approve,
    deny
  }
}