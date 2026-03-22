<template>
  <div class="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-4 md:p-10 font-sans flex justify-center items-start">
    
    <div class="w-full max-w-5xl bg-white rounded-2xl md:rounded-[2rem] shadow-2xl p-6 md:p-12 border border-indigo-50 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-48 h-48 md:w-64 md:h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <div class="relative z-10 space-y-8 md:space-y-10">
        
        <div class="border-b-2 border-slate-100 pb-6 md:pb-8 space-y-2 md:space-y-3 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              새로운 갈드컵 생성
            </h1>
            <p class="text-sm md:text-lg font-bold text-slate-500 mt-2">
              <span class="text-indigo-600">[{{ boardTitle }}]</span> 게시판에 어울리는 흥미로운 갈드컵을 열어보세요!
            </p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <button 
              @click="fetchAiRecommendation" 
              :disabled="isAiLoading"
              class="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 border border-transparent rounded-xl hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <svg v-if="!isAiLoading" class="w-5 h-5 mr-2 -ml-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
              </svg>
              <svg v-else class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isAiLoading ? 'AI가 고민 중...' : 'Gemini에게 추천받기' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700">투표 주제 <span class="text-red-500">*</span></label>
            <input 
              v-model="topic" 
              type="text" 
              placeholder="예: 평생 짜장면만 먹기 vs 평생 짬뽕만 먹기" 
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white"
            >
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700">투표 설명</label>
            <input 
              v-model="description" 
              type="text" 
              placeholder="투표 참여를 독려하는 짧은 설명을 적어주세요." 
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white"
            >
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700">시작 시간 <span class="text-red-500">*</span></label>
            <input 
              v-model="startTime" 
              type="datetime-local" 
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white cursor-pointer"
            >
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700">종료 시간 <span class="text-red-500">*</span></label>
            <input 
              v-model="endTime" 
              type="datetime-local" 
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white cursor-pointer"
            >
          </div>
        </div>

        <div class="space-y-6 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
          <div class="mb-4">
            <h2 class="text-xl md:text-2xl font-bold text-slate-800">
              투표 선택지 
            </h2>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(option, index) in options" 
              :key="index"
              class="group relative flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            >
              <div class="absolute -left-3 -top-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10">
                {{ index + 1 }}
              </div>

              <div class="w-full md:w-auto flex-shrink-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  :ref="el => fileInputs[index] = el"
                  @change="handleImageChange($event, index)"
                >
                <button 
                  @click="triggerFileInput(index)"
                  class="w-full md:w-24 h-24 md:h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative group/btn"
                  :class="optionPreviews[index] ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 bg-slate-50'"
                >
                  <img v-if="optionPreviews[index]" :src="optionPreviews[index]" class="w-full h-full object-cover" />
                  <div v-else class="text-slate-400 group-hover/btn:text-indigo-500 flex flex-col items-center">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span class="text-xs font-semibold">사진 추가</span>
                  </div>
                  <div v-if="optionPreviews[index] && !optionImages[index]" class="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                </button>
              </div>

              <div class="flex-grow w-full relative">
                <input 
                  v-model="options[index]" 
                  type="text" 
                  :placeholder="`선택지 ${index + 1}의 내용을 입력하세요`" 
                  class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white text-lg font-medium"
                >
              </div>

              <button 
                v-if="options.length > 2"
                @click="removeOption(index)"
                class="md:opacity-0 group-hover:opacity-100 absolute md:relative -top-2 -right-2 md:top-0 md:right-0 p-2 text-red-400 hover:text-white hover:bg-red-500 bg-white md:bg-transparent rounded-full md:rounded-lg transition-all border md:border-0 border-red-100 shadow-sm md:shadow-none"
                title="선택지 삭제"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>

          <button 
            @click="addOption"
            type="button"
            class="w-full py-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-center group"
          >
            <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            선택지 추가하기
          </button>
        </div>

        <div class="pt-6 border-t-2 border-slate-100 flex flex-col md:flex-row gap-4 justify-end">
          <button 
            @click="$router.back()"
            class="px-8 py-4 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-200 outline-none w-full md:w-auto order-2 md:order-1"
          >
            취소하기
          </button>
          <button 
            @click="createVoteSession"
            :disabled="!isFormValid || isSubmitting"
            class="px-10 py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-indigo-500/30 outline-none shadow-lg shadow-indigo-200 w-full md:w-auto order-1 md:order-2 flex justify-center items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? '생성 중...' : '갈드컵 열기' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'
