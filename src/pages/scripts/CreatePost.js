import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'
import { useUserStore } from '@/stores/user'

export default function useCreatePost() {
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

  return {
    title,
    editorRef,
    boardId,
    submitting,
    errorMessage,
    createPost,
    initQuill
  }
}