import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true // RefreshToken 쿠키 자동 포함
});

// 요청 인터셉터: AccessToken을 Authorization 헤더에 추가
api.interceptors.request.use(config => {
  const store = useUserStore();
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`;
  }
  return config;
});

// 응답 인터셉터: 401 발생 시 RefreshToken으로 AccessToken 갱신
api.interceptors.response.use(
  res => res,
  async err => {
    const store = useUserStore();

    if (err.response?.status === 401 && !err.config.__isRetryRequest) {
      try {
        // RefreshToken으로 새 AccessToken 요청
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.accessToken;
        const nickname = refreshRes.data.nickname;

        // 스토어와 로컬스토리지 갱신
        store.login(newToken, nickname);

        // 원래 요청 재시도
        err.config.__isRetryRequest = true;
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      } catch (refreshErr) {
        // RefreshToken도 만료 → 로그아웃 처리
        store.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;