// ✨ Pinia Store import 추가
import { useBoardStore } from '@/stores/board'

const router = useRouter()
const route = useRoute()
const boardStore = useBoardStore() // ✨ Store 인스턴스 생성

// 폼 데이터
const topic = ref('')
const description = ref('')
const startTime = ref('')
const endTime = ref('')
const options = ref(['', '']) 

// 파일 관련 상태 
const fileInputs = ref([])
const optionPreviews = ref([null, null]) 
const optionImages = ref([null, null])

// UI 상태
const isSubmitting = ref(false)
const isAiLoading = ref(false) 

// ✨ 게시판 제목을 Store에서 computed로 안전하게 가져오기
const boardTitle = computed(() => boardStore.currentBoard?.title || boardStore.currentBoard?.topic || '게시판')

// AI 추천 로직
const fetchAiRecommendation = async () => {
  if (topic.value.trim() !== '' || options.value.some(opt => opt.trim() !== '')) {
    const confirmOverwrite = confirm("현재 입력된 내용이 지워지고 AI 추천 내용으로 덮어씌워집니다. 진행하시겠습니까?")
    if (!confirmOverwrite) return
  }

  isAiLoading.value = true
  const boardId = route.params.boardId

  try {
    const response = await api.get(`/boards/${boardId}/vote-session/recommend`)
    const data = response.data

    topic.value = data.topic
    description.value = data.description || '' 

    options.value = data.options
    optionPreviews.value = new Array(data.options.length).fill(null)
    optionImages.value = new Array(data.options.length).fill(null)
    
  } catch (error) {
    console.error('AI 추천 실패:', error)
    alert('AI 추천을 불러오는데 실패했습니다. 직접 입력해주세요.')
  } finally {
    isAiLoading.value = false
  }
}

const addOption = () => {
  options.value.push('')
  optionPreviews.value.push(null)
  optionImages.value.push(null)
}

const removeOption = (index) => {
  options.value.splice(index, 1)
  optionPreviews.value.splice(index, 1)
  optionImages.value.splice(index, 1)
}

const triggerFileInput = (index) => {
  if (fileInputs.value[index]) {
    fileInputs.value[index].click()
  }
}

const handleImageChange = async (event, idx) => {
  const file = event.target.files[0]
  if (!file) return

  optionPreviews.value[idx] = URL.createObjectURL(file)

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
  return validOptionsCount >= 2 && startTime.value && endTime.value && topic.value.trim() !== ''
})

function toSeoulOffsetDateTime(localDateTimeStr) {
  const dateObj = new Date(localDateTimeStr)
  
  const pad = (num) => String(num).padStart(2, '0')
  const YYYY = dateObj.getFullYear()
  const MM = pad(dateObj.getMonth() + 1)
  const DD = pad(dateObj.getDate())
  const HH = pad(dateObj.getHours())
  const MIN = pad(dateObj.getMinutes())
  const SS = pad(dateObj.getSeconds())

  return `${YYYY}-${MM}-${DD}T${HH}:${MIN}:${SS}+09:00`
}

async function createVoteSession() {
  const boardId = route.params.boardId

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
    topic: topic.value,             
    description: description.value, 
    startTime: toSeoulOffsetDateTime(startTime.value),
    endTime: toSeoulOffsetDateTime(endTime.value),
    options: mappedOptions
  }

  isSubmitting.value = true

  try {
    await api.post(`/boards/${boardId}/vote-session`, payload)
    alert('투표가 성공적으로 오픈되었습니다! 🎉')
    router.replace(`/boards/${boardId}`)
  } catch (error) {
    console.error('투표 생성 실패:', error)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('투표 생성 중 오류가 발생했습니다.')
    }
  } finally {
    isSubmitting.value = false
  }
}

// ✨ 초기화 로직 수정
onMounted(async () => {
  const boardId = route.params.boardId
  
  // 1. Store에 게시판 정보가 없다면 새로 fetch (에러 발생했던 직접 API 호출 로직 대체)
  if (!boardStore.currentBoard || String(boardStore.currentBoard.id) !== String(boardId)) {
    try {
      await boardStore.fetchBoardDetails(boardId)
    } catch (e) {
      console.warn("게시판 이름 가져오기 실패", e)
    }
  }

  // 2. 시간 설정 로직 유지
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000 
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16)
  
  startTime.value = localISOTime
  
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const localEndISOTime = (new Date(oneWeekLater - offset)).toISOString().slice(0, 16)
  
  endTime.value = localEndISOTime
})
</script>