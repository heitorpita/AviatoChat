import { useEffect, useRef, useState, useCallback } from 'react'
import { useSocketStore } from '@/store/socket.store'

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

export function useWebRTC({ friendId, isCaller }) {
  const { socket } = useSocketStore()
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)

  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [callState, setCallState] = useState('connecting') // connecting | active | ended

  const cleanup = useCallback(() => {
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setLocalStream(null)
    setRemoteStream(null)
    setCallState('ended')
  }, [])

  useEffect(() => {
    if (!socket || !friendId) return

    async function start() {
      // Capturar mídia local
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      setLocalStream(stream)

      // Criar peer connection
      const pc = new RTCPeerConnection(ICE_SERVERS)
      pcRef.current = pc

      // Adicionar tracks locais
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      // Stream remoto
      const remote = new MediaStream()
      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remote.addTrack(t))
        setRemoteStream(remote)
        setCallState('active')
      }

      // ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('webrtc:ice-candidate', { targetUserId: friendId, candidate: e.candidate })
        }
      }

      if (isCaller) {
        // Sinalizar início da chamada e aguardar aceitação
        socket.emit('call:request', { targetUserId: friendId })
        socket.once('call:accepted', async () => {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('webrtc:offer', { targetUserId: friendId, sdp: offer })
        })
      }
    }

    start().catch(console.error)

    // Receber offer (callee)
    socket.on('webrtc:offer', async ({ sdp }) => {
      if (!pcRef.current) return
      await pcRef.current.setRemoteDescription(sdp)
      const answer = await pcRef.current.createAnswer()
      await pcRef.current.setLocalDescription(answer)
      socket.emit('webrtc:answer', { targetUserId: friendId, sdp: answer })
    })

    // Receber answer (caller)
    socket.on('webrtc:answer', async ({ sdp }) => {
      await pcRef.current?.setRemoteDescription(sdp)
    })

    // Receber ICE candidates
    socket.on('webrtc:ice-candidate', async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(candidate)
      } catch {}
    })

    // Chamada encerrada pelo outro lado
    socket.on('call:ended', () => cleanup())

    return () => {
      socket.off('webrtc:offer')
      socket.off('webrtc:answer')
      socket.off('webrtc:ice-candidate')
      socket.off('call:ended')
      cleanup()
    }
  }, [socket, friendId, isCaller, cleanup])

  const endCall = useCallback(() => {
    socket?.emit('call:end', { targetUserId: friendId })
    cleanup()
  }, [socket, friendId, cleanup])

  return { localStream, remoteStream, callState, endCall }
}
