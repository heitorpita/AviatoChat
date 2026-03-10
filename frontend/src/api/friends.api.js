import api from '@/lib/axios'

export const sendFriendRequest = (userId) => api.post(`/friends/request/${userId}`)
export const acceptFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/accept`)
export const rejectFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/reject`)
export const getPendingRequests = () => api.get('/friends/requests')
