<template>
  <div class="page-wrap">
    <div class="container">
      <h1 class="title">게시글 작성</h1>

      <input
        v-model="title"
        class="title-input"
        placeholder="제목을 입력하세요."
        aria-label="제목 입력"
      />

      <div ref="editor" class="editor" aria-label="게시글 내용 에디터"></div>

      <div class="actions">
        <button class="btn primary" @click="submitPost" :disabled="submitting">
          {{ submitting ? '작성 중...' : '작성완료' }}
        </button>
        <router-link :to="`/boards/${boardId}`" class="btn secondary">취소</router-link>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import axios from 'axios'
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

const boardId = Number(route.params.boardId || route.params.id || 0)

onMounted(async () => {
  await nextTick()
  initQuill()
})

function initQuill() {
  const container = editorRef.value || document.querySelector('.editor')
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

async function submitPost() {
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
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, postData, {
      headers: {
        Authorization: `Bearer ${store.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    router.push(`/boards/${boardId}`)
  } catch (err) {
    console.error('게시글 저장 실패', err)
    errorMessage.value = '게시글 저장에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-wrap {
  background: #eef2ff;
  padding: 48px 16px;
  box-sizing: border-box;
}

.container {
  max-width: 980px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-sizing: border-box;
}

.title {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 700;
  color: #3730a3;
}

.title-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 1px solid #e6e9ff;
  border-radius: 10px;
  margin-bottom: 18px;
  background: #fbfbff;
}
.title-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 6px rgba(99,102,241,0.06);
}

.editor {
  border: 1px solid #e6e9ff;
  border-radius: 10px;
  background: #ffffff;
  margin-bottom: 18px;
}

/* 툴바 */
.editor .ql-toolbar {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background: #f8f9ff;
  border-bottom: 1px solid #eef0ff;
}
.editor .ql-container {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

/* ql-editor 높이 강제 적용 */
:deep(.ql-editor),
:deep(.ql-editor.ql-blank),
:deep(.ql-container .ql-editor) {
  height: auto !important;       /* 기본 height:100% 제거 */
  min-height: 520px !important;  /* 넉넉한 기본 높이 */
  max-height: 1000px !important;
  overflow-y: auto !important;
  padding: 18px !important;
  box-sizing: border-box !important;
  font-size: 16px;
  line-height: 1.6;
  color: #111827;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn.primary {
  background: linear-gradient(180deg, #4f46e5, #4338ca);
  color: #fff;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.18);
}
.btn.primary:disabled {
  background: linear-gradient(180deg, #a5b4fc, #8b9cff);
  cursor: not-allowed;
  box-shadow: none;
}
.btn.secondary {
  background: #f3f4ff;
  color: #3730a3;
  border: 1px solid #e6e9ff;
}

.error {
  color: #dc2626;
  margin-top: 12px;
  font-weight: 600;
}
</style>