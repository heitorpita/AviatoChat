import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Sparkles, Loader2, CheckCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { getMessages } from '@/api/chat.api'
import { getAiBot } from '@/api/users.api'
import { useChatSocket } from '@/hooks/useSocket'

export default function AIChatPage() {
  const { user } = useAuthStore()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimerRef = useRef(null)
  const bottomRef = useRef(null)

  // Buscar dados do bot
  const { data: botData, isLoading: loadingBot } = useQuery({
    queryKey: ['ai-bot'],
    queryFn: () => getAiBot().then((r) => r.data),
  })
  const bot = botData?.bot

  // Histórico de mensagens
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', bot?.id],
    queryFn: () => getMessages(bot.id).then((r) => r.data),
    enabled: !!bot?.id,
    staleTime: 0,
  })

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.mensagens || [])
    }
  }, [messagesData])

  const handleMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const handleTyping = useCallback(({ senderId, isTyping: typing }) => {
    if (senderId === bot?.id) setIsTyping(typing)
  }, [bot?.id])

  const handleRead = useCallback(({ readAt }) => {
    setMessages((prev) =>
      prev.map((m) => (m.senderId === user?.id && !m.readAt ? { ...m, readAt } : m))
    )
  }, [user?.id])

  const { sendMessage, sendTyping, markRead } = useChatSocket({
    friendId: bot?.id,
    onMessage: handleMessage,
    onTyping: handleTyping,
    onRead: handleRead,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (bot?.id) markRead()
  }, [bot?.id, markRead])

  function handleInput(e) {
    setText(e.target.value)
    sendTyping(true)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => sendTyping(false), 1500)
  }

  function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !bot?.id) return
    sendMessage({ text: trimmed })
    setText('')
    sendTyping(false)
    clearTimeout(typingTimerRef.current)
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loadingBot) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-8">
        <div>
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Bot não encontrado</p>
          <p className="text-sm">Execute <code className="bg-muted px-1 rounded">npm run seed:bot</code> no backend.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="relative">
          {bot.profilePic ? (
            <img src={bot.profilePic} alt={bot.fullName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#219ebc] to-[#023047] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-white rounded-full" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground">{bot.fullName}</p>
            <span className="text-[10px] bg-[#219ebc]/10 text-[#219ebc] px-1.5 py-0.5 rounded-full font-medium">Bot</span>
          </div>
          <p className="text-xs text-muted-foreground">{bot.bio}</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f9ff]">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219ebc] to-[#023047] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Olá! Sou a Prof. Ava</p>
              <p className="text-sm">Estou aqui para te ajudar a praticar idiomas. Manda uma mensagem!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-[#219ebc] text-white rounded-br-sm' : 'bg-white text-foreground border border-border rounded-bl-sm shadow-sm'}`}>
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
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

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card shrink-0">
        <Input
          value={text}
          onChange={handleInput}
          placeholder="Escreva em qualquer idioma..."
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
  )
}
