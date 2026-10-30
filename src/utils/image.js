const extensions = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/avif': 'avif', 'image/bmp': 'bmp',
}
export const IMAGE_ACCEPT = Object.keys(extensions).join(',')
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export function validateImage(file) {
  if (!file || !extensions[file.type]) throw new Error('JPG, PNG, GIF, WEBP, AVIF, BMP 이미지를 선택해 주세요.')
  if (!Number.isFinite(file.size) || file.size <= 0) throw new Error('비어 있는 파일은 업로드할 수 없습니다.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('이미지 크기는 10MB 이하여야 합니다.')
  return extensions[file.type]
}
