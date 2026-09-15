import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlArquivo, precoVigente, emPromocao, dinheiro } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const areas = {
  alta:  'md:col-span-5 md:row-span-2 aspect-[3/4] md:aspect-auto md:min-h-[42rem]',
  media: 'md:col-span-4 aspect-[4/5] md:min-h-[20rem]',
  larga: 'md:col-span-7 aspect-[4/3] md:min-h-[20rem]',
}

/** Peça em destaque ocupa o card grande; o resto alterna para o bento não ficar simétrico. */
export function tamanhoCard(peca, indice) {
  if (peca.destaque) return 'alta'
  return indice % 3 === 2 ? 'larga' : 'media'
}

export default function CardPeca({ peca, indice, tamanho, onAbrir }) {
  const raiz = useRef(null)
  const tecido = useRef(null)

  const capa = peca.peca_fotos?.length ? urlArquivo(peca.peca_fotos[0].caminho) : null
  const vendida = peca.status === 'vendida'

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Paralaxe: a imagem é maior que o card e desliza mais devagar que a página.
      gsap.fromTo(tecido.current, { yPercent: -9 }, {
        yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, raiz)
    return () => ctx.revert()
  }, [capa])

  return (
    <motion.article
      ref={raiz}
      onClick={() => onAbrir(peca)}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: (indice % 3) * 0.08 }}
      className={`group relative cursor-pointer overflow-hidden bg-[#111] ${areas[tamanho]}`}
      data-cursor="Ver peça"
    >
      <div ref={tecido} className="absolute -inset-y-[12%] inset-x-0">
        {capa ? (
          <img
            src={capa}
            alt={peca.peca_fotos[0].alt || peca.nome}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-[900ms] ease-loba group-hover:scale-[1.07] ${vendida ? 'grayscale' : ''}`}
          />
        ) : (
          // Sem foto ainda: cor sólida da peça em vez de buraco branco.
          <div
            className="h-full w-full transition-transform duration-[900ms] ease-loba group-hover:scale-[1.07]"
            style={{ background: `radial-gradient(120% 90% at 30% 20%, ${peca.cor_hex || '#1a1a1a'}f2 0%, #0d0d0d 78%)` }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-breu/85 via-transparent to-transparent" />

      <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
        {peca.estado && (
          <span className="border border-osso/25 px-3 py-1 font-stencil text-[0.65rem] tracking-[0.25em] text-osso/80 backdrop-blur-sm">
            {peca.estado}
          </span>
        )}
        {emPromocao(peca) && !vendida && (
          <span className="bg-sangue px-3 py-1 font-stencil text-[0.65rem] tracking-[0.25em] text-osso">PROMO</span>
        )}
        {vendida && (
          <span className="bg-osso px-3 py-1 font-stencil text-[0.65rem] tracking-[0.25em] text-breu">VENDIDA</span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-7">
        <div>
          <h3 className="font-display text-2xl uppercase leading-none text-osso md:text-3xl">{peca.nome}</h3>
          <p className="mt-2 text-sm text-osso/55">
            {[peca.detalhe, peca.tamanho && `tam ${peca.tamanho}`].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {emPromocao(peca) && (
            <p className="text-xs text-osso/40 line-through">{dinheiro(peca.preco)}</p>
          )}
          <p className="font-stencil text-xl text-sangue">{dinheiro(precoVigente(peca))}</p>
        </div>
      </div>

      <span className="absolute bottom-0 left-0 z-10 h-[3px] w-0 bg-sangue transition-all duration-700 ease-loba group-hover:w-full" />
    </motion.article>
  )
}
