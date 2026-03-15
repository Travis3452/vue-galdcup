<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
      <div class="bg-indigo-600 px-8 py-10 text-white">
        <h1 class="text-3xl font-extrabold tracking-tight">개인정보처리방침</h1>
        <p class="mt-2 text-indigo-100 opacity-90">Galdcup 서비스 이용자 여러분의 소중한 개인정보 보호를 위해 최선을 다합니다.</p>
      </div>

      <div class="p-8 space-y-10 text-slate-700 leading-relaxed">
        
        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">1. 개인정보의 처리 목적</h2>
          <p>Galdcup(이하 '서비스')은 다음의 목적을 위해 최소한의 개인정보를 처리합니다. 처리한 개인정보는 목적 이외의 용도로 사용되지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>회원 관리: Google 소셜 로그인을 통한 본인 확인 및 식별</li>
            <li>서비스 제공: 게시글/댓글 작성, 투표 참여 및 결과 집계</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">2. 수집하는 개인정보 항목</h2>
          <p>서비스는 별도의 가입 절차 없이 <strong>Google OAuth2</strong>를 통해 다음 정보를 제공받습니다.</p>
          <div class="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold">
              <li class="flex items-center gap-2">✅ Google 계정 고유 ID</li>
              <li class="flex items-center gap-2">✅ 이메일 주소</li>
              <li class="flex items-center gap-2">✅ 프로필 이름 (닉네임)</li>
              <li class="flex items-center gap-2">✅ 프로필 이미지 URL</li>
            </ul>
          </div>
          <p class="mt-3 text-sm text-slate-500">* 서비스 이용 과정에서 IP 주소, 접속 로그, 쿠키가 자동으로 생성되어 수집될 수 있습니다.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <p>사용자의 개인정보는 <strong>회원 탈퇴 시 즉시 파기</strong>하는 것을 원칙으로 합니다. 다만, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>서비스 이용 기록 및 접속 로그: 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">4. 개인정보의 제3자 제공</h2>
          <p>서비스는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">5. 이용자의 권리 및 행사 방법</h2>
          <p>사용자는 언제든지 서비스 내 '마이페이지' 또는 탈퇴 기능을 통해 자신의 개인정보를 열람, 수정하거나 삭제를 요청할 수 있습니다.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-3 mb-4">6. 개인정보 보호책임자</h2>
          <p>개인정보 보호와 관련한 문의사항은 아래의 책임자에게 연락해 주시기 바랍니다.</p>
          <div class="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p class="font-bold text-indigo-900">담당자: user-f5 </p>
            <p class="text-indigo-800 text-sm mt-1">이메일: rnjswlsdn777@gmail.com </p>
          </div>
        </section>

        <div class="pt-8 border-t border-slate-100 text-sm text-slate-400">
          <p>공고일자: 2024년 03월 20일</p>
          <p>시행일자: 2024년 03월 20일</p>
        </div>
      </div>

      <div class="bg-slate-50 p-6 flex justify-center">
        <button 
          @click="$router.back()" 
          class="px-6 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  </div>
</template>