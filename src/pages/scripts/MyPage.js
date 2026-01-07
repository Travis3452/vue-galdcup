import { ref, onMounted } from 'vue'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export default function useMyPage() {
  const store = useUserStore()
  const router = useRouter()

  const user = ref({})
  const newNickname = ref('')
  const confirmEmail = ref('')
  const errorMessage = ref('')

  onMounted(async () => {
    await fetchUser()
  })

  async function fetchUser() {
    try {
      const res = await api.get('/users/me')
      user.value = res.data
      errorMessage.value = ''
    } catch (err) {
      console.error('유저 정보 불러오기 실패:', err)
      errorMessage.value = '유저 정보를 불러오지 못했습니다.'
    }
  }

  async function changeNickname() {
    if (!newNickname.value.trim()) {
      errorMessage.value = '닉네임을 입력하세요.'
      return
    }
    try {
      await api.put(`/users/${user.value.id}`, { nickname: newNickname.value.trim() })
      alert('닉네임이 변경되었습니다.')
      await fetchUser()
      newNickname.value = ''
    } catch (err) {
      console.error('닉네임 변경 실패:', err)
      errorMessage.value = '닉네임 변경에 실패했습니다.'
    }
  }

  async function deleteAccount() {
    if (confirmEmail.value.trim() !== user.value.email) {
      errorMessage.value = '이메일을 정확히 입력해야 탈퇴할 수 있습니다.'
      return
    }
    if (!confirm('정말 회원 탈퇴하시겠습니까?')) return
    try {
      await api.delete(`/users/${user.value.id}`)
      alert('회원 탈퇴가 완료되었습니다.')
      store.logout()
      router.push('/')
    } catch (err) {
      console.error('회원 탈퇴 실패:', err)
      errorMessage.value = '회원 탈퇴에 실패했습니다.'
    }
  }

  async function requestRole() {
    try {
      await api.post(`/role-changes`, { requestedRole: 'MANAGER' })
      alert('권한 신청이 완료되었습니다.')
      errorMessage.value = ''
    } catch (err) {
      console.error('권한 신청 실패:', err)
      errorMessage.value = '권한 신청에 실패했습니다.'
    }
  }

  function openApprovalWindow() {
    const url = `${window.location.origin}/role-approval`
    const features = [
      'width=640',
      'height=720',
      'top=100',
      'left=100',
      'menubar=no',
      'toolbar=no',
      'location=no',
      'status=no',
      'resizable=yes'
    ].join(',')
    window.open(url, 'RoleApprovalWindow', features)
  }

  return {
    user,
    newNickname,
    confirmEmail,
    errorMessage,
    changeNickname,
    deleteAccount,
    requestRole,
    openApprovalWindow
  }
}