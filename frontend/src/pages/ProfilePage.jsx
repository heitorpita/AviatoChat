import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { onboard } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Avatar } from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const LANGUAGES = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Japonês', 'Mandarim', 'Árabe', 'Russo',
  'Coreano', 'Hindi', 'Turco', 'Holandês', 'Polonês',
]

export default function ProfilePage() {
  const { usuario, updateUsuario } = useAuthStore()
  const [form, setForm] = useState({
    fullName: usuario?.fullName || '',
    bio: usuario?.bio || '',
    nativeLanguage: usuario?.nativeLanguage || '',
    learningLanguage: usuario?.learningLanguage || '',
    location: usuario?.location || '',
    profilePic: usuario?.profilePic || '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const save = useMutation({
    mutationFn: () => onboard(form),
    onSuccess: ({ data }) => {
      updateUsuario(data.usuario)
      toast.success('Perfil atualizado!')
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao salvar'),
  })

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Meu perfil</h1>

      <div className="flex items-center gap-5 mb-8">
        <Avatar usuario={{ ...usuario, ...form }} size="xl" />
        <div>
          <p className="text-white font-bold text-lg">{form.fullName || usuario?.fullName}</p>
          <p className="text-brand-sky text-sm">{form.nativeLanguage} → {form.learningLanguage}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-brand-teal/20 rounded-2xl p-6 space-y-5">
        <Input label="Nome completo" value={form.fullName} onChange={set('fullName')} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-sky">Biografia</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white placeholder-brand-sky/50 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-sky">Idioma nativo</label>
            <select value={form.nativeLanguage} onChange={set('nativeLanguage')}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white focus:outline-none focus:border-brand-teal transition-colors">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-sky">Aprendendo</label>
            <select value={form.learningLanguage} onChange={set('learningLanguage')}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white focus:outline-none focus:border-brand-teal transition-colors">
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <Input label="Localização" value={form.location} onChange={set('location')} placeholder="Cidade, País" />
        <Input label="URL da foto de perfil" value={form.profilePic} onChange={set('profilePic')} type="url" placeholder="https://..." />

        <Button variant="secondary" onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
          <Save size={16} />
          {save.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}
