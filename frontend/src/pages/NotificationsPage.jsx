import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPendingRequests } from '../api/friends.api'
import { acceptFriendRequest, rejectFriendRequest } from '../api/friends.api'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => getPendingRequests().then((r) => r.data.solicitacoes),
  })

  const accept = useMutation({
    mutationFn: (id) => acceptFriendRequest(id),
    onSuccess: () => {
      toast.success('Amizade aceita!')
      qc.invalidateQueries(['pending-requests'])
      qc.invalidateQueries(['friends'])
    },
    onError: () => toast.error('Erro ao aceitar'),
  })

  const reject = useMutation({
    mutationFn: (id) => rejectFriendRequest(id),
    onSuccess: () => {
      toast.success('Solicitação rejeitada.')
      qc.invalidateQueries(['pending-requests'])
    },
    onError: () => toast.error('Erro ao rejeitar'),
  })

  if (isLoading) return <div className="p-8 text-brand-sky">Carregando…</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Bell size={22} className="text-brand-amber" />
        <h1 className="text-2xl font-bold text-white">Notificações</h1>
        {requests.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-xs font-bold">
            {requests.length}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 text-brand-sky">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>Sem notificações no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white/5 border border-brand-teal/20 rounded-2xl p-4 flex items-center gap-4">
              <Avatar usuario={req.sender} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{req.sender?.fullName}</p>
                <p className="text-brand-sky text-xs">
                  {req.sender?.nativeLanguage} → {req.sender?.learningLanguage}
                </p>
                <p className="text-brand-sky/50 text-xs mt-0.5">Quer ser seu amigo</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => accept.mutate(req.id)}
                  disabled={accept.isPending}
                  className="w-10 h-10 rounded-xl bg-green-500/20 hover:bg-green-500 flex items-center justify-center transition-colors"
                  title="Aceitar"
                >
                  <Check size={18} className="text-green-400" />
                </button>
                <button
                  onClick={() => reject.mutate(req.id)}
                  disabled={reject.isPending}
                  className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500 flex items-center justify-center transition-colors"
                  title="Rejeitar"
                >
                  <X size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
