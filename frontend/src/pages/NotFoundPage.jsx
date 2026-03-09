import { Link } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-center px-6">
      <Plane size={64} className="text-brand-amber mb-6 rotate-45" />
      <h1 className="text-8xl font-extrabold text-brand-amber mb-2">404</h1>
      <p className="text-2xl font-bold text-white mb-2">Página não encontrada</p>
      <p className="text-brand-sky mb-8">Parece que você foi longe demais…</p>
      <Link to="/home">
        <Button variant="primary">Voltar para Home</Button>
      </Link>
    </div>
  )
}
