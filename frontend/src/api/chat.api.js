import api from '@/lib/axios'

export const getMessages = (friendId, params = {}) =>
  api.get(`/chat/messages/${friendId}`, { params })
