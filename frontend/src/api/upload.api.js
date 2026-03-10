import api from '@/lib/axios'

/**
 * Faz upload de um arquivo de imagem para o servidor.
 * Retorna a URL absoluta da imagem para uso em <img src>.
 */
export const uploadFile = async (file) => {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  // data.url é relativo: "/uploads/filename.jpg"
  // Constrói URL absoluta baseada na baseURL do axios (ex: "http://localhost:5001/api" → "http://localhost:5001")
  const backendBase = (api.defaults.baseURL || 'http://localhost:5001/api').replace(/\/api$/, '')
  return `${backendBase}${data.url}`
}
