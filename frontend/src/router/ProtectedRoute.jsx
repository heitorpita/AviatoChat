import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />
  if (!user.isOnboarded) return <Navigate to="/onboarding" replace />

  return children
}
