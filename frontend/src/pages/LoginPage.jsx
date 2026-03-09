import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(form)
      setAuth(data.usuario, data.token)
      toast.success('Bem-vindo de volta!')
      navigate(data.usuario.isOnboarded ? '/home' : '/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.svg" alt="AviatoChat" className="w-14 h-14 mb-4" />
          <h1 className="text-4xl font-extrabold text-gradient-amber">AviatoChat</h1>
          <p className="text-brand-sky/55 mt-2 text-sm tracking-wide">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-brand-sky/50 text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/signup" className="text-brand-teal hover:text-brand-sky font-semibold transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
