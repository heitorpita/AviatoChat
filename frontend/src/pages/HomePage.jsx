import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { MessageSquare, Video, Users, Globe, UserPlus, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'
import { getChatUsers } from '@/api/users.api'
import { sendFriendRequest } from '@/api/friends.api'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { onlineUsers } = useSocketStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['chat-users'],
    queryFn: () => getChatUsers().then((r) => r.data),
  })

  const addFriend = useMutation({
    mutationFn: (userId) => sendFriendRequest(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-users'] }),
  })

  const users = data?.usuarios || []

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#219ebc] to-[#023047] rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Olá, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-4 md:mb-6">
            Pronto para praticar {user?.learningLanguage}?
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button className="bg-white text-[#023047] hover:bg-white/90 text-sm" onClick={() => navigate('/friends')}>
              <Users className="w-4 h-4 mr-2" />
              Meus Amigos
            </Button>
            <Button className="border border-white text-white hover:bg-white/10 text-sm bg-transparent" onClick={() => navigate('/chat')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Ver Conversas
            </Button>
          </div>
        </div>

        {/* Suggested Partners */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Parceiros Sugeridos</h2>
            <span className="text-sm text-muted-foreground">{users.length} disponíveis</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhum parceiro disponível no momento.</p>
            </div>
          ) : (
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((partner) => {
                const isOnline = onlineUsers.includes(partner.id)
                return (
                  <div key={partner.id} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {partner.profilePic ? (
                        <img src={partner.profilePic} alt={partner.fullName} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-xl font-bold">
                          {partner.fullName?.[0]?.toUpperCase()}
                        </div>
                      )}
                      {isOnline && (
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{partner.fullName}</h3>
                        {isOnline && <span className="text-xs text-[#10b981] font-medium">Online</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{partner.nativeLanguage} → {partner.learningLanguage}</span>
                      </div>
                      {partner.location && <p className="text-xs text-muted-foreground truncate">{partner.location}</p>}
                      {partner.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{partner.bio}</p>}
                      <Button
                        size="sm"
                        className="mt-2 bg-[#219ebc] hover:bg-[#023047] text-white text-xs h-7"
                        onClick={() => addFriend.mutate(partner.id)}
                        disabled={addFriend.isPending}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
