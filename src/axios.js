import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

// 요청 인터셉터
api.interceptors.request.use(config => {
  const store = useUserStore();
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`;
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  res => res,
  async err => {
    const store = useUserStore();
    const originalRequest = err.config;

    // 401 에러 발생 시 (인증 만료)
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새로운 Access Token 요청
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, nickname } = refreshRes.data;

        store.login(accessToken, nickname);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("세션 만료로 로그아웃 처리합니다.");
        store.logout();
        window.location.href = "/";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;