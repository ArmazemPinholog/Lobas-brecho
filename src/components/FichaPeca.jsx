import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Check } from 'lucide-react'
import BrilhoOlhos from './BrilhoOlhos'
import { urlArquivo, precoVigente, emPromocao, dinheiro } from '../lib/supabase'
import { useCarrinho, mensagemPeca } from '../lib/carrinho'
import { useSite, linkWhats } from '../lib/site'

export default function FichaPeca({ peca, onFechar }) {
  const [fotoAtiva, setFotoAtiva] = useState(0)
  const { adicionar, contem } = useCarrinho()
  const { config } = useSite()

  useEffect(() => {
    setFotoAtiva(0)
    if (!peca) return
    const aoTeclar = (e) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', aoTeclar)
    window.__lenis?.stop()
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      window.__lenis?.start()
    }
  }, [peca, onFechar])

  if (!peca) return <AnimatePresence />

  const fotos = peca.peca_fotos || []
  const vendida = peca.status === 'vendida'
  const naSacola = contem(peca.id)
  const linkDuvida = linkWhats(config.whatsapp, mensagemPeca(peca))

  const ficha = [
    ['Tamanho', peca.tamanho],
    ['Estado', peca.estado],
    ['Categoria', peca.categoria],
    ['Medidas', peca.medidas],
  ].filter(([, v]) => v)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[65] flex items-end justify-center md:items-center md:p-8"
        initial="fechado" animate="aberto" exit="fechado"
      >
        <motion.button
          variants={{ fechado: { opacity: 0 }, aberto: { opacity: 1 } }}
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute inset-0 bg-breu/80 backdrop-blur-md"
        />

        <motion.div
          role="dialog" aria-modal="true" aria-label={peca.nome}
          variants={{ fechado: { y: 60, opacity: 0, scale: 0.97 }, aberto: { y: 0, opacity: 1, scale: 1 } }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="relative grid max-h-[92svh] w-full max-w-5xl grid-cols-1 overflow-y-auto bg-[#0f0f0f] md:grid-cols-2"
        >
          {/* Galeria */}
          <div className="relative">
            {fotos.length ? (
              <>
                <img
                  src={urlArquivo(fotos[fotoAtiva].caminho)}
                  alt={fotos[fotoAtiva].alt || peca.nome}
                  className={`h-full max-h-[52svh] w-full object-cover md:max-h-none ${vendida ? 'grayscale' : ''}`}
                />
                {fotos.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-breu/80 p-3">
                    {fotos.map((f, i) => (
                      <button
                        key={f.caminho}
                        onClick={() => setFotoAtiva(i)}
                        aria-label={`Foto ${i + 1}`}
                        className={`h-14 w-12 shrink-0 overflow-hidden border transition-colors ${i === fotoAtiva ? 'border-sangue' : 'border-transparent opacity-60'}`}
                      >
                        <img src={urlArquivo(f.caminho)} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="min-h-[16rem] md:min-h-[32rem]"
                style={{ background: `radial-gradient(120% 90% at 35% 25%, ${peca.cor_hex || '#1a1a1a'} 0%, #0b0b0b 80%)` }}
              />
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col justify-between p-8 md:p-12">
            <div>
              <p className="font-stencil text-xs tracking-[0.4em] text-sangue">{peca.codigo}</p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-none text-osso md:text-5xl">{peca.nome}</h2>
              {peca.detalhe && <p className="mt-2 text-sm text-osso/50">{peca.detalhe}</p>}
              {peca.historia && (
                <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-osso/60">{peca.historia}</p>
              )}

              {ficha.length > 0 && (
                <dl className="mt-8 grid grid-cols-2 gap-y-5 border-t border-osso/10 pt-6 text-sm">
                  {ficha.map(([r, v]) => (
                    <div key={r}>
                      <dt className="text-osso/40">{r}</dt>
                      <dd className="mt-1 text-osso">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-8 flex items-baseline gap-3">
                {emPromocao(peca) && <span className="text-osso/35 line-through">{dinheiro(peca.preco)}</span>}
                <span className="font-display text-4xl text-sangue">{dinheiro(precoVigente(peca))}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {vendida ? (
                <p className="border border-osso/15 py-4 text-center font-stencil text-sm tracking-[0.3em] text-osso/40">
                  PEÇA JÁ VENDIDA
                </p>
              ) : (
                <button
                  onClick={() => adicionar(peca)}
                  disabled={naSacola || !config.vendas_ativas}
                  className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden py-4 font-stencil text-sm tracking-[0.35em] transition-colors ${
                    naSacola ? 'border border-osso/20 text-osso/40' : 'bg-sangue text-osso hover:bg-osso hover:text-breu'
                  }`}
                >
                  {!naSacola && <BrilhoOlhos />}
                  <span className="relative z-10 flex items-center gap-2">
                    {naSacola ? <><Check size={16} strokeWidth={2} /> NA SACOLA</> : 'COLOCAR NA SACOLA'}
                  </span>
                </button>
              )}

              {linkDuvida && (
                <a
                  href={linkDuvida}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 border border-osso/25 py-4 font-stencil text-sm tracking-[0.3em] text-osso transition-colors hover:border-sangue hover:text-sangue"
                >
                  <MessageCircle size={16} strokeWidth={1.5} /> TIRAR DÚVIDA
                </a>
              )}

              <p className="text-center text-xs text-osso/35">Peça única. Pagamento e entrega pelo WhatsApp.</p>
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
    </AnimatePresence>
  )
}
