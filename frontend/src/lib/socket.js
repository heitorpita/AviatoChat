import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

let socket = null

export function createSocket(token) {
  if (socket) {
    socket.disconnect()
  }
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
