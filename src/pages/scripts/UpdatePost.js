import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import api from '@/axios'
import { uploadImage } from '@/services/uploadImage'
import { useUserStore } from '@/stores/user'

export default function useUpdatePost() {
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

  return {
    title,
    editorRef,
    boardId,
    postId,
    submitting,
    errorMessage,
    updatePost,
    initQuill,
    loadPost
  }
}
