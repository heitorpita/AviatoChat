import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Check } from 'lucide-react'
import { onboard } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

const LANGUAGES = [
  'Inglês', 'Português', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Japonês', 'Mandarim', 'Coreano', 'Árabe',
  'Russo', 'Hindi', 'Holandês', 'Polonês', 'Turco',
]

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore()
  const [form, setForm] = useState({
    nativeLanguage: user?.nativeLanguage || '',
    learningLanguage: user?.learningLanguage || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || '',
    location: user?.location || '',
  })

  const mutation = useMutation({
    mutationFn: () => onboard(form),
    onSuccess: ({ data }) => setAuth(data.usuario, token),
  })

  function set(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: typeof value === 'string' ? value : value.target.value }))
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

        <div className="bg-card rounded-xl border border-border p-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            {form.profilePic ? (
              <img src={form.profilePic} alt="Avatar" className="w-20 h-20 rounded-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#219ebc] flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground text-lg">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idioma Nativo</Label>
                <Select value={form.nativeLanguage} onValueChange={set('nativeLanguage')}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idioma que Aprende</Label>
                <Select value={form.learningLanguage} onValueChange={set('learningLanguage')}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea id="bio" value={form.bio} onChange={set('bio')} rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
            </div>

            <div>
              <Label htmlFor="profilePic">URL da Foto</Label>
              <Input id="profilePic" type="url" value={form.profilePic} onChange={set('profilePic')} className="mt-1" placeholder="https://..." />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input id="location" value={form.location} onChange={set('location')} className="mt-1" placeholder="São Paulo, Brasil" />
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Erro ao salvar perfil.
              </div>
            )}

            {mutation.isSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                <Check className="w-4 h-4 shrink-0" />
                Perfil atualizado com sucesso!
              </div>
            )}

            <Button type="submit" className="bg-[#219ebc] hover:bg-[#023047] text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
