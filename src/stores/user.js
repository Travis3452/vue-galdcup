import { defineStore } from 'pinia'
import api from '@/axios'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null,
    id: null,
    nickname: null,
    role: null
  }),
  
  actions: {
    login(accessToken, nickname) {
      this.accessToken = accessToken
      const payload = parseJwt(accessToken)
      this.id = payload?.sub ? Number(payload.sub) : null
      this.role = payload?.roles ? payload.roles[0] : null
      this.nickname = nickname || null

      localStorage.setItem('accessToken', accessToken)
      if (this.id) localStorage.setItem('id', String(this.id))
      if (this.nickname) localStorage.setItem('nickname', this.nickname)
      if (this.role) localStorage.setItem('role', this.role)
    },

    logout() {
      this.accessToken = null
      this.id = null
      this.nickname = null
      this.role = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('id')
      localStorage.removeItem('nickname')
      localStorage.removeItem('role')
    },

    restore() {
      const token = localStorage.getItem('accessToken')
      const idStr = localStorage.getItem('id')
      const name = localStorage.getItem('nickname')
      const roleStr = localStorage.getItem('role')

      if (token) {
        this.accessToken = token
        this.id = idStr ? Number(idStr) : null
        this.nickname = name || null
        this.role = roleStr || null
      }
    },

    async reissue() {
      try {
        const response = await api.post('/auth/refresh')
        const { accessToken, nickname } = response.data
        
        this.login(accessToken, nickname)
        return true
      } catch (error) {
        console.error("토큰 재발급 실패:", error)
        this.logout()
        return false
      }
    }
  }
})