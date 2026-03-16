import axios from "axios";
import { useUserStore } from "@/stores/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // ✨ 핵심: HttpOnly 쿠키(Access/Refresh Token)를 자동으로 주고받기 위해 필수
  withCredentials: true 
});

// [응답 인터셉터] 401 에러(토큰 만료) 발생 시 처리
api.interceptors.response.use(
  res => res,
  async err => {
    const store = useUserStore();
    const originalRequest = err.config;

    // 401 에러 발생 시 (Access Token 만료 등) 및 재시도하지 않은 요청인 경우
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지 플래그

      try {
        console.log("Access Token 만료. 세션 갱신을 시도합니다...");
        const isSuccess = await store.reissue();

        if (isSuccess) {
          return api(originalRequest);
        }
        
      } catch (refreshErr) {
        console.error("세션이 완전히 만료되었습니다. 모든 인증 정보를 제거합니다.");
        
        // ✨ 변경: 로컬 데이터만 지우는 것이 아니라, 
        // 서버에 쿠키 삭제를 요청하고 로컬을 정리하는 logout 액션 호출
        await store.logout(); 
        
        alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/"; 
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;