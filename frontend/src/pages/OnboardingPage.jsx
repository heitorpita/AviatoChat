import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe, AlertCircle } from 'lucide-react'
import { onboard } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

const LANGUAGES = [
  'Inglês', 'Português', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Japonês', 'Mandarim', 'Coreano', 'Árabe',
  'Russo', 'Hindi', 'Holandês', 'Polonês', 'Turco',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setAuth, user, token } = useAuthStore()
  const [form, setForm] = useState({
    nativeLanguage: user?.nativeLanguage || '',
    learningLanguage: user?.learningLanguage || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || '',
    location: user?.location || '',
  })

  const mutation = useMutation({
    mutationFn: () => onboard(form),
    onSuccess: ({ data }) => {
      setAuth(data.usuario, token)
      navigate('/home')
    },
  })

  function set(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: typeof value === 'string' ? value : value.target.value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe className="w-10 h-10 text-white" />
          <span className="text-white text-3xl font-bold">AviatoChat</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#023047] mb-1">Configure seu perfil</h1>
          <p className="text-[#219ebc] mb-6">Conte-nos sobre você para encontrar parceiros ideais</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idioma Nativo</Label>
                <Select value={form.nativeLanguage} onValueChange={set('nativeLanguage')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idioma que Aprende</Label>
                <Select value={form.learningLanguage} onValueChange={set('learningLanguage')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={set('bio')}
                placeholder="Fale um pouco sobre você..."
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div>
              <Label htmlFor="profilePic">URL da Foto de Perfil</Label>
              <Input id="profilePic" type="url" placeholder="https://..." value={form.profilePic} onChange={set('profilePic')} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input id="location" type="text" placeholder="São Paulo, Brasil" value={form.location} onChange={set('location')} className="mt-1" />
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {mutation.error?.response?.data?.mensagem || 'Erro ao salvar perfil.'}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold"
              disabled={mutation.isPending || !form.nativeLanguage || !form.learningLanguage}
            >
              {mutation.isPending ? 'Salvando...' : 'Concluir configuração →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
