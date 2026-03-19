<template>
  <div class="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-4 md:p-10 font-sans flex justify-center items-start">
    
    <div class="w-full max-w-5xl bg-white rounded-2xl md:rounded-[2rem] shadow-2xl p-6 md:p-12 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-48 h-48 md:w-64 md:h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-8 md:space-y-10">
        
        <div class="border-b-2 border-slate-100 pb-6 md:pb-8 space-y-2 md:space-y-3">
          <h1 class="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            새로운 투표 생성
          </h1>
          <p class="text-sm md:text-lg font-bold text-slate-500">
            <span class="text-indigo-600">[{{ boardTitle }}]</span> 게시판의 새 투표를 엽니다.
          </p>
        </div>

        <div class="space-y-4 bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100">
          <h2 class="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <span class="text-indigo-500">🗓️</span> 투표 진행 기간
          </h2>
          <div class="flex flex-col md:flex-row gap-4 md:gap-6">
            <div class="flex-1 space-y-1.5">
              <label class="text-xs md:text-sm font-bold text-slate-500 ml-1">시작 일시</label>
              <input 
                type="datetime-local" 
                v-model="startTime"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 md:px-5 md:py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              />
            </div>
            <div class="flex-1 space-y-1.5">
              <label class="text-xs md:text-sm font-bold text-slate-500 ml-1">종료 일시</label>
              <input 
                type="datetime-local" 
                v-model="endTime"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 md:px-5 md:py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-center px-1">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <span class="text-rose-500">⚔️</span> 갈드컵 후보
            </h2>
            <button 
              @click="addOption"
              class="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition shadow-sm text-xs md:text-sm"
            >
              + 후보 추가
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div 
              v-for="(label, idx) in options" 
              :key="idx"
              class="bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] p-5 md:p-6 hover:border-indigo-300 transition-colors shadow-sm relative group"
            >
              <button 
                v-if="options.length > 2"
                @click="removeOption(idx)"
                class="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full font-black shadow-md hover:bg-red-500 hover:text-white transition flex items-center justify-center z-20 md:opacity-0 md:group-hover:opacity-100"
              >
                ✕
              </button>

              <div class="space-y-4 md:space-y-5">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs md:text-sm">
                    {{ idx + 1 }}
                  </span>
                  <span class="font-bold text-slate-500 tracking-widest text-xs md:text-sm uppercase">Candidate</span>
                </div>

                <input 
                  type="text" 
                  v-model="options[idx]"
                  placeholder="후보 이름을 입력하세요."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />

                <div class="space-y-2">
                  <label class="block text-[10px] md:text-xs font-bold text-slate-400 ml-1">대표 이미지 첨부</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => onImageUpload(e, idx)"
                    class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-indigo-50 file:text-indigo-700 transition cursor-pointer"
                  />
                  
                  <div v-if="optionPreviews[idx]" class="mt-3 rounded-xl overflow-hidden border-2 border-slate-100 aspect-video relative group/img">
                    <img :src="optionPreviews[idx]" class="w-full h-full object-cover" />
                    <div 
                      class="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity" 
                      :class="optionImages[idx] ? 'opacity-0 md:group-hover/img:opacity-100' : 'opacity-100'"
                    >
                      <span v-if="optionImages[idx]" class="bg-black/70 text-white px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm border border-white/20">
                        이미지 등록 완료
                      </span>
                      <span v-else class="bg-indigo-600/90 text-white px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse backdrop-blur-sm">
                        업로드 중...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6 md:pt-8 border-t-2 border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4">
          <button 
            @click="router.back()"
            :disabled="isSubmitting"
            class="px-8 py-3.5 md:py-4 bg-slate-100 text-slate-600 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-slate-200 transition text-center disabled:opacity-50 w-full sm:w-auto"
          >
            취소
          </button>
          
          <button 
            @click="createVoteSession"
            :disabled="isSubmitting || !isFormValid"
            class="relative flex items-center justify-center gap-2 px-10 py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50 w-full sm:w-auto min-w-[180px]"
          >
            <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span>{{ isSubmitting ? '생성 중...' : '투표 생성하기' }}</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'

const route = useRoute()
const router = useRouter()

const boardTitle = ref('')
const isSubmitting = ref(false)

// 기본 날짜 설정: 내일 자정
function getTomorrowMidnight() {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}T00:00`
}

const startTime = ref(getTomorrowMidnight())
const endTime = ref('')
const options = ref(['', ''])
const optionPreviews = ref([null, null])
const optionImages = ref([null, null])

onMounted(async () => {
  const boardId = route.params.boardId
  try {
    const res = await api.get(`/boards/${boardId}`)
    boardTitle.value = res.data.topic
  } catch (err) {
    console.error('게시판 정보 로드 실패', err)
  }
})

function addOption() {
  options.value.push('')
  optionPreviews.value.push(null)
  optionImages.value.push(null)
}

function removeOption(idx) {
  if (options.value.length > 2) {
    options.value.splice(idx, 1)
    optionPreviews.value.splice(idx, 1)
    optionImages.value.splice(idx, 1)
  }
}

// LocalDateTime 포맷 변환 (Seoul/ISO)
function toSeoulOffsetDateTime(dtLocalValue) {
  if (!dtLocalValue) return null
  const normalized = dtLocalValue.length === 16 ? `${dtLocalValue}:00` : dtLocalValue
  return new Date(normalized + '+09:00').toISOString()
}

async function onImageUpload(event, idx) {
  const file = event.target.files?.[0]
  if (!file) return
  
  optionPreviews.value[idx] = URL.createObjectURL(file)
  optionImages.value[idx] = null 

  try {
    const url = await uploadImage(file)
    optionImages.value[idx] = url
  } catch (err) {
    console.error('이미지 업로드 실패', err)
    alert('이미지 업로드에 실패했습니다.')
    optionPreviews.value[idx] = null 
  }
}

const isFormValid = computed(() => {
  const validOptionsCount = options.value.filter(opt => opt.trim() !== '').length
  return validOptionsCount >= 2 && startTime.value && endTime.value
})

async function createVoteSession() {
  const boardId = route.params.boardId

  // 이미지 업로드 중 체크
  const isUploading = optionPreviews.value.some((preview, idx) => preview !== null && optionImages.value[idx] === null)
  if (isUploading) {
    alert("이미지가 아직 서버에 업로드 중입니다. 잠시만 기다려주세요.")
    return
  }

  const mappedOptions = options.value
    .map((label, idx) => ({
      label: label.trim(),
      imageUrl: optionImages.value[idx]
    }))
    .filter(opt => opt.label !== "")

  const payload = {
    startTime: toSeoulOffsetDateTime(startTime.value),
    endTime: toSeoulOffsetDateTime(endTime.value),
    options: mappedOptions
  }

  isSubmitting.value = true

  try {
    await api.post(`/boards/${boardId}/vote-session`, payload)
    router.push(`/boards/${boardId}`)
  } catch (err) {
    console.error("생성 실패:", err.response?.data)
    alert(err.response?.data?.message || "갈드컵 생성에 실패했습니다.")
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 모바일에서 날짜 선택기 폰트 크기 강제 (줌 방지) */
input[type="datetime-local"] {
  font-size: 16px;
}
</style>