<template>
  <div class="min-h-[calc(100vh-96px)] bg-slate-50 p-6 md:p-10 font-sans">
    <div class="max-w-4xl mx-auto">
      
      <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 border border-slate-100 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div class="relative z-10">
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
            <span class="text-indigo-600">🛡️</span> 권한 승인 관리
          </h1>
          <p class="text-slate-500 mb-10 font-medium">사용자의 매니저 권한 승격 요청을 검토하고 승인합니다.</p>

          <div class="space-y-6">
            <div class="flex items-center justify-between border-b pb-4">
              <h2 class="text-2xl font-bold text-slate-700">매니저 권한 신청 내역</h2>
              <span class="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black shadow-sm">
                대기 {{ roleRequests.length }}건
              </span>
            </div>

            <div v-if="roleRequests.length === 0" class="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p class="text-slate-400 font-bold text-lg">대기 중인 매니저 신청이 없습니다.</p>
            </div>

            <div v-else class="grid gap-6">
              <div v-for="req in roleRequests" :key="req.id" 
                   class="group bg-white border border-slate-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xl shadow-lg">
                      {{ (req.applicantNickname || '익').charAt(0) }}
                    </div>
                    
                    <div>
                      <h3 class="font-black text-2xl text-slate-800 leading-tight">
                        {{ req.applicantNickname || '알 수 없는 닉네임' }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md tracking-tighter">
                          요청 권한
                        </span>
                        <p class="text-sm font-bold text-slate-500 uppercase">
                          {{ req.requestedRole }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <button 
                      @click="approveRole(req.id)" 
                      class="flex-1 md:flex-none px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 transform hover:-translate-y-0.5 active:scale-95"
                    >
                      승인
                    </button>
                    <button 
                      @click="denyRole(req.id)" 
                      class="flex-1 md:flex-none px-10 py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition transform hover:-translate-y-0.5 active:scale-95"
                    >
                      거절
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/axios'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const roleRequests = ref([])

/**
 * 매니저 권한 신청 목록 로드
 * 백엔드 컨트롤러: @GetMapping("/api/role-changes")
 */
const fetchRoleRequests = async () => {
  try {
    const res = await api.get('/role-changes')
    roleRequests.value = res.data
  } catch (err) {
    console.error('권한 신청 목록 로드 실패:', err)
  }
}

/**
 * 승인 처리
 * 백엔드 컨트롤러: @PostMapping("/{requestId}/approve")
 */
const approveRole = async (id) => {
  try {
    await api.post(`/role-changes/${id}/approve`)
    alert('승인이 완료되었습니다.')
    await fetchRoleRequests()
  } catch (err) {
    alert(err.response?.data?.message || '승인 처리 중 오류가 발생했습니다.')
  }
}

/**
 * 거절 처리
 * 백엔드 컨트롤러: @PostMapping("/{requestId}/deny")
 */
const denyRole = async (id) => {
  if (!confirm('정말 거절하시겠습니까?')) return
  try {
    await api.post(`/role-changes/${id}/deny`)
    alert('요청을 거절했습니다.')
    await fetchRoleRequests()
  } catch (err) {
    alert(err.response?.data?.message || '거절 처리 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  // 관리자 여부 체크 (userStore.isAdmin getter 활용 권장)
  if (!userStore.role?.includes('ADMIN')) {
    alert('관리자만 접근 가능한 페이지입니다.')
    router.push('/')
    return
  }
  fetchRoleRequests()
})
</script>