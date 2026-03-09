import { useSocketStore } from '../../store/socket.store'

export function Avatar({ usuario, size = 'md', showOnline = false }) {
  const onlineUsers = useSocketStore((s) => s.onlineUsers)
  const isOnline = showOnline && onlineUsers.includes(usuario?.id)

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  }

  const initials = usuario?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="relative inline-block">
      {usuario?.profilePic ? (
        <img
          src={usuario.profilePic}
          alt={usuario.fullName}
          className={`${sizes[size]} rounded-full object-cover border-2 border-brand-teal`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-brand-teal flex items-center justify-center font-semibold text-white border-2 border-brand-sky`}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-brand-navy rounded-full" />
      )}
    </div>
  )
}
