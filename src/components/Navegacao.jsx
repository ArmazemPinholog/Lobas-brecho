import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram } from 'lucide-react'
import Estrela from './Estrela'
import { useCarrinho } from '../lib/carrinho'
import { useSite } from '../lib/site'
import { useAuth } from '../lib/auth'

const links = [
  { rotulo: 'Acervo', para: '/acervo' },
  { rotulo: 'Closet', para: '/closet' },
  { rotulo: 'Blog', para: '/blog' },
  { rotulo: 'Como funciona', para: '/como-funciona' },
]

export default function Navegacao() {
  const [aberto, setAberto] = useState(false)
  const [descolado, setDescolado] = useState(false)
  const { itens, setAberto: abrirSacola } = useCarrinho()
  const { config } = useSite()
  const { sessao } = useAuth()
  // Já logada, vai direto pro painel — senão, pro login. Um item só,
  // o destino é que muda.
  const admLink = { rotulo: 'ADMS', para: sessao ? '/admin' : '/entrar' }

  useEffect(() => {
    const aoRolar = () => setDescolado(window.scrollY > 80)
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  useEffect(() => {
    if (!window.__lenis) return
    aberto ? window.__lenis.stop() : window.__lenis.start()
  }, [aberto])

  const estilo = ({ isActive }) =>
    `group relative text-sm transition-colors ${isActive ? 'text-osso' : 'text-osso/60 hover:text-osso'}`

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${descolado ? 'backdrop-blur-xl' : ''}`}>
        <div className={`mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 transition-colors duration-500 md:px-12 ${descolado ? 'bg-breu/55' : ''}`}>
          <Link to="/" className="flex items-baseline gap-3" data-cursor="Início">
            <span className="font-display text-2xl leading-none text-osso">LOBAS</span>
            <Estrela className="h-3 w-3 self-center" />
            <span className="font-stencil text-[0.65rem] tracking-[0.5em] text-osso/60">BRECHÓ</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {links.map((l) => (
              <NavLink key={l.para} to={l.para} className={estilo}>
                {l.rotulo}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-sangue transition-all duration-500 ease-loba group-hover:w-full" />
              </NavLink>
            ))}
            <NavLink
              to={admLink.para}
              className="group relative font-stencil text-xs tracking-[0.3em] text-sangue/70 transition-colors hover:text-sangue"
            >
              {admLink.rotulo}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-sangue transition-all duration-500 ease-loba group-hover:w-full" />
            </NavLink>
          </nav>

          <div className="flex items-center gap-5">
            {config.instagram && (
              <a
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                data-cursor="Instagram"
                className="text-osso/70 transition-colors hover:text-sangue"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
            )}

            <button
              onClick={() => abrirSacola(true)}
              className="flex items-center gap-2 text-osso/70 transition-colors hover:text-osso"
              data-cursor="Sacola"
              aria-label={`Abrir sacola com ${itens.length} peças`}
            >
              {/* A loba da marca no lugar do ícone genérico de sacola —
                  altura um pouco maior que um ícone comum porque é uma foto,
                  não um traço simples; precisa desse tanto pra continuar
                  legível nesse tamanho. */}
              <img src="/brand/loba-sacola.png" alt="" aria-hidden="true" className="h-11 w-auto object-contain" />
              <span className="font-stencil text-xs tracking-[0.25em]">
                {String(itens.length).padStart(2, '0')}
              </span>
            </button>

            <button
              onClick={() => setAberto((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={aberto}
            >
              <motion.span animate={aberto ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="block h-px w-7 bg-osso" />
              <motion.span animate={aberto ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="block h-px w-7 bg-osso" />
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
              <motion.div
                key={l.para}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 220, damping: 24 }}
              >
                <Link
                  to={l.para}
                  onClick={() => setAberto(false)}
                  className="block border-b border-osso/10 py-6 font-display text-5xl uppercase text-osso"
                >
                  {l.rotulo}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + links.length * 0.08, type: 'spring', stiffness: 220, damping: 24 }}
            >
              <Link
                to={admLink.para}
                onClick={() => setAberto(false)}
                className="block border-b border-osso/10 py-6 font-display text-5xl uppercase text-sangue"
              >
                {admLink.rotulo}
              </Link>
            </motion.div>

            {config.endereco && <p className="mt-10 text-sm text-osso/50">{config.endereco}</p>}
            {config.horario && <p className="mt-1 text-sm text-osso/40">{config.horario}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
