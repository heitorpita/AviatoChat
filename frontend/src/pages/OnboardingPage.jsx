import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe, AlertCircle, Camera, Loader2 } from 'lucide-react'
import { onboard } from '@/api/auth.api'
import { uploadFile } from '@/api/upload.api'
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
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(user?.profilePic || null)
  const [uploading, setUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => onboard(data),
    onSuccess: ({ data }) => {
      setAuth(data.usuario, token)
      navigate('/home')
    },
  })

  function set(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: typeof value === 'string' ? value : value.target.value }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    let profilePic = form.profilePic
    if (selectedFile) {
      setUploading(true)
      try {
        profilePic = await uploadFile(selectedFile)
      } catch {
        // keep old value
      } finally {
        setUploading(false)
      }
    }
    mutation.mutate({ ...form, profilePic })
  }

  const initials = user?.fullName?.[0]?.toUpperCase() || '?'
  const isPending = uploading || mutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe className="w-10 h-10 text-white" />
          <span className="text-white text-3xl font-bold">AviatoChat</span>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#023047] mb-1">Configure seu perfil</h1>
          <p className="text-[#219ebc] mb-6">Conte-nos sobre você para encontrar parceiros ideais</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar com upload */}
            <div className="flex justify-center mb-2">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#8ecae6] bg-[#219ebc] flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="foto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs text-center text-muted-foreground -mt-2 mb-2">Clique para adicionar foto</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              disabled={isPending || !form.nativeLanguage || !form.learningLanguage}
            >
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Concluir configuração →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
