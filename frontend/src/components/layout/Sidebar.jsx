import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, MessageCircle, Users, Bell, User, LogOut, Globe, Shield, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    try { await logout() } catch {}
    disconnectSocket()
    setSocket(null)
    setOnlineUsers([])
    clearAuth()
    navigate('/login')
  }

  return (
    <>
      {/* ── Sidebar desktop (visível em md+) ────────────────────────── */}
      <aside className={`hidden md:flex h-screen bg-[#023047] flex-col text-white shrink-0 transition-all duration-300 overflow-hidden ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className={`flex items-center border-b border-white/10 py-5 ${collapsed ? 'justify-center px-0' : 'gap-2 px-5'}`}>
          <Globe className="w-7 h-7 text-[#8ecae6] shrink-0" />
          {!collapsed && <span className="font-bold text-lg flex-1 truncate">AviatoChat</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-white/50 hover:text-white transition-colors shrink-0 ${collapsed ? 'hidden' : ''}`}
            title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Botão expandir (só visível quando recolhido) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex justify-center py-3 text-white/50 hover:text-white transition-colors border-b border-white/10"
            title="Expandir sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'} ${
                  isActive
                    ? 'bg-[#219ebc] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}

          <NavLink
            to="/chat/ai"
            title={collapsed ? 'IA Professora' : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'} ${
                isActive
                  ? 'bg-[#219ebc] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            {!collapsed && 'IA Professora'}
          </NavLink>

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              title={collapsed ? 'Admin' : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'} ${
                  isActive
                    ? 'bg-[#ffb703] text-[#023047]'
                    : 'text-[#ffb703]/80 hover:bg-white/10 hover:text-[#ffb703]'
                }`
              }
            >
              <Shield className="w-5 h-5 shrink-0" />
              {!collapsed && 'Admin'}
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div className={`py-4 border-t border-white/10 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className={`flex items-center py-2 mb-2 ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}>
            <div
              className="w-8 h-8 rounded-full bg-[#219ebc] flex items-center justify-center text-sm font-bold shrink-0"
              title={collapsed ? (user?.fullName || '') : undefined}
            >
              {user?.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-white/50 truncate">{user?.nativeLanguage} → {user?.learningLanguage}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
            className={`flex items-center rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full ${collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* ── Bottom nav mobile (visível em <md) ──────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#023047] border-t border-white/10 flex items-center justify-around px-2 py-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-0 ${
                isActive ? 'text-[#8ecae6]' : 'text-white/50 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="truncate max-w-[48px] text-center">{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/chat/ai"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#8ecae6]' : 'text-white/50 hover:text-white'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span>IA</span>
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#ffb703]' : 'text-[#ffb703]/50 hover:text-[#ffb703]'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </>
  )
}
