import api from '@/lib/axios'

export const getChatUsers = () => api.get('/users/chat-users')
export const getFriends = () => api.get('/users/friends')
export const getAllUsers = () => api.get('/users')
export const getAiBot = () => api.get('/users/ai-bot')
