import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send, Video, Loader2 } from 'lucide-react'
import { getMessages } from '../api/chat.api'
import { getFriends } from '../api/users.api'
import { useAuthStore } from '../store/auth.store'
import { useSocketStore } from '../store/socket.store'
import { Avatar } from '../components/ui/Avatar'

export default function ChatPage() {
  const { friendId } = useParams()
  const usuario = useAuthStore((s) => s.usuario)
  const socket = useSocketStore((s) => s.socket)
  const onlineUsers = useSocketStore((s) => s.onlineUsers)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  // Busca dados do amigo a partir da lista de amigos
  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data.amigos),
  })
  const friend = friends.find((f) => f.id === friendId)
  const isOnline = onlineUsers.includes(friendId)

  // Histórico inicial
  const { isLoading } = useQuery({
    queryKey: ['messages', friendId],
    queryFn: () => getMessages(friendId).then((r) => r.data.messages),
    onSuccess: (data) => setMessages(data),
  })

  // Socket.IO
  useEffect(() => {
    if (!socket) return

    socket.emit('chat:join', { friendId })
    socket.emit('chat:read', { friendId })

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg])
      socket.emit('chat:read', { friendId })
    }

    const onTyping = ({ senderId, isTyping }) => {
      if (senderId === friendId) setIsTyping(isTyping)
    }

    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)

    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
    }
  }, [socket, friendId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleTextChange = (e) => {
    setText(e.target.value)
    socket?.emit('chat:typing', { friendId, isTyping: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket?.emit('chat:typing', { friendId, isTyping: false })
    }, 1500)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    socket?.emit('chat:message', { friendId, text })
    setText('')
    socket?.emit('chat:typing', { friendId, isTyping: false })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-brand-teal/15 glass">
        <Link to="/home" className="text-brand-sky hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        {friend && <Avatar usuario={friend} size="sm" showOnline />}
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{friend?.fullName || '…'}</p>
          <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-brand-sky/50'}`}>
            {isTyping ? 'digitando…' : isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        <Link to={`/call/${friendId}`}>
          <button className="w-10 h-10 rounded-xl bg-brand-orange/20 hover:bg-brand-orange flex items-center justify-center transition-colors" title="Videochamada">
            <Video size={18} className="text-brand-orange" />
          </button>
        </Link>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-brand-teal" size={24} />
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === usuario?.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isMe ? 'animate-msg-right' : 'animate-msg-left'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${isMe
                      ? 'bg-brand-teal text-white rounded-br-sm shadow-lg shadow-brand-teal/20'
                      : 'glass-light text-white rounded-bl-sm'
                    }`}
                >
                  {msg.text}
                  <span className={`block text-xs mt-1 ${isMe ? 'text-white/55 text-right' : 'text-brand-sky/50'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.readAt && ' ✓✓'}
                  </span>
                </div>
              </div>
            )
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2 h-2 rounded-full bg-brand-sky animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-brand-teal/15 glass">
        <input
          type="text"
          placeholder="Digite uma mensagem…"
          value={text}
          onChange={handleTextChange}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/6 border border-brand-teal/25 text-white placeholder-brand-sky/40 focus:outline-none focus:border-brand-teal/70 focus:bg-white/8 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-brand-teal hover:bg-cyan-500 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:glow-teal-sm active:scale-95"
        >
          <Send size={16} className="text-white" />
        </button>
      </form>
    </div>
  )
}
