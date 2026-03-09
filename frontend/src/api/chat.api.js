import api from './axios'

export const getMessages = (friendId, { limit = 50, cursor } = {}) => {
  const params = { limit }
  if (cursor) params.cursor = cursor
  return api.get(`/chat/messages/${friendId}`, { params })
}
