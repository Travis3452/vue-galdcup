<template>
  <div class="w-full font-sans">
    <div class="w-full bg-white p-8 md:p-12 flex flex-col relative overflow-hidden">
      <div class="absolute -top-32 -right-32 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      
      <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-8 tracking-tight flex items-center gap-3 relative z-10 pb-6 border-b-2 border-slate-100">
        📝 게시글 수정
      </h1>

      <div class="space-y-6 relative z-10 flex-1 flex flex-col">
        <div>
          <input
            v-model="title"
            type="text"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="제목을 입력하세요."
            aria-label="제목 입력"
          />
        </div>

        <div class="flex-1 flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all min-h-[500px]">
          <div ref="editorRef" class="w-full flex-1" aria-label="게시글 내용 에디터"></div>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-lg font-semibold">{{ errorMessage }}</span>
        </div>

        <div class="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-slate-100">
          <router-link
            :to="`/boards/${boardId}/posts/${postId}`"
            class="px-8 py-4 rounded-2xl font-bold text-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            취소
          </router-link>
          <button
            @click="updatePost"
            :disabled="submitting"
            class="px-10 py-4 rounded-2xl font-extrabold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1"
          >
            {{ submitting ? '수정 중...' : '수정 완료' }}
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
const postId = Number(route.params.postId || 0)

onMounted(async () => {
  await nextTick()
  initQuill()
  loadPost()
})

function initQuill() {
  const container = editorRef.value
  quill = new Quill(container, {
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
          console.error('이미지 업로드 실패', err)
          errorMessage.value = '이미지 업로드에 실패했습니다.'
        }
      }
    })
  }
}

async function loadPost() {
  try {
    const { data } = await api.get(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    })
    title.value = data.title
    quill.root.innerHTML = data.content
  } catch (err) {
    console.error('게시글 불러오기 실패', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
      alert(`${err.response.data.message}`)
    } else {
      errorMessage.value = '게시글을 불러오지 못했습니다.'
      alert('게시글을 불러오지 못했습니다.')
    }
  }
}

async function updatePost() {
  errorMessage.value = ''
  if (!title.value || title.value.trim() === '') {
    errorMessage.value = '제목을 입력하세요.'
    return
  }
  submitting.value = true
  try {
    const content = quill?.root?.innerHTML || ''
    const postData = {
      title: title.value.trim(),
      content,
    }
    await api.put(`/posts/${postId}`, postData, {
      headers: {
        Authorization: `Bearer ${store.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    // 수정 완료 시 해당 게시글 상세 페이지로 이동
    router.push(`/boards/${boardId}/posts/${postId}`)
  } catch (err) {
    console.error('게시글 수정 실패', err)
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message
      alert(`${err.response.data.message}`)
    } else {
      errorMessage.value = '게시글 수정에 실패했습니다.'
      alert('게시글 수정에 실패했습니다.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Quill 에디터의 기본 테마 스타일을 최신 UI에 맞게 덮어쓰기 (CreatePost와 동일) */
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