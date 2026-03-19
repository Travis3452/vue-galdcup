<template>
  <div class="w-full font-sans bg-slate-50 md:bg-transparent min-h-screen md:min-h-0">
    <div class="w-full bg-white p-5 md:p-12 flex flex-col relative overflow-hidden min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-xl md:border md:border-slate-200">
      
      <div class="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-48 h-48 md:w-64 md:h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <h1 class="text-2xl md:text-4xl font-extrabold text-slate-800 mb-6 md:mb-8 tracking-tight flex items-center gap-2 md:gap-3 relative z-10 pb-4 md:pb-6 border-b-2 border-slate-100">
        <span class="text-xl md:text-3xl">📝</span> 게시글 수정
      </h1>

      <div class="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col">
        <div>
          <input
            v-model="title"
            type="text"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-6 md:py-5 text-base md:text-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="제목을 입력하세요."
            aria-label="제목 입력"
            @input="errorMessage = ''"
          />
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
          <router-link
            :to="`/boards/${boardId}/posts/${postId}`"
            class="px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center w-full sm:w-auto"
          >
            취소
          </router-link>
          
          <button
            @click="updatePost"
            :disabled="submitting || !title.trim()"
            class="relative flex items-center justify-center gap-2 px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-extrabold text-sm md:text-lg text-white bg-indigo-600 shadow-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition transform active:scale-95 sm:min-w-[160px] w-full sm:w-auto"
          >
            <svg v-if="submitting" class="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span>{{ submitting ? '수정 중...' : '수정 완료' }}</span>
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

const title = ref('')
const editorRef = ref(null)
let quill = null
const submitting = ref(false)
const errorMessage = ref('')

const boardId = Number(route.params.boardId || 0)
const postId = Number(route.params.postId || 0)

onMounted(async () => {
  await nextTick()
  initQuill()
  loadPost()
})

function initQuill() {
  if (!editorRef.value) return
  
  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: '게시글 내용을 작성해주세요.',
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

async function loadPost() {
  try {
    const { data } = await api.get(`/posts/${postId}`)
    title.value = data.title
    if (quill) {
      quill.root.innerHTML = data.content
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '게시글을 불러오지 못했습니다.'
  }
}

async function updatePost() {
  if (submitting.value) return
  errorMessage.value = ''
  
  if (!title.value.trim()) {
    errorMessage.value = '제목을 입력하세요.'
    return
  }
  
  submitting.value = true
  try {
    const content = quill?.root?.innerHTML || ''
    await api.put(`/posts/${postId}`, {
      title: title.value.trim(),
      content,
    })
    
    alert('게시글이 성공적으로 수정되었습니다!')
    router.push(`/boards/${boardId}/posts/${postId}`)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '게시글 수정에 실패했습니다.'
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
  padding: 0.75rem;
  display: flex;
  flex-wrap: wrap;
}

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
  min-height: 350px;
  font-size: 1rem;
  line-height: 1.6;
  color: #334155;
  padding: 1rem;
}

@media (min-width: 768px) {
  :deep(.ql-editor) {
    min-height: 450px;
    font-size: 1.125rem;
    line-height: 1.75;
    padding: 1.5rem;
  }
}

/* 플레이스홀더 색상 */
:deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
  font-style: normal;
}
</style>