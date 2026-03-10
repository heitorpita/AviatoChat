import { useEffect, useCallback } from 'react'
import { useSocketStore } from '@/store/socket.store'

export function useChatSocket({ friendId, onMessage, onTyping, onRead }) {
  const { socket } = useSocketStore()

  useEffect(() => {
    if (!socket || !friendId) return

    socket.emit('chat:join', { friendId })

    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)
    socket.on('chat:read', onRead)

    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
      socket.off('chat:read', onRead)
    }
  }, [socket, friendId, onMessage, onTyping, onRead])

  const sendMessage = useCallback(
    (text) => socket?.emit('chat:message', { friendId, text }),
    [socket, friendId]
  )

  const sendTyping = useCallback(
    (isTyping) => socket?.emit('chat:typing', { friendId, isTyping }),
    [socket, friendId]
  )

  const markRead = useCallback(
    () => socket?.emit('chat:read', { friendId }),
    [socket, friendId]
  )

  return { sendMessage, sendTyping, markRead }
}
