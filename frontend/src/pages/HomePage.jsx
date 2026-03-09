import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, UserPlus, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFriends, getChatUsers } from '../api/users.api'
import { sendFriendRequest } from '../api/friends.api'
import { useSocketStore } from '../store/socket.store'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

export default function HomePage() {
  const onlineUsers = useSocketStore((s) => s.onlineUsers)
  const qc = useQueryClient()

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends().then((r) => r.data.amigos),
  })

  const { data: suggestions = [] } = useQuery({
    queryKey: ['chat-users'],
    queryFn: () => getChatUsers().then((r) => r.data.usuarios),
  })

  const addFriend = useMutation({
    mutationFn: (userId) => sendFriendRequest(userId),
    onSuccess: () => {
      toast.success('Solicitação enviada!')
      qc.invalidateQueries(['chat-users'])
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao enviar solicitação'),
  })

  const onlineFriends = friends.filter((f) => onlineUsers.includes(f.id))
  const offlineFriends = friends.filter((f) => !onlineUsers.includes(f.id))

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8">Home</h1>

      {/* Amigos Online */}
      {onlineFriends.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
            Online agora — {onlineFriends.length}
          </h2>
          <div className="flex flex-wrap gap-4">
            {onlineFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} isOnline />
            ))}
          </div>
        </section>
      )}

      {/* Todos os amigos */}
      {friends.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-brand-sky uppercase tracking-wider mb-4">
            Seus amigos — {friends.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} isOnline={onlineUsers.includes(friend.id)} full />
            ))}
          </div>
        </section>
      )}

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-brand-amber uppercase tracking-wider mb-4">
            Pessoas para conhecer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((user) => (
              <div key={user.id} className="bg-white/5 border border-brand-teal/20 rounded-2xl p-4 flex items-center gap-4">
                <Avatar usuario={user} size="md" showOnline />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.fullName}</p>
                  <p className="text-brand-sky text-xs">{user.nativeLanguage} → {user.learningLanguage}</p>
                  {user.location && <p className="text-brand-sky/60 text-xs">{user.location}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addFriend.mutate(user.id)}
                  disabled={addFriend.isPending}
                >
                  <UserPlus size={16} />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {friends.length === 0 && suggestions.length === 0 && (
        <div className="text-center py-20 text-brand-sky">
          <p className="text-lg">Nenhuma sugestão no momento.</p>
          <p className="text-sm mt-2">Complete seu perfil com idiomas para encontrar parceiros.</p>
        </div>
      )}
    </div>
  )
}

function FriendCard({ friend, isOnline, full }) {
  if (!full) {
    return (
      <Link to={`/chat/${friend.id}`} className="flex flex-col items-center gap-2 group">
        <Avatar usuario={friend} size="lg" showOnline />
        <span className="text-xs text-brand-sky group-hover:text-white transition-colors truncate max-w-16 text-center">
          {friend.fullName.split(' ')[0]}
        </span>
      </Link>
    )
  }

  return (
    <div className="bg-white/5 border border-brand-teal/20 rounded-2xl p-4 flex items-center gap-4">
      <Avatar usuario={friend} size="md" showOnline />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{friend.fullName}</p>
        <p className="text-brand-sky text-xs">{friend.nativeLanguage} → {friend.learningLanguage}</p>
        <p className={`text-xs font-medium mt-0.5 ${isOnline ? 'text-green-400' : 'text-brand-sky/40'}`}>
          {isOnline ? '● Online' : '○ Offline'}
        </p>
      </div>
      <div className="flex gap-2">
        <Link to={`/chat/${friend.id}`}>
          <button className="w-9 h-9 rounded-xl bg-brand-teal/20 hover:bg-brand-teal flex items-center justify-center transition-colors">
            <MessageCircle size={16} className="text-brand-sky" />
          </button>
        </Link>
        <Link to={`/call/${friend.id}`}>
          <button className="w-9 h-9 rounded-xl bg-brand-orange/20 hover:bg-brand-orange flex items-center justify-center transition-colors">
            <Video size={16} className="text-brand-orange" />
          </button>
        </Link>
      </div>
    </div>
  )
}
