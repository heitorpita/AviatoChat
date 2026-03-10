import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047] flex items-center justify-center text-center p-4">
      <div>
        <p className="text-8xl font-bold text-white mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Página não encontrada</h1>
        <p className="text-white/80 mb-8">A página que você procura não existe.</p>
        <Link to="/home">
          <Button className="bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  )
}
