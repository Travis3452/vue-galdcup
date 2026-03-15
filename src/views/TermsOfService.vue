<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
      <div class="bg-slate-800 px-8 py-10 text-white">
        <h1 class="text-3xl font-extrabold tracking-tight">이용약관</h1>
        <p class="mt-2 text-slate-300 opacity-90">Galdcup 서비스를 이용해 주셔서 감사합니다. 본 약관은 서비스 이용 조건 및 절차를 규정합니다.</p>
      </div>

      <div class="p-8 space-y-10 text-slate-700 leading-relaxed">
        
        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-slate-500 pl-3 mb-4">제 1 조 (목적)</h2>
          <p>본 약관은 **Galdcup**(이하 '서비스')이 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 서비스 운영자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-slate-500 pl-3 mb-4">제 2 조 (용어의 정의)</h2>
          <ul class="list-disc ml-5 mt-2 space-y-1 text-sm">
            <li><strong>이용자:</strong> 본 약관에 따라 서비스를 이용하는 회원 및 비회원</li>
            <li><strong>게시물:</strong> 이용자가 서비스를 이용함에 있어 게시한 글, 사진, 투표 항목 등 모든 정보</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-slate-500 pl-3 mb-4">제 3 조 (게시물의 저작권 및 관리)</h2>
          <p>1. 이용자가 서비스 내에 게시한 <strong>게시물의 저작권은 해당 게시물의 작성자에게 귀속</strong>됩니다.</p>
          <p>2. 이용자는 서비스가 게시물을 서비스 홍보 및 운영 목적으로 사용하는 것을 허락합니다. (복제, 수정, 전시 등)</p>
          <p>3. 운영자는 다음 각 호에 해당하는 게시물을 사전 통지 없이 삭제하거나 이동할 수 있습니다.</p>
          <ul class="list-disc ml-5 mt-2 space-y-1 text-sm">
            <li>타인의 명예를 훼손하거나 모욕을 주는 내용</li>
            <li>공공질서 및 미풍양속에 위반되는 내용</li>
            <li>저작권 등 제3자의 권리를 침해하는 내용</li>
            <li>서비스의 성격에 부합하지 않거나 중복되는 광고성 내용</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-slate-500 pl-3 mb-4">제 4 조 (서비스 이용의 제한)</h2>
          <p>운영자는 투표 조작, 시스템 해킹 시도, 타인 명의 도용 등 서비스의 정상적인 운영을 방해하는 이용자에 대하여 서비스 이용을 제한하거나 강제 탈퇴 조치를 취할 수 있습니다.</p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-slate-900 border-l-4 border-slate-500 pl-3 mb-4">제 5 조 (면책 조항)</h2>
          <p>1. 운영자는 천재지변, 서버 점검, 통신 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</p>
          <p>2. 운영자는 이용자가 게재한 게시물의 신뢰도 및 정확성에 대하여 책임을 지지 않습니다.</p>
          <p>3. 이용자 간 발생한 분쟁(명예훼손 등)에 대하여 운영자는 개입할 의무가 없으며 법적 책임을 지지 않습니다.</p>
        </section>

        <div class="pt-8 border-t border-slate-100 text-sm text-slate-400">
          <p>공고일자: 2026년 03월 16일</p>
          <p>시행일자: 2026년 03월 16일</p>
        </div>
      </div>

      <div class="bg-slate-50 p-6 flex justify-center">
        <button 
          @click="$router.back()" 
          class="px-6 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>