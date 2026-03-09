import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth-store')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch {
      // token corrompido — ignora
    }
  }
  return config
})

export default api
