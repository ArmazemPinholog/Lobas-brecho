import { Clock, MapPin, MessageCircle, RefreshCw, MessageCircleQuestion } from 'lucide-react'
import { useSite, linkWhats } from '../lib/site'
import { useTitulo } from '../hooks/useTitulo'

const BLOCOS = [
  { icone: Clock, titulo: 'como.garimpo_titulo', texto: 'como.garimpo_texto' },
  { icone: MapPin, titulo: 'como.entrega_titulo', texto: 'como.entrega_texto' },
  { icone: MessageCircle, titulo: 'como.pagamento_titulo', texto: 'como.pagamento_texto' },
  { icone: RefreshCw, titulo: 'como.troca_titulo', texto: 'como.troca_texto' },
]

/**
 * Página pública com as regras do brechó — garimpo/reserva, entrega,
 * pagamento e troca. Todo texto vem do painel (textos.grupo = "Como funciona"),
 * então as sócias editam sem depender de código.
 */
export default function ComoFunciona() {
  const { texto, config } = useSite()
  useTitulo('Como funciona', 'Garimpo, reserva, entrega, pagamento e troca — as regras da Lobas Brechó.')
  const linkDuvida = linkWhats(config.whatsapp, 'Oi! Fiquei com uma dúvida sobre como funciona o brechó.')

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-28 pt-40 md:px-12 md:pb-40 md:pt-48">
      <div className="max-w-[42ch]">
        <p className="font-stencil text-sm tracking-[0.45em] text-sangue">GUIA RÁPIDO</p>
        <h1 className="mt-4 font-display uppercase leading-[0.86] text-osso text-[13vw] md:text-[6vw]">
          {texto('como.titulo')}
        </h1>
        {texto('como.texto') && (
          <p className="mt-6 text-base leading-relaxed text-osso/65">{texto('como.texto')}</p>
        )}
      </div>

      <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
        {BLOCOS.map(({ icone: Icone, titulo, texto: chaveTexto }, i) => (
          <div key={titulo} className="border-l border-sangue/60 pl-6">
            <div className="flex items-center gap-3 text-sangue">
              <Icone size={18} strokeWidth={1.5} />
              <span className="font-stencil text-xs tracking-[0.3em] text-osso/30">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl uppercase leading-tight text-osso md:text-3xl">
              {texto(titulo)}
            </h2>
            <p className="mt-3 max-w-[46ch] whitespace-pre-line text-sm leading-relaxed text-osso/60">
              {texto(chaveTexto)}
            </p>
          </div>
        ))}
      </div>

      {linkDuvida && (
        <div className="mt-20 flex flex-col items-start gap-4 border-t border-osso/10 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-osso/50">Ainda ficou com dúvida sobre alguma regra?</p>
          <a
            href={linkDuvida}
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-2 overflow-hidden border border-osso/25 px-6 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:border-sangue hover:text-sangue"
          >
            <MessageCircleQuestion size={15} strokeWidth={1.5} />
            PERGUNTAR NO WHATSAPP
          </a>
        </div>
      )}
    </section>
  )
}
