import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Check, X, Bell, Loader2 } from 'lucide-react'
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '@/api/friends.api'

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => getPendingRequests().then((r) => r.data),
  })

  const accept = useMutation({
    mutationFn: (id) => acceptFriendRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const reject = useMutation({
    mutationFn: (id) => rejectFriendRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-requests'] }),
  })

  const requests = data?.solicitacoes || []

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Notificações</h1>

        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nenhuma solicitação pendente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="shrink-0">
                  {req.sender?.profilePic ? (
                    <img src={req.sender.profilePic} alt={req.sender.fullName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#219ebc] flex items-center justify-center text-white font-bold">
                      {req.sender?.fullName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{req.sender?.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {req.sender?.nativeLanguage} → {req.sender?.learningLanguage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Quer ser seu amigo</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="bg-[#10b981] hover:bg-green-600 text-white" onClick={() => accept.mutate(req.id)} disabled={accept.isPending}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 border-red-200" onClick={() => reject.mutate(req.id)} disabled={reject.isPending}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
