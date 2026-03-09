import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function AdminRoute() {
  const usuario = useAuthStore((s) => s.usuario)

  if (usuario?.role !== 'ADMIN') return <Navigate to="/home" replace />

  return <Outlet />
}
