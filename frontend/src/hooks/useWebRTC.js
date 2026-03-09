import { useRef, useState, useCallback } from 'react'
import { useSocketStore } from '../store/socket.store'

const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

export function useWebRTC(friendId) {
  const socket = useSocketStore((s) => s.socket)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)

  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(false)

  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(STUN)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit('webrtc:ice-candidate', { targetUserId: friendId, candidate })
      }
    }

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0])
    }

    pcRef.current = pc
    return pc
  }, [socket, friendId])

  const startCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    setLocalStream(stream)

    const pc = createPC()
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket?.emit('webrtc:offer', { targetUserId: friendId, sdp: pc.localDescription })
  }, [createPC, socket, friendId])

  const answerCall = useCallback(async (offerSdp) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    setLocalStream(stream)

    const pc = createPC()
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    await pc.setRemoteDescription(offerSdp)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket?.emit('webrtc:answer', { targetUserId: friendId, sdp: pc.localDescription })
  }, [createPC, socket, friendId])

  const addIceCandidate = useCallback(async (candidate) => {
    await pcRef.current?.addIceCandidate(candidate)
  }, [])

  const setRemoteDescription = useCallback(async (sdp) => {
    await pcRef.current?.setRemoteDescription(sdp)
  }, [])

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    setLocalStream(null)
    setRemoteStream(null)
    socket?.emit('call:end', { targetUserId: friendId })
  }, [socket, friendId])

  const toggleMute = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }, [])

  const toggleCamera = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCamOff(!videoTrack.enabled)
    }
  }, [])

  return {
    localStream,
    remoteStream,
    isMuted,
    isCamOff,
    startCall,
    answerCall,
    addIceCandidate,
    setRemoteDescription,
    endCall,
    toggleMute,
    toggleCamera,
  }
}
