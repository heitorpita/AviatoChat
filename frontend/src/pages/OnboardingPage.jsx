import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import { onboard } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const LANGUAGES = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Japonês', 'Mandarim', 'Árabe', 'Russo',
  'Coreano', 'Hindi', 'Turco', 'Holandês', 'Polonês',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const updateUsuario = useAuthStore((s) => s.updateUsuario)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    nativeLanguage: '',
    learningLanguage: '',
    location: '',
    profilePic: '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.nativeLanguage === form.learningLanguage) {
      return toast.error('Idioma nativo e idioma de aprendizado devem ser diferentes.')
    }
    setLoading(true)
    try {
      const { data } = await onboard(form)
      updateUsuario(data.usuario)
      toast.success('Perfil configurado! Bem-vindo ao AviatoChat.')
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-amber/20 flex items-center justify-center mb-3">
            <Plane size={32} className="text-brand-amber" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Complete seu perfil</h1>
          <p className="text-brand-sky text-sm mt-1">Para encontrar os melhores parceiros de idioma</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-brand-teal/20 rounded-2xl p-8 space-y-5">
          <Input label="Nome completo" placeholder="Seu nome" value={form.fullName} onChange={set('fullName')} required />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-sky">Biografia</label>
            <textarea
              rows={3}
              placeholder="Conte um pouco sobre você..."
              value={form.bio}
              onChange={set('bio')}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white placeholder-brand-sky/50 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-sky">Idioma nativo</label>
              <select
                value={form.nativeLanguage}
                onChange={set('nativeLanguage')}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white focus:outline-none focus:border-brand-teal transition-colors"
              >
                <option value="">Selecione</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-sky">Aprendendo</label>
              <select
                value={form.learningLanguage}
                onChange={set('learningLanguage')}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-navy/60 border border-brand-teal/40 text-white focus:outline-none focus:border-brand-teal transition-colors"
              >
                <option value="">Selecione</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <Input label="Localização" placeholder="Cidade, País" value={form.location} onChange={set('location')} />
          <Input label="URL da foto de perfil" placeholder="https://..." type="url" value={form.profilePic} onChange={set('profilePic')} />

          <Button type="submit" variant="amber" className="w-full" disabled={loading}>
            {loading ? 'Salvando…' : 'Pronto para decolar ✈️'}
          </Button>
        </form>
      </div>
    </div>
  )
}
