import axios from 'axios'

export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '')

// 재발급·로그아웃은 일반 API의 401 재시도 인터셉터를 거치지 않는다.
export const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  timeout: 15000,
})
