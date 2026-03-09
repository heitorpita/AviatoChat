import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { Layout } from '../components/layout/Layout'

import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import OnboardingPage from '../pages/OnboardingPage'
import HomePage from '../pages/HomePage'
import FriendsPage from '../pages/FriendsPage'
import NotificationsPage from '../pages/NotificationsPage'
import ChatPage from '../pages/ChatPage'
import CallPage from '../pages/CallPage'
import ProfilePage from '../pages/ProfilePage'
import AdminPage from '../pages/AdminPage'
import NotFoundPage from '../pages/NotFoundPage'

// Guard para /onboarding: autenticado mas ainda NÃO onboarded
function OnboardingGuard() {
  const { token, usuario } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (usuario?.isOnboarded) return <Navigate to="/home" replace />
  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Onboarding: auth sem isOnboarded */}
      <Route element={<OnboardingGuard />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Requer auth + isOnboarded */}
      <Route element={<ProtectedRoute />}>
        {/* Com sidebar */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
        {/* Sem sidebar (tela cheia) */}
        <Route path="/chat/:friendId" element={<ChatPage />} />
        <Route path="/call/:friendId" element={<CallPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
