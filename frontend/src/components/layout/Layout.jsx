import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'
import { createSocket } from '@/lib/socket'
import IncomingCallModal from '@/components/IncomingCallModal'

export default function Layout() {
  const { token } = useAuthStore()
  const { setSocket, setOnlineUsers } = useSocketStore()

  useEffect(() => {
    if (!token) return

    const socket = createSocket(token)
    setSocket(socket)

    socket.on('users:online', (userIds) => {
      setOnlineUsers(userIds)
    })

    return () => {
      socket.off('users:online')
    }
  }, [token, setSocket, setOnlineUsers])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <IncomingCallModal />
    </div>
  )
}
