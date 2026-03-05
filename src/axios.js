import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true // HttpOnly 쿠키(Refresh Token)를 주고받기 위해 필수
});

// [요청 인터셉터] 모든 요청 헤더에 Access Token 주입
api.interceptors.request.use(config => {
  const store = useUserStore();
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`;
  }
  return config;
});

// [응답 인터셉터] 에러 발생 시 처리
api.interceptors.response.use(
  res => res,
  async err => {
    const store = useUserStore();
    const originalRequest = err.config;

    // 401 에러 발생 시 (Access Token 만료 등)
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지 플래그

      try {
        console.log("Access Token 만료. 재발급을 시도합니다...");
        
        // Refresh Token(쿠키)을 이용해 새로운 Access Token 요청
        // 인터셉터가 걸리지 않은 별도의 axios 인스턴스를 사용하거나 직접 경로 지정
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, nickname } = refreshRes.data;

        // 새로운 토큰으로 스토어 업데이트
        store.login(accessToken, nickname);

        // 원래 실패했던 요청의 헤더를 새 토큰으로 교체 후 재요청
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshErr) {
        // ✨ Refresh Token까지 만료되었거나 재발급에 실패한 경우
        console.error("세션이 만료되었습니다.");
        
        // 1. 사용자에게 알림
        alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        
        // 2. 클라이언트 상태 초기화 (로그아웃)
        store.logout();
        
        // 3. 메인 페이지로 이동 및 상태 갱신
        window.location.href = "/"; 
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;