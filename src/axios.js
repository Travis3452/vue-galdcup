import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true // ✅ RefreshToken 쿠키 자동 포함
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

    // AccessToken 만료 → RefreshToken으로 재발급 시도
    if (err.response?.status === 401 && !err.config.__isRetryRequest) {
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.accessToken;
        const nickname = refreshRes.data.nickname;
        const id = refreshRes.data.id;

        // 스토어 갱신
        store.setAccessToken(newToken);
        store.nickname = nickname;
        store.id = id;

        // 원래 요청 재시도
        err.config.__isRetryRequest = true;
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      } catch (refreshErr) {
        // ✅ RefreshToken도 만료 → 자동 로그아웃 + 안내 메시지
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        store.logout();
        window.location.href = "/";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
