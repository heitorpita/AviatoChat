import api from './axios'

export const getChatUsers = () => api.get('/users/chat-users')
export const getFriends = () => api.get('/users/friends')
export const getAllUsers = () => api.get('/users')
