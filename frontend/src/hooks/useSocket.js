import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'
import { useSocketStore } from '../store/socket.store'
import { connectSocket, disconnectSocket } from '../lib/socket'

export function useSocket() {
  const token = useAuthStore((s) => s.token)
  const setSocket = useSocketStore((s) => s.setSocket)
  const setOnlineUsers = useSocketStore((s) => s.setOnlineUsers)
  const clearSocket = useSocketStore((s) => s.clearSocket)

  useEffect(() => {
    if (!token) {
      disconnectSocket()
      clearSocket()
      return
    }

    const socket = connectSocket(token)
    setSocket(socket)

    socket.on('users:online', setOnlineUsers)

    return () => {
      socket.off('users:online', setOnlineUsers)
    }
  }, [token])
}
