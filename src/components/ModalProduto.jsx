import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import BotaoMagnetico from './BotaoMagnetico'

export default function ModalProduto({ produto, onFechar }) {
  // Esc fecha e a rolagem de fundo para enquanto o modal está aberto.
  useEffect(() => {
    if (!produto) return
    const aoTeclar = (e) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', aoTeclar)
    window.__lenis?.stop()
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      window.__lenis?.start()
    }
  }, [produto, onFechar])

  return (
    <AnimatePresence>
      {produto && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-end justify-center p-0 md:items-center md:p-8"
          initial="fechado"
          animate="aberto"
          exit="fechado"
        >
          <motion.button
            variants={{ fechado: { opacity: 0 }, aberto: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
            onClick={onFechar}
            aria-label="Fechar detalhes da peça"
            className="absolute inset-0 bg-breu/80 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={produto.nome}
            variants={{
              fechado: { y: 60, opacity: 0, scale: 0.97 },
              aberto: { y: 0, opacity: 1, scale: 1 },
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="relative grid max-h-[92svh] w-full max-w-5xl grid-cols-1 overflow-y-auto bg-[#0f0f0f] md:grid-cols-2"
          >
            <div
              className="min-h-[16rem] md:min-h-[32rem]"
              style={{
                background: `radial-gradient(120% 90% at 35% 25%, ${produto.cor} 0%, #0b0b0b 80%)`,
              }}
            />

            <div className="flex flex-col justify-between p-8 md:p-12">
              <div>
                <p className="font-stencil text-xs tracking-[0.4em] text-sangue">{produto.id}</p>
                <h2 className="mt-3 font-display text-4xl uppercase leading-none text-osso md:text-5xl">
                  {produto.nome}
                </h2>
                <p className="mt-4 max-w-[42ch] font-corpo text-sm leading-relaxed text-osso/60">
                  {produto.historia}
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-y-5 border-t border-osso/12 pt-6 font-corpo text-sm">
                  <div>
                    <dt className="text-osso/40">Tamanho</dt>
                    <dd className="mt-1 text-osso">{produto.tamanho}</dd>
                  </div>
                  <div>
                    <dt className="text-osso/40">Estado</dt>
                    <dd className="mt-1 text-osso">{produto.estado}</dd>
                  </div>
                  <div>
                    <dt className="text-osso/40">Disponibilidade</dt>
                    <dd className="mt-1 text-osso">Peça única</dd>
                  </div>
                  <div>
                    <dt className="text-osso/40">Preço</dt>
                    <dd className="mt-1 font-stencil text-2xl text-sangue">R$ {produto.preco}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-10">
                <BotaoMagnetico href="#" onClick={(e) => e.preventDefault()}>
                  COLOCAR NA SACOLA
                </BotaoMagnetico>
                <p className="mt-4 font-corpo text-xs text-osso/40">
                  Reservamos por 24h. Provar na loja é grátis.
                </p>
              </div>
            </div>

            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center bg-breu/60 text-osso transition-colors hover:bg-sangue"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
