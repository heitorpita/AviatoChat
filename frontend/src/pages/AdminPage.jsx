import { useQuery } from '@tanstack/react-query'
import { getAllUsers } from '@/api/users.api'
import { Loader2, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => getAllUsers().then((r) => r.data),
  })

  const users = data?.usuarios || []

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-[#fb8500]" />
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#219ebc]" />
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Usuário', 'Email', 'Idiomas', 'Role', 'Cadastro'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.nativeLanguage} → {u.learningLanguage}</td>
                    <td className="px-4 py-3">
                      <Badge className={u.role === 'ADMIN' ? 'bg-[#fb8500] text-white hover:bg-[#fb8500]' : 'bg-[#8ecae6] text-[#023047] hover:bg-[#8ecae6]'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
