import { Link } from 'react-router-dom'
import { Plane, Globe, Video, MessageCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'

const features = [
  { icon: Globe, title: 'Troca de Idiomas', desc: 'Conecte-se com falantes nativos do idioma que você quer aprender.' },
  { icon: MessageCircle, title: 'Chat em Tempo Real', desc: 'Mensagens instantâneas com indicador de digitação e confirmação de leitura.' },
  { icon: Video, title: 'Videochamada P2P', desc: 'Chamadas de vídeo diretamente no navegador, sem custo e sem limite.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-brand-teal/15 glass animate-fade-in sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="AviatoChat" className="w-8 h-8" />
          <span className="text-xl font-bold text-gradient-amber" style={{ fontFamily: 'Syne, sans-serif' }}>AviatoChat</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Cadastrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-28 max-w-4xl mx-auto">
        <div className="mb-8 p-5 rounded-full bg-brand-teal/15 inline-flex ring-1 ring-brand-teal/30 animate-float glow-teal-sm">
          <Plane size={52} className="text-brand-amber" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-none mb-6 animate-fade-up delay-100">
          Aprenda idiomas<br />
          <span className="text-gradient-amber">conversando de verdade</span>
        </h1>
        <p className="text-brand-sky/75 text-xl max-w-2xl mb-10 font-light animate-fade-up delay-200">
          Encontre parceiros de troca de idiomas, converse por chat ou videochamada e evolua de forma natural e gratuita.
        </p>
        <div className="flex gap-4 flex-wrap justify-center animate-fade-up delay-300">
          <Link to="/signup">
            <Button variant="primary" size="lg">Começar agora</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="lg">Já tenho conta</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14 text-gradient-teal animate-fade-up delay-400">Por que AviatoChat?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="glass-light rounded-2xl p-7 card-lift animate-fade-up"
              style={{ animationDelay: `${500 + i * 120}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-teal/15 ring-1 ring-brand-teal/30 flex items-center justify-center mb-5">
                <Icon size={22} className="text-brand-teal" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-brand-sky/65 text-sm leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center py-20 animate-fade-up delay-700">
        <hr className="signal-line max-w-md mx-auto mb-14" />
        <p className="text-brand-sky/50 mb-6 text-xs tracking-widest uppercase font-semibold">Pronto para decolar?</p>
        <Link to="/signup">
          <Button variant="amber" size="lg">Criar conta grátis</Button>
        </Link>
      </section>
    </div>
  )
}
