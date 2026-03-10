import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Video, Globe, MessageSquare, Loader2, CheckCheck, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'
import { getFriends } from '@/api/users.api'
import { getMessages } from '@/api/chat.api'
import { uploadFile } from '@/api/upload.api'
import { useChatSocket } from '@/hooks/useSocket'

export default function ChatPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { onlineUsers } = useSocketStore()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const typingTimerRef = useRef(null)
  const bottomRef = useRef(null)
  const imageInputRef = useRef(null)

  // Lista de amigos (sidebar)
  const { data: friendsData } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data),
  })
  const friends = friendsData?.amigos || []
  const activeFriend = friends.find((f) => f.id === friendId)

  // Histórico de mensagens — staleTime: 0 garante refetch ao trocar de amigo
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', friendId],
    queryFn: () => getMessages(friendId).then((r) => r.data),
    enabled: !!friendId,
    staleTime: 0,
  })

  // Sincroniza dados da query com o estado local (substitui onSuccess removido no TanStack v5)
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.mensagens || [])
    }
  }, [messagesData])

  // Reset ao trocar de conversa
  useEffect(() => {
    setMessages([])
    setIsTyping(false)
    setText('')
  }, [friendId])

  // Socket handlers
  const handleMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const handleTyping = useCallback(({ senderId, isTyping: typing }) => {
    if (senderId === friendId) setIsTyping(typing)
  }, [friendId])

  const handleRead = useCallback(({ readAt }) => {
    setMessages((prev) =>
      prev.map((m) => (m.senderId === user?.id && !m.readAt ? { ...m, readAt } : m))
    )
  }, [user?.id])

  const { sendMessage, sendTyping, markRead } = useChatSocket({
    friendId,
    onMessage: handleMessage,
    onTyping: handleTyping,
    onRead: handleRead,
  })

  // Scroll para o fim ao receber mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Marcar como lido ao abrir a conversa
  useEffect(() => {
    if (friendId) markRead()
  }, [friendId, markRead])

  function handleSelectFriend(friend) {
    navigate(`/chat/${friend.id}`)
    setShowSidebar(false) // mobile: vai para o chat
  }

  function handleInput(e) {
    setText(e.target.value)
    sendTyping(true)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => sendTyping(false), 1500)
  }

  function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !friendId) return
    sendMessage({ text: trimmed })
    setText('')
    sendTyping(false)
    clearTimeout(typingTimerRef.current)
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file || !friendId) return
    e.target.value = ''
    setUploadingImage(true)
    try {
      const imageUrl = await uploadFile(file)
      sendMessage({ imageUrl })
    } catch {
      // silently fail
    } finally {
      setUploadingImage(false)
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar de conversas */}
      <div className={`border-r border-border bg-card flex-col shrink-0 w-full md:w-72 ${showSidebar ? 'flex' : 'hidden'} md:flex`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Mensagens</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Adicione amigos para começar a conversar
            </div>
          ) : (
            friends.map((friend) => {
              const online = onlineUsers.includes(friend.id)
              const active = friend.id === friendId
              return (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${active ? 'bg-muted/70 border-r-2 border-[#219ebc]' : ''}`}
                >
                  <div className="relative shrink-0">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.fullName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-sm font-bold">
                        {friend.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${online ? 'bg-[#10b981]' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{friend.fullName}</p>
                    <p className="text-xs text-muted-foreground">{friend.nativeLanguage} → {friend.learningLanguage}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Área de chat */}
      {!friendId ? (
        <div className="flex-1 hidden md:flex items-center justify-center text-center text-muted-foreground">
          <div>
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Selecione uma conversa para começar</p>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex-col ${!showSidebar ? 'flex' : 'hidden'} md:flex`}>
          {/* Header do chat */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setShowSidebar(true)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                {activeFriend?.profilePic ? (
                  <img src={activeFriend.profilePic} alt={activeFriend.fullName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-sm font-bold">
                    {activeFriend?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {onlineUsers.includes(friendId) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{activeFriend?.fullName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  {activeFriend?.nativeLanguage} → {activeFriend?.learningLanguage}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/call/${friendId}?caller=true`)}
              className="flex items-center gap-1.5 text-[#219ebc] border-[#219ebc] hover:bg-[#219ebc] hover:text-white"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Ligar</span>
            </Button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f9ff]">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Nenhuma mensagem ainda. Diga olá! 👋
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-[#219ebc] text-white rounded-br-sm' : 'bg-white text-foreground border border-border rounded-bl-sm shadow-sm'}`}>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="imagem"
                          className="max-w-full rounded-lg mb-1 cursor-pointer"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      )}
                      {msg.text && <p>{msg.text}</p>}
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${mine ? 'text-white/70 justify-end' : 'text-muted-foreground'}`}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {mine && (
                          <CheckCheck className={`w-3 h-3 ${msg.readAt ? 'text-[#ffb703]' : 'text-white/50'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-[#219ebc] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input de mensagem */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
            <label className={`cursor-pointer shrink-0 text-[#219ebc] hover:text-[#023047] transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={uploadingImage}
              />
            </label>
            <Input
              value={text}
              onChange={handleInput}
              placeholder="Digite uma mensagem..."
              className="flex-1 focus-visible:ring-[#219ebc]"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#219ebc] hover:bg-[#023047] text-white shrink-0"
              disabled={!text.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
