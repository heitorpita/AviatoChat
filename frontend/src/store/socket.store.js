import { create } from 'zustand'

export const useSocketStore = create((set) => ({
  socket: null,
  onlineUsers: [],
  setSocket: (socket) => set({ socket }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
}))
