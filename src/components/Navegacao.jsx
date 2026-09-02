import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import Estrela from './Estrela'
import { scrollToSection } from '../hooks/useSmoothScroll'

const links = [
  { rotulo: 'Vitrine', hash: '#vitrine' },
  { rotulo: 'Quem somos', hash: '#manifesto' },
  { rotulo: 'Vender peça', hash: '#rodape' },
  { rotulo: 'Visitar loja', hash: '#rodape' },
]

export default function Navegacao() {
  const [aberto, setAberto] = useState(false)
  const [descolado, setDescolado] = useState(false)

  useEffect(() => {
    const aoRolar = () => setDescolado(window.scrollY > 80)
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Trava a rolagem do Lenis enquanto o menu está aberto.
  useEffect(() => {
    if (!window.__lenis) return
    aberto ? window.__lenis.stop() : window.__lenis.start()
  }, [aberto])

  const irPara = (hash) => {
    setAberto(false)
    setTimeout(() => scrollToSection(hash), 320)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-loba ${
          descolado ? 'backdrop-blur-xl' : ''
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 transition-colors duration-500 md:px-12 ${
            descolado ? 'bg-breu/55' : 'bg-transparent'
          }`}
        >
          <a href="#topo" className="flex items-baseline gap-3" data-cursor="Início">
            <span className="font-display text-2xl leading-none tracking-tight text-osso">LOBAS</span>
            <Estrela className="h-3 w-3 self-center" />
            <span className="font-stencil text-[0.65rem] tracking-[0.5em] text-osso/60">BRECHÓ</span>
          </a>

          <nav className="hidden items-center gap-10 lg:flex">
            {links.map((l) => (
              <button
                key={l.rotulo}
                onClick={() => irPara(l.hash)}
                className="group relative font-corpo text-sm text-osso/70 transition-colors hover:text-osso"
              >
                {l.rotulo}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-sangue transition-all duration-500 ease-loba group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              className="flex items-center gap-2 text-osso/70 transition-colors hover:text-osso"
              data-cursor="Sacola"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="font-stencil text-xs tracking-[0.25em]">02</span>
            </button>

            <button
              onClick={() => setAberto((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={aberto}
            >
              <motion.span
                animate={aberto ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className="block h-px w-7 bg-osso"
              />
              <motion.span
                animate={aberto ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className="block h-px w-7 bg-osso"
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-breu/95 px-8 backdrop-blur-2xl"
          >
            {links.map((l, i) => (
              <motion.button
                key={l.rotulo}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 220, damping: 24 }}
                onClick={() => irPara(l.hash)}
                className="border-b border-osso/10 py-6 text-left font-display text-5xl uppercase text-osso"
              >
                {l.rotulo}
              </motion.button>
            ))}
            <p className="mt-10 font-corpo text-sm text-osso/50">
              Rua Aurora, 214 — aberto de quarta a sábado, 12h às 20h.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
