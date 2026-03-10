import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Mail, Lock, AlertCircle } from 'lucide-react'
import { login } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: ({ data }) => {
      setAuth(data.usuario, data.token)
      navigate(data.usuario.isOnboarded ? '/home' : '/onboarding')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe className="w-10 h-10 text-white" />
          <span className="text-white text-3xl font-bold">AviatoChat</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-[#023047] mb-1">Bem-vindo de volta</h1>
          <p className="text-[#219ebc] mb-6">Entre para continuar sua jornada</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-[#219ebc]" />
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-[#219ebc]" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {mutation.error?.response?.data?.mensagem || 'Erro ao entrar. Verifique suas credenciais.'}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#023047] hover:bg-[#219ebc]" disabled={mutation.isPending}>
              {mutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-[#023047]">
              Não tem conta?{' '}
              <Link to="/signup" className="text-[#219ebc] hover:text-[#023047] font-medium">
                Cadastre-se grátis
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
