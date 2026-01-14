import { ref } from 'vue'
import api from '@/axios'

export default function useVoteSession(boardId) {
  const voteSession = ref(null)

  async function fetchVoteSession() {
    try {
      const res = await api.get(`/boards/${boardId}/vote-session`)
      voteSession.value = res.data
    } catch {
      voteSession.value = null
    }
  }

  function openVoteWindow(voteSessionId) {
    const url = `/boards/${boardId}/vote-session/${voteSessionId}/vote`
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes')
  }

  function openVoteStatusWindow() {
    const url = `/boards/${boardId}/vote-status`
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes')
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return {
    voteSession,
    fetchVoteSession,
    openVoteWindow,
    openVoteStatusWindow,
    formatDate
  }
}