import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-store')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

export default api
