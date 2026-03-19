<template>
  <footer class="bg-indigo-950 text-indigo-200 border-t border-indigo-900">
    <div class="max-w-7xl mx-auto px-6 py-10 md:py-12 flex flex-col md:flex-row justify-between items-center gap-8">
      
      <div class="flex flex-col items-center md:items-start gap-2.5">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 flex items-center justify-center rounded-xl bg-indigo-500 text-white text-base font-black shadow-[0_0_15px_rgba(99,102,241,0.4)] shrink-0">G</span>
          <span class="text-lg md:text-xl font-black text-white tracking-tight">Galdcup</span>
        </div>
        <div class="text-center md:text-left space-y-1">
          <p class="text-[12px] md:text-sm font-medium opacity-70">
            &copy; 2026 Galdcup. All rights reserved.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap justify-center items-center gap-2.5 md:gap-3.5">
        <a
          href="mailto:your-email@example.com"
          class="flex items-center px-4 py-2.5 bg-indigo-800 text-white border border-indigo-700 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
        >
          의견 및 신고
        </a>

        <router-link
          to="/terms"
          class="flex items-center px-4 py-2.5 bg-indigo-800 text-white border border-indigo-700 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
        >
          이용약관
        </router-link>
        
        <router-link
          to="/privacy"
          class="flex items-center px-4 py-2.5 bg-indigo-800 text-white border border-indigo-700 rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
        >
          개인정보처리방침
        </router-link>
        
        <a
          href="https://github.com/travis3452/spring-galdcup"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 rounded-xl font-black text-xs md:text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
        >
          <svg class="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          <span>GitHub</span>
        </a>
      </div>
      
    </div>
  </footer>
</template>

<style scoped>
/* 푸터 링크 텍스트가 모바일에서 너무 촘촘해지지 않도록 가로 스크롤 방지 */
.flex-wrap {
  word-break: keep-all;
}
</style>