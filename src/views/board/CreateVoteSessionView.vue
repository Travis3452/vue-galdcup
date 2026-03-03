<template>
  <div class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 font-sans flex justify-center items-start">
    
    <div class="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-32 -right-32 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-10">
        
        <div class="border-b-2 border-slate-100 pb-8 space-y-3">
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            새로운 투표 생성
          </h1>
          <p class="text-lg font-bold text-slate-500">
            <span class="text-indigo-600">[{{ boardTitle }}]</span> 게시판의 새 투표를 엽니다.
          </p>
        </div>

        <div class="space-y-4 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span class="text-indigo-500">🗓️</span> 투표 진행 기간
          </h2>
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1 space-y-2">
              <label class="text-sm font-bold text-slate-500">시작 일시</label>
              <input 
                type="datetime-local" 
                v-model="startTime"
                class="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="flex-1 space-y-2">
              <label class="text-sm font-bold text-slate-500">종료 일시</label>
              <input 
                type="datetime-local" 
                v-model="endTime"
                class="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-end">
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span class="text-rose-500">⚔️</span> 갈드컵 후보
            </h2>
            <button 
              @click="addOption"
              class="px-5 py-2.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition shadow-sm text-sm"
            >
              + 후보 추가
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="(label, idx) in options" 
              :key="idx"
              class="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:border-indigo-300 transition-colors shadow-sm relative group"
            >
              <button 
                v-if="options.length > 2"
                @click="removeOption(idx)"
                class="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full font-black shadow-md hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 flex items-center justify-center z-20"
              >
                ✕
              </button>

              <div class="space-y-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    {{ idx + 1 }}
                  </span>
                  <span class="font-bold text-slate-500 tracking-widest text-sm">후보</span>
                </div>

                <input 
                  type="text" 
                  v-model="options[idx]"
                  placeholder="후보의 이름을 입력하세요."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-400 mb-1">대표 이미지 첨부</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => onImageUpload(e, idx)"
                    class="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                  />
                  <div v-if="optionPreviews[idx]" class="mt-4 rounded-xl overflow-hidden border-2 border-slate-100 aspect-video relative group/img">
                    <img :src="optionPreviews[idx]" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity" :class="optionImages[idx] ? 'opacity-0 group-hover/img:opacity-100' : 'opacity-100'">
                      <span v-if="optionImages[idx]" class="bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/20">이미지 등록 완료</span>
                      <span v-else class="bg-indigo-600/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse backdrop-blur-sm">업로드 중...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t-2 border-slate-100 flex justify-end gap-4">
          <button 
            @click="createVoteSession"
            class="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            투표 생성하기
          </button>
          <button 
            @click="router.back()"
            class="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition"
          >
            취소
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'

const route = useRoute()
const router = useRouter()

const boardTitle = ref('')

// 날짜 초기화 로직 (다음날 0시)
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

// 이미지 관련 상태 분리
const optionPreviews = ref([null, null]) // 로컬 미리보기용
const optionImages = ref([null, null])   // 서버 업로드 완료된 URL

onMounted(async () => {
  const boardId = route.params.boardId
  try {
    // [수정] 헤더 수동 주입 제거
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

// 시간 포맷 변환 (서버 전송용 KST 보정)
function toSeoulOffsetDateTime(dtLocalValue) {
  if (!dtLocalValue) return null
  const normalized = dtLocalValue.length === 16 ? `${dtLocalValue}:00` : dtLocalValue
  return new Date(normalized + '+09:00').toISOString()
}

// 이미지 업로드 핸들러
async function onImageUpload(event, idx) {
  const file = event.target.files?.[0]
  if (!file) return
  
  // 미리보기 즉시 표시
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

// 투표 생성 전송
async function createVoteSession() {
  const boardId = route.params.boardId

  // 업로드 중인지 체크
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

  if (mappedOptions.length < 2) {
    alert("최소 2개 이상의 선택지(후보)를 입력해야 합니다.")
    return
  }
  if (!startTime.value || !endTime.value) {
    alert("시작 일시와 종료 일시를 모두 설정해주세요.")
    return
  }

  const payload = {
    startTime: toSeoulOffsetDateTime(startTime.value),
    endTime: toSeoulOffsetDateTime(endTime.value),
    options: mappedOptions
  }

  try {
    // [수정] 헤더 수동 주입 제거
    await api.post(`/boards/${boardId}/vote-session`, payload)
    alert('새로운 갈드컵 투표가 성공적으로 열렸습니다!')
    router.push(`/boards/${boardId}`)
  } catch (err) {
    console.error("생성 실패:", err.response?.data)
    alert("갈드컵 생성에 실패했습니다. 입력값을 확인해주세요.")
  }
}
</script>