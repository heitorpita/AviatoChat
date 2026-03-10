import { useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useState } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import { getFriends } from '@/api/users.api'

export default function CallPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isCaller = searchParams.get('caller') === 'true'

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const { localStream, remoteStream, callState, endCall } = useWebRTC({ friendId, isCaller })

  const { data } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data),
  })
  const friend = data?.amigos?.find((f) => f.id === friendId)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    if (callState === 'ended') navigate(-1)
  }, [callState, navigate])

  function toggleMic() {
    localStream?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled })
    setMicOn((v) => !v)
  }

  function toggleCam() {
    localStream?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled })
    setCamOn((v) => !v)
  }

  function handleEnd() {
    endCall()
    navigate(-1)
  }

  return (
    <div className="h-screen bg-[#011a27] flex flex-col items-center justify-center relative">
      {/* Vídeo remoto (principal) */}
      <div className="w-full h-full">
        {remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 flex-col gap-4">
            <div className="w-24 h-24 rounded-full bg-[#023047] flex items-center justify-center text-4xl font-bold text-[#8ecae6]">
              {friend?.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="text-lg text-white/60">{friend?.fullName}</p>
            <p className="text-sm text-white/40 animate-pulse">
              {callState === 'connecting' ? 'Conectando...' : 'Aguardando...'}
            </p>
          </div>
        )}
      </div>

      {/* Vídeo local (picture-in-picture) */}
      <div className="absolute bottom-24 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-[#219ebc] shadow-lg">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      </div>

      {/* Nome do amigo */}
      {friend && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white font-semibold text-lg">{friend.fullName}</p>
          <p className="text-white/50 text-sm">{callState === 'active' ? 'Em chamada' : 'Conectando...'}</p>
        </div>
      )}

      {/* Controles */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full border-2 ${micOn ? 'border-white/30 text-white bg-white/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={toggleCam}
          className={`w-12 h-12 rounded-full border-2 ${camOn ? 'border-white/30 text-white bg-white/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  )
}
