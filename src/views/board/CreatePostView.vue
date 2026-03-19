<template>
  <div class="w-full font-sans bg-slate-50 md:bg-transparent min-h-screen md:min-h-0">
    <div class="w-full bg-white p-5 md:p-12 flex flex-col relative overflow-hidden min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-xl md:border md:border-slate-200">
      
      <div class="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-48 h-48 md:w-64 md:h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <h1 class="text-2xl md:text-4xl font-extrabold text-slate-800 mb-6 md:mb-8 tracking-tight flex items-center gap-2 md:gap-3 relative z-10 pb-4 md:pb-6 border-b-2 border-slate-100">
        <span class="text-xl md:text-3xl">📝</span> 새로운 게시글 작성
      </h1>

      <div class="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col">
        
        <div class="flex flex-col md:flex-row gap-3 md:gap-4">
          <div class="w-full md:w-48 shrink-0">
            <div class="relative">
              <select
                v-model="selectedCategoryId"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 py-3.5 md:py-4 text-sm md:text-base font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none cursor-pointer"
                aria-label="카테고리 선택"
              >
                <option :value="null" disabled>카테고리 선택</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.categoryType === 'NOTICE' ? '📢 ' + cat.name : '📁 ' + cat.name }}
                </option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div class="flex-1">
            <input
              v-model="title"
              type="text"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-6 md:py-4 text-base md:text-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="제목을 입력하세요."
              aria-label="제목 입력"
              @input="errorMessage = ''"
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all min-h-[350px] md:min-h-[500px]">
          <div ref="editorRef" class="w-full flex-1" aria-label="게시글 내용 에디터"></div>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm md:text-lg font-semibold">{{ errorMessage }}</span>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 mt-4 md:mt-8 pt-6 border-t-2 border-slate-100">
          <button
            @click="router.back()"
            class="px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center w-full sm:w-auto"
          >
            취소
          </button>
          
          <button
            @click="createPost"
            :disabled="submitting || !title.trim() || !selectedCategoryId"
            class="relative flex items-center justify-center gap-2 px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-extrabold text-sm md:text-lg text-white bg-indigo-600 shadow-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition transform active:scale-95 sm:min-w-[160px] w-full sm:w-auto"
          >
            <svg v-if="submitting" class="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span>{{ submitting ? '작성 중...' : '작성 완료' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'

const route = useRoute()
const router = useRouter()

const boardId = Number(route.params.boardId || 0)

// 상태 변수
const title = ref('')
const categories = ref([])
const selectedCategoryId = ref(null)
const editorRef = ref(null)
let quill = null
const submitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  await fetchCategories()
  await nextTick()
  initQuill()
})

async function fetchCategories() {
  try {
    const res = await api.get(`/boards/${boardId}/post-categories`)
    categories.value = res.data || []
    
    // 기본 카테고리(GENERAL) 자동 선택 로직
    const generalCat = categories.value.find(c => c.categoryType === 'GENERAL' || c.type === 'GENERAL')
    if (generalCat) {
      selectedCategoryId.value = generalCat.id
    }
  } catch (err) {
    console.error('카테고리 로드 실패', err)
    errorMessage.value = '카테고리 정보를 불러오지 못했습니다.'
  }
}

function initQuill() {
  if (!editorRef.value) return
  
  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: '당신의 논리와 의견을 자유롭게 펼쳐보세요.',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'image'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
    },
  })

  const toolbar = quill.getModule('toolbar')
  if (toolbar) {
    toolbar.addHandler('image', async () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.click()
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const url = await uploadImage(file)
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', url, 'user')
          quill.setSelection(range.index + 1)
        } catch (err) {
          errorMessage.value = '이미지 업로드에 실패했습니다.'
        }
      }
    })
  }
}

async function createPost() {
  if (submitting.value) return
  errorMessage.value = ''
  
  if (!selectedCategoryId.value) {
    errorMessage.value = '카테고리를 선택하세요.'
    return
  }
  if (!title.value.trim()) {
    errorMessage.value = '제목을 입력하세요.'
    return
  }

  submitting.value = true
  try {
    const content = quill?.root?.innerHTML || ''
    const postData = {
      boardId,
      categoryId: selectedCategoryId.value,
      title: title.value.trim(),
      content,
    }

    await api.post('/posts', postData)
    alert('게시글이 성공적으로 등록되었습니다!')
    router.push(`/boards/${boardId}`)
  } catch (err) {
    console.error('게시글 생성 실패', err)
    errorMessage.value = err.response?.data?.message || '게시글 생성 중 오류가 발생했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 🎨 Quill 에디터 최적화 스타일 */
:deep(.ql-toolbar.ql-snow) {
  background-color: #f8fafc;
  border: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 0.75rem; /* 기본 모바일 패딩 */
  display: flex;
  flex-wrap: wrap;
}

/* 데스크탑(md 이상) 패딩 설정 */
@media (min-width: 768px) {
  :deep(.ql-toolbar.ql-snow) {
    padding: 1rem; 
  }
}

:deep(.ql-container.ql-snow) {
  border: none !important;
  font-family: inherit;
}

:deep(.ql-editor) {
  min-height: 350px; /* 기본 모바일 높이 */
  font-size: 1rem;
  line-height: 1.6;
  color: #334155;
  padding: 1rem;
}

/* 데스크탑(md 이상) 상세 설정 */
@media (min-width: 768px) {
  :deep(.ql-editor) {
    min-height: 450px;
    font-size: 1.125rem;
    line-height: 1.75;
    padding: 1.5rem;
  }
}

/* 드롭다운 화살표 커스텀 */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.5em;
}
</style>