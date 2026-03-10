import { NavLink, useNavigate } from 'react-router-dom'
import { Home, MessageCircle, Users, Bell, User, LogOut, Globe, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { disconnectSocket } from '@/lib/socket'
import { useSocketStore } from '@/store/socket.store'
import { logout } from '@/api/auth.api'

const navLinks = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/friends', icon: Users, label: 'Amigos' },
  { to: '/notifications', icon: Bell, label: 'Notificações' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const { setSocket, setOnlineUsers } = useSocketStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await logout() } catch {}
    disconnectSocket()
    setSocket(null)
    setOnlineUsers([])
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen bg-[#023047] flex flex-col text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <Globe className="w-7 h-7 text-[#8ecae6]" />
        <span className="font-bold text-lg">AviatoChat</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#219ebc] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#ffb703] text-[#023047]'
                  : 'text-[#ffb703]/80 hover:bg-white/10 hover:text-[#ffb703]'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#219ebc] flex items-center justify-center text-sm font-bold shrink-0">
            {user?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-white/50 truncate">{user?.nativeLanguage} → {user?.learningLanguage}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
