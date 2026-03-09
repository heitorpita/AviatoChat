import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFriends } from '../api/users.api'
import { useSocketStore } from '../store/socket.store'
import { Avatar } from '../components/ui/Avatar'

export default function FriendsPage() {
  const onlineUsers = useSocketStore((s) => s.onlineUsers)
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data.amigos),
  })

  if (isLoading) return <div className="p-8 text-brand-sky">Carregando…</div>

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-8">
        Amigos <span className="text-brand-sky text-base font-normal">({friends.length})</span>
      </h1>

      {friends.length === 0 ? (
        <div className="text-center py-20 text-brand-sky">
          <p>Você ainda não tem amigos adicionados.</p>
          <p className="text-sm mt-1">Explore a Home para encontrar parceiros!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => {
            const isOnline = onlineUsers.includes(friend.id)
            return (
              <div key={friend.id} className="bg-white/5 border border-brand-teal/20 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-teal/50 transition-colors">
                <Avatar usuario={friend} size="md" showOnline />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{friend.fullName}</p>
                  <p className="text-brand-sky text-xs">{friend.nativeLanguage} → {friend.learningLanguage}</p>
                  {friend.location && <p className="text-brand-sky/50 text-xs">{friend.location}</p>}
                  <p className={`text-xs font-medium mt-0.5 ${isOnline ? 'text-green-400' : 'text-brand-sky/40'}`}>
                    {isOnline ? '● Online' : '○ Offline'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/chat/${friend.id}`}>
                    <button className="w-10 h-10 rounded-xl bg-brand-teal/20 hover:bg-brand-teal flex items-center justify-center transition-colors" title="Chat">
                      <MessageCircle size={18} className="text-brand-sky" />
                    </button>
                  </Link>
                  <Link to={`/call/${friend.id}`}>
                    <button className="w-10 h-10 rounded-xl bg-brand-orange/20 hover:bg-brand-orange flex items-center justify-center transition-colors" title="Videochamada">
                      <Video size={18} className="text-brand-orange" />
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
