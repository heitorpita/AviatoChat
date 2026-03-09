import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Users } from 'lucide-react'
import { getAllUsers } from '../api/users.api'
import { useSocketStore } from '../store/socket.store'
import { Avatar } from '../components/ui/Avatar'

export default function AdminPage() {
  const onlineUsers = useSocketStore((s) => s.onlineUsers)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => getAllUsers().then((r) => r.data.usuarios),
  })

  if (isLoading) return <div className="p-8 text-brand-sky">Carregando…</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={22} className="text-brand-amber" />
        <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
        <span className="px-2 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber text-xs font-bold">
          {users.length} usuários
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total de usuários" value={users.length} />
        <StatCard label="Online agora" value={onlineUsers.length} highlight />
        <StatCard label="Onboarded" value={users.filter((u) => u.isOnboarded).length} />
      </div>

      {/* Tabela */}
      <div className="bg-white/5 border border-brand-teal/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/20">
              <th className="text-left px-4 py-3 text-brand-sky font-semibold">Usuário</th>
              <th className="text-left px-4 py-3 text-brand-sky font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-brand-sky font-semibold">Idiomas</th>
              <th className="text-left px-4 py-3 text-brand-sky font-semibold">Perfil</th>
              <th className="text-left px-4 py-3 text-brand-sky font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className={`border-b border-brand-teal/10 hover:bg-brand-teal/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar usuario={user} size="sm" showOnline />
                    <span className="text-white font-medium">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-sky">{user.email}</td>
                <td className="px-4 py-3 text-brand-sky">
                  {user.nativeLanguage && user.learningLanguage
                    ? `${user.nativeLanguage} → ${user.learningLanguage}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-brand-amber/20 text-brand-amber' : 'bg-brand-teal/20 text-brand-teal'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${onlineUsers.includes(user.id) ? 'text-green-400' : 'text-brand-sky/40'}`}>
                    {onlineUsers.includes(user.id) ? '● Online' : '○ Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-brand-teal/20'}`}>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className={`text-sm mt-1 ${highlight ? 'text-green-400' : 'text-brand-sky'}`}>{label}</p>
    </div>
  )
}
