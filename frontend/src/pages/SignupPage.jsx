import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { signup } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })

  const mutation = useMutation({
    mutationFn: () => signup(form),
    onSuccess: ({ data }) => {
      setAuth(data.usuario, data.token)
      navigate('/onboarding')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate()
  }

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe className="w-10 h-10 text-white" />
          <span className="text-white text-3xl font-bold">AviatoChat</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-[#023047] mb-1">Criar conta</h1>
          <p className="text-[#219ebc] mb-6">Comece sua jornada de idiomas hoje</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome completo</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-[#219ebc]" />
                <Input id="fullName" type="text" placeholder="João Silva" value={form.fullName} onChange={set('fullName')} className="pl-10" required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-[#219ebc]" />
                <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} className="pl-10" required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-[#219ebc]" />
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} className="pl-10" minLength={6} required />
              </div>
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {mutation.error?.response?.data?.mensagem || 'Erro ao criar conta. Tente novamente.'}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold" disabled={mutation.isPending}>
              {mutation.isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-[#023047]">
              Já tem conta?{' '}
              <Link to="/login" className="text-[#219ebc] hover:text-[#023047] font-medium">
                Entrar
              </Link>
            </p>
            <Link to="/" className="block text-sm text-[#219ebc] hover:text-[#023047]">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
