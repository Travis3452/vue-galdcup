// src/stores/user.js
import { defineStore } from 'pinia'

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

      // JWT payload에서 사용자 ID와 role 추출
      const payload = parseJwt(accessToken)
      this.id = payload?.sub ? Number(payload.sub) : null
      this.role = payload?.roles ? payload.roles[0] : null

      // 닉네임은 서버 응답에서 받아 저장
      this.nickname = nickname || null

      // 로컬스토리지에 저장
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
    }
  }
})
