import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { useSocketStore } from '../store/socket.store'
import { useWebRTC } from '../hooks/useWebRTC'

export default function CallPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const socket = useSocketStore((s) => s.socket)

  const {
    localStream, remoteStream,
    isMuted, isCamOff,
    startCall, answerCall,
    addIceCandidate, setRemoteDescription,
    endCall, toggleMute, toggleCamera,
  } = useWebRTC(friendId)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [status, setStatus] = useState('connecting') // connecting | active | ended

  // Atribui streams aos elementos <video>
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      setStatus('active')
    }
  }, [remoteStream])

  // Inicia a chamada ao montar (caller)
  useEffect(() => {
    if (!socket) return

    // Se chegamos aqui via "call:accepted", somos o caller → iniciamos a oferta
    startCall()

    const onOffer = async ({ from, sdp }) => {
      if (from === friendId) {
        await answerCall(sdp)
      }
    }

    const onAnswer = async ({ sdp }) => {
      await setRemoteDescription(sdp)
    }

    const onIce = async ({ candidate }) => {
      await addIceCandidate(candidate)
    }

    const onEnded = () => {
      setStatus('ended')
      setTimeout(() => navigate('/home'), 2000)
    }

    socket.on('webrtc:offer', onOffer)
    socket.on('webrtc:answer', onAnswer)
    socket.on('webrtc:ice-candidate', onIce)
    socket.on('call:ended', onEnded)

    return () => {
      socket.off('webrtc:offer', onOffer)
      socket.off('webrtc:answer', onAnswer)
      socket.off('webrtc:ice-candidate', onIce)
      socket.off('call:ended', onEnded)
    }
  }, [socket])

  const handleEnd = () => {
    endCall()
    navigate('/home')
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Vídeo remoto (tela cheia) */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {status !== 'active' ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="animate-spin text-brand-teal" size={40} />
            <p className="text-brand-sky text-lg">
              {status === 'ended' ? 'Chamada encerrada.' : 'Conectando…'}
            </p>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Vídeo local (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-brand-teal shadow-lg bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCamOff ? 'hidden' : ''}`}
          />
          {isCamOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff size={20} className="text-brand-sky" />
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-6 py-6 bg-brand-navy border-t border-brand-teal/20">
        <ControlBtn onClick={toggleMute} active={isMuted} icon={isMuted ? MicOff : Mic} label={isMuted ? 'Ativar mic' : 'Silenciar'} />
        <ControlBtn onClick={handleEnd} danger icon={PhoneOff} label="Encerrar" />
        <ControlBtn onClick={toggleCamera} active={isCamOff} icon={isCamOff ? VideoOff : Video} label={isCamOff ? 'Ativar câmera' : 'Desligar câmera'} />
      </div>
    </div>
  )
}

function ControlBtn({ onClick, icon: Icon, label, danger, active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex flex-col items-center gap-1 group
      `}
    >
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95
        ${danger ? 'bg-red-600 hover:bg-red-700' : active ? 'bg-brand-teal/30 hover:bg-brand-teal/50' : 'bg-white/10 hover:bg-white/20'}
      `}>
        <Icon size={22} className={danger ? 'text-white' : active ? 'text-brand-teal' : 'text-white'} />
      </div>
      <span className="text-xs text-brand-sky group-hover:text-white transition-colors">{label}</span>
    </button>
  )
}
