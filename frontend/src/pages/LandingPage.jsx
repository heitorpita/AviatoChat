import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Video, MessageCircle, Globe, Zap, Users, Languages } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ecae6] via-[#219ebc] to-[#023047]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-8 h-8 text-white" />
          <span className="text-white text-2xl font-bold">AviatoChat</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold">
              Cadastrar Grátis
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Conecte-se além das línguas,<br />
          <span className="text-[#ffb703]">Aprenda enquanto conversa</span>
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Pratique idiomas com falantes nativos do mundo todo.
          Mensagens em tempo real, chamadas de vídeo e muito mais.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup">
            <Button size="lg" className="bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold">
              Começar Grátis
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" className="border-white text-white hover:bg-white/20">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tudo que você precisa para se conectar
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard icon={<MessageCircle className="w-10 h-10" />} title="Mensagens em Tempo Real" description="Chat instantâneo com indicador de digitação e confirmação de leitura." />
          <FeatureCard icon={<Video className="w-10 h-10" />} title="Chamadas de Vídeo HD" description="Pratique a fala com chamadas 1-a-1 via WebRTC diretamente no browser." />
          <FeatureCard icon={<Languages className="w-10 h-10" />} title="Troca de Idiomas" description="Conecte-se com quem fala o idioma que você quer aprender nativamente." />
          <FeatureCard icon={<Users className="w-10 h-10" />} title="Parceiros Compatíveis" description="Sistema de match por idioma: você ensina o seu, aprende o deles." />
          <FeatureCard icon={<Zap className="w-10 h-10" />} title="Super Rápido" description="Tecnologia de ponta para comunicação em tempo real sem travamentos." />
          <FeatureCard icon={<Globe className="w-10 h-10" />} title="Comunidade Global" description="Usuários de mais de 150 países, falando dezenas de idiomas." />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para quebrar as barreiras?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de aprendizes de idiomas ao redor do mundo.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#ffb703] hover:bg-[#fb8500] text-[#023047] font-semibold">
              Começar Agora →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
      <div className="text-[#ffb703] mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  )
}
