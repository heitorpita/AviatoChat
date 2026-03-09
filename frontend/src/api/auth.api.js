import api from './axios'

export const signup = (data) => api.post('/users/signup', data)
export const login = (data) => api.post('/users/login', data)
export const logout = () => api.post('/users/logout')
export const getMe = () => api.get('/users/me')
export const onboard = (data) => api.put('/users/onboard', data)
