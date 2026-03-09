import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function ProtectedRoute() {
  const { token, usuario } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (!usuario?.isOnboarded) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
