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

    // 401 에러 발생 시 (Access Token 만료 등) 및 재시도하지 않은 요청인 경우
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지 플래그

      try {
        console.log("Access Token 만료. 재발급을 시도합니다...");
        
        // ✨ 스토어에 이미 구현된 reissue 액션을 호출합니다.
        // 이 액션 내부에서 만료 체크, 서버 요청, 결과 저장(login)까지 모두 처리합니다.
        const isSuccess = await store.reissue();

        if (isSuccess) {
          // 재발급 성공 시 새로운 토큰으로 헤더를 교체하고 원래 요청을 다시 보냅니다.
          originalRequest.headers.Authorization = `Bearer ${store.accessToken}`;
          return api(originalRequest);
        }
        
      } catch (refreshErr) {
        // ✨ Refresh Token까지 만료되어 reissue가 실패한 경우
        console.error("세션이 만료되었습니다.");
        
        // 스토어의 reissue 액션 내부에 이미 logout() 처리가 되어있으므로 
        // 여기서는 사용자 알림 및 페이지 이동만 처리합니다.
        alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/"; 
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;