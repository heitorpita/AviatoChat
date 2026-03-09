import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, PhoneOff } from 'lucide-react'
import { useSocketStore } from '../store/socket.store'
import { Button } from './ui/Button'

export function IncomingCallModal() {
  const socket = useSocketStore((s) => s.socket)
  const navigate = useNavigate()
  const [caller, setCaller] = useState(null)

  useEffect(() => {
    if (!socket) return

    const onIncoming = ({ callerId }) => {
      setCaller({ callerId })
    }

    const onEnded = () => setCaller(null)
    const onRejected = () => setCaller(null)

    socket.on('call:incoming', onIncoming)
    socket.on('call:ended', onEnded)
    socket.on('call:rejected', onRejected)

    return () => {
      socket.off('call:incoming', onIncoming)
      socket.off('call:ended', onEnded)
      socket.off('call:rejected', onRejected)
    }
  }, [socket])

  if (!caller) return null

  const accept = () => {
    socket?.emit('call:accept', { callerId: caller.callerId })
    navigate(`/call/${caller.callerId}`)
    setCaller(null)
  }

  const reject = () => {
    socket?.emit('call:reject', { callerId: caller.callerId })
    setCaller(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-navy border border-brand-teal/40 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl w-80">
        <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center animate-pulse">
          <Phone size={32} className="text-brand-teal" />
        </div>
        <div className="text-center">
          <p className="text-brand-sky text-sm">Chamada de vídeo recebida</p>
          <p className="text-white font-bold text-lg mt-1">ID: {caller.callerId.slice(0, 8)}…</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={reject}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
          >
            <PhoneOff size={22} className="text-white" />
          </button>
          <button
            onClick={accept}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
          >
            <Phone size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
