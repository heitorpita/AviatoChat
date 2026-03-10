import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { MessageSquare, Video, Globe, Users, Loader2 } from 'lucide-react'
import { useSocketStore } from '@/store/socket.store'
import { getFriends } from '@/api/users.api'

export default function FriendsPage() {
  const navigate = useNavigate()
  const { onlineUsers } = useSocketStore()

  const { data, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data),
  })

  const friends = data?.amigos || []

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Meus Amigos</h1>

        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
          </div>
        ) : friends.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Você ainda não tem amigos. Adicione parceiros na página inicial!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {friends.map((friend) => {
              const isOnline = onlineUsers.includes(friend.id)
              return (
                <div key={friend.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
                  <div className="relative shrink-0">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.fullName} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-lg font-bold">
                        {friend.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 border-2 border-white rounded-full ${isOnline ? 'bg-[#10b981]' : 'bg-gray-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{friend.fullName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>{friend.nativeLanguage} → {friend.learningLanguage}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{isOnline ? 'Online agora' : 'Offline'}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="bg-[#219ebc] hover:bg-[#023047] text-white" onClick={() => navigate(`/chat/${friend.id}`)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      navigate(`/call/${friend.id}?caller=true`)
                    }}>
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
