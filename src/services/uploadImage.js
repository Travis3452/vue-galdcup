// src/services/uploadImage.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY
)

export async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)

  if (!data?.publicUrl) {
    throw new Error('Public URL 생성 실패')
  }

  return data.publicUrl
}