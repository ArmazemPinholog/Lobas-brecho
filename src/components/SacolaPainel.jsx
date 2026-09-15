import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { useCarrinho, mensagemPedido } from '../lib/carrinho'
import { useSite, linkWhats } from '../lib/site'
import { dinheiro } from '../lib/supabase'

export default function SacolaPainel() {
  const { itens, remover, limpar, total, aberto, setAberto } = useCarrinho()
  const { config } = useSite()

  const link = linkWhats(config.whatsapp, mensagemPedido(itens, total))

  return (
    <AnimatePresence>
      {aberto && (
        <motion.aside className="fixed inset-0 z-[66] flex justify-end" initial="fechado" animate="aberto" exit="fechado">
          <motion.button
            variants={{ fechado: { opacity: 0 }, aberto: { opacity: 1 } }}
            onClick={() => setAberto(false)}
            aria-label="Fechar sacola"
            className="absolute inset-0 bg-breu/80 backdrop-blur-md"
          />

          <motion.div
            variants={{ fechado: { x: '100%' }, aberto: { x: 0 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative flex h-full w-full max-w-md flex-col bg-[#0f0f0f]"
            role="dialog"
            aria-label="Sacola"
          >
            <header className="flex items-center justify-between border-b border-osso/10 px-7 py-6">
              <h2 className="font-display text-2xl uppercase text-osso">Sacola</h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar" className="text-osso/60 hover:text-osso">
                <X size={20} strokeWidth={1.5} />
              </button>
            </header>

            {itens.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">SACOLA VAZIA</p>
                <p className="text-sm text-osso/40">As peças que você escolher aparecem aqui.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-7 py-6">
                {itens.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-4 border-b border-osso/10 py-4">
                    <div>
                      <p className="font-stencil text-xs tracking-[0.3em] text-sangue">{i.codigo}</p>
                      <p className="mt-1 text-osso">{i.nome}</p>
                      {i.tamanho && <p className="text-sm text-osso/40">tam {i.tamanho}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="font-stencil text-lg text-osso">{dinheiro(i.preco)}</span>
                      <button onClick={() => remover(i.id)} aria-label={`Remover ${i.nome}`} className="text-osso/30 transition-colors hover:text-sangue">
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={limpar} className="mt-5 text-xs text-osso/30 underline underline-offset-4 hover:text-osso/60">
                  esvaziar sacola
                </button>
              </div>
            )}

            <footer className="border-t border-osso/10 px-7 py-6">
              <div className="flex items-baseline justify-between">
                <span className="font-stencil text-xs tracking-[0.3em] text-osso/50">TOTAL DAS PEÇAS</span>
                <span className="font-display text-3xl text-osso">{dinheiro(total)}</span>
              </div>

              {(config.entrega_local || config.entrega_correios) && (
                <div className="mt-4 space-y-1 text-xs leading-relaxed text-osso/40">
                  {config.entrega_local && <p>{config.entrega_local}</p>}
                  {config.entrega_correios && <p>{config.entrega_correios}</p>}
                </div>
              )}

              {/* O pedido não fecha aqui: vai pronto para a conversa. */}
              {link && itens.length > 0 && config.vendas_ativas ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAberto(false)}
                  className="mt-6 block bg-sangue py-4 text-center font-stencil text-sm tracking-[0.35em] text-osso transition-colors hover:bg-osso hover:text-breu"
                >
                  FECHAR NO WHATSAPP
                </a>
              ) : (
                <p className="mt-6 border border-osso/15 py-4 text-center font-stencil text-xs tracking-[0.3em] text-osso/30">
                  {itens.length === 0
                    ? 'ESCOLHA UMA PEÇA'
                    : !config.vendas_ativas
                    ? 'VENDAS PAUSADAS'
                    : 'WHATSAPP NÃO CONFIGURADO'}
                </p>
              )}

              <p className="mt-3 text-center text-xs text-osso/30">
                O pagamento e a entrega são combinados na conversa.
              </p>
            </footer>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
