<template>
  <main class="min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 p-6 md:p-10 flex items-center justify-center">
    <div class="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-indigo-50 relative overflow-hidden flex flex-col">
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl pointer-events-none opacity-50"></div>
      
      <h1 class="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-8 tracking-tight flex items-center gap-3 relative z-10">
        📝 새로운 의견 작성
      </h1>

      <div class="space-y-6 relative z-10 flex-1 flex flex-col">
        <div>
          <input
            v-model="title"
            type="text"
            class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-6 py-5 text-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="제목을 입력하세요."
            aria-label="제목 입력"
          />
        </div>

        <div class="flex-1 flex flex-col border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <div ref="editorRef" class="w-full flex-1" aria-label="게시글 내용 에디터"></div>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-lg font-semibold">{{ errorMessage }}</span>
        </div>

        <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <router-link
            :to="`/boards/${boardId}`"
            class="px-8 py-4 rounded-2xl font-bold text-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            취소
          </router-link>
          <button
            @click="createPost"
            :disabled="submitting"
            class="px-10 py-4 rounded-2xl font-extrabold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1"
          >
            {{ submitting ? '작성 중...' : '작성 완료' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const title = ref('')
const editorRef = ref(null)
let quill = null
const submitting = ref(false)
const errorMessage = ref('')

const boardId = Number(route.params.boardId || 0)

onMounted(async () => {
  await nextTick()
  initQuill()
})

function initQuill() {
  const container = editorRef.value
  quill = new Quill(container, {
    theme: 'snow',
    placeholder: '당신의 논리와 의견을 자유롭게 펼쳐보세요...',
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
          console.error('이미지 업로드 실패', err)
          errorMessage.value = '이미지 업로드에 실패했습니다.'
        }
      }
    })
  }
}

async function createPost() {
  errorMessage.value = ''
  if (!title.value || title.value.trim() === '') {
    errorMessage.value = '제목을 입력하세요.'
    return
  }
  submitting.value = true
  try {
    const content = quill?.root?.innerHTML || ''
    const postData = {
      boardId,
      title: title.value.trim(),
      content,
    }
    await api.post('/posts', postData, {
      headers: {
        Authorization: `Bearer ${store.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    router.push(`/boards/${boardId}`)
  } catch (err) {
    console.error('게시글 생성 실패', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
      alert(`${err.response.data.message}`)
    } else {
      errorMessage.value = '알 수 없는 오류가 발생했습니다.'
      alert('알 수 없는 오류가 발생했습니다.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(.ql-toolbar.ql-snow) {
  background-color: #f8fafc; /* slate-50 */
  border: none !important;
  border-bottom: 1px solid #e2e8f0 !important; /* slate-200 */
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 1rem;
}

:deep(.ql-container.ql-snow) {
  border: none !important;
  font-family: inherit;
}

:deep(.ql-editor) {
  min-height: 400px;
  font-size: 1.125rem; /* text-lg */
  line-height: 1.75;
  color: #334155; /* slate-700 */
  padding: 1.5rem;
}

:deep(.ql-editor.ql-blank::before) {
  color: #94a3b8; /* slate-400 */
  font-style: normal;
}
</style>