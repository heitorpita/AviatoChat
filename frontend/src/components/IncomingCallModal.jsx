import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, PhoneOff } from 'lucide-react'
import { useSocketStore } from '@/store/socket.store'
import { useQueryClient } from '@tanstack/react-query'

export default function IncomingCallModal() {
  const { socket } = useSocketStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [incomingCall, setIncomingCall] = useState(null) // { callerId }

  useEffect(() => {
    if (!socket) return

    socket.on('call:incoming', ({ callerId }) => {
      const friends = queryClient.getQueryData(['friends'])?.amigos || []
      const caller = friends.find((f) => f.id === callerId)
      setIncomingCall({ callerId, callerName: caller?.fullName || 'Alguém' })
    })

    socket.on('call:ended', () => setIncomingCall(null))
    socket.on('call:rejected', () => setIncomingCall(null))

    return () => {
      socket.off('call:incoming')
      socket.off('call:ended')
      socket.off('call:rejected')
    }
  }, [socket])

  function accept() {
    socket?.emit('call:accept', { callerId: incomingCall.callerId })
    setIncomingCall(null)
    navigate(`/call/${incomingCall.callerId}?caller=false`)
  }

  function reject() {
    socket?.emit('call:reject', { callerId: incomingCall.callerId })
    setIncomingCall(null)
  }

  if (!incomingCall) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#023047] rounded-2xl p-8 text-center w-80 shadow-2xl border border-[#219ebc]/30">
        <div className="w-20 h-20 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {incomingCall.callerName?.[0]?.toUpperCase() || '?'}
        </div>

        <p className="text-white font-semibold text-xl mb-1">{incomingCall.callerName}</p>
        <p className="text-[#8ecae6] text-sm mb-8">Chamada de vídeo recebida...</p>

        <div className="flex gap-6 justify-center">
          <button
            onClick={reject}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={accept}
            className="w-14 h-14 rounded-full bg-[#10b981] hover:bg-green-600 flex items-center justify-center text-white transition-colors"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
