import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signup } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await signup(form)
      setAuth(data.usuario, data.token)
      toast.success('Conta criada! Complete seu perfil.')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="AviatoChat" className="w-14 h-14 mb-3" />
          <h1 className="text-3xl font-extrabold text-brand-amber">AviatoChat</h1>
          <p className="text-brand-sky mt-1 text-sm">Crie sua conta grátis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-brand-teal/20 rounded-2xl p-8 space-y-5">
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
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
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-brand-sky text-sm mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand-teal hover:text-brand-sky font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
