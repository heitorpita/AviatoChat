import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Check, Camera, Loader2 } from 'lucide-react'
import { onboard } from '@/api/auth.api'
import { uploadFile } from '@/api/upload.api'
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
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(user?.profilePic || null)
  const [uploading, setUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => onboard(data),
    onSuccess: ({ data }) => setAuth(data.usuario, token),
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

  const isPending = uploading || mutation.isPending

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

        <div className="bg-card rounded-xl border border-border p-6">
          {/* Avatar com upload */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <label className="relative cursor-pointer group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#219ebc] bg-[#219ebc] flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{user?.fullName?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <div>
              <p className="font-semibold text-foreground text-lg">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-[#219ebc] mt-0.5">Clique na foto para alterar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Button type="submit" className="bg-[#219ebc] hover:bg-[#023047] text-white" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar alterações'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
