import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Users, Bell, User, LogOut, ShieldCheck, Plane } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { logout as logoutApi } from '../../api/auth.api'
import { disconnectSocket } from '../../lib/socket'
import { Avatar } from '../ui/Avatar'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logoutApi() } catch { /* silencioso */ }
    disconnectSocket()
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-brand-navy border-r border-brand-teal/15 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-teal/15">
        <img src="/logo.svg" alt="AviatoChat" className="w-8 h-8" />
        <span className="text-xl font-bold text-gradient-amber" style={{ fontFamily: 'Syne, sans-serif' }}>AviatoChat</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
               ${isActive
                 ? 'bg-brand-teal/90 text-white shadow-lg shadow-brand-teal/25'
                 : 'text-brand-sky/70 hover:bg-brand-teal/15 hover:text-white'
               }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {usuario?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm
               ${isActive
                 ? 'bg-brand-amber text-brand-navy shadow-lg shadow-brand-amber/25'
                 : 'text-brand-amber/80 hover:bg-brand-amber/15'
               }`
            }
          >
            <ShieldCheck size={17} />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Usuário + Logout */}
      <div className="p-4 border-t border-brand-teal/15">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar usuario={usuario} size="sm" showOnline />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario?.fullName}</p>
            <p className="text-xs text-brand-sky/55 truncate">{usuario?.nativeLanguage} → {usuario?.learningLanguage}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
