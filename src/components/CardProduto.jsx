import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Cada peso ocupa uma área diferente do Bento: o grid nunca fica simétrico.
const areas = {
  alta: 'md:col-span-5 md:row-span-2 aspect-[3/4] md:aspect-auto md:min-h-[42rem]',
  media: 'md:col-span-4 aspect-[4/5] md:min-h-[20rem]',
  larga: 'md:col-span-7 aspect-[4/3] md:min-h-[20rem]',
}

export default function CardProduto({ produto, indice, onAbrir }) {
  const raiz = useRef(null)
  const tecido = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Paralaxe: o "tecido" é maior que o card e desliza mais devagar que a página.
      gsap.fromTo(
        tecido.current,
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: raiz.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <motion.article
      ref={raiz}
      onClick={() => onAbrir(produto)}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: (indice % 3) * 0.08 }}
      className={`group relative cursor-pointer overflow-hidden bg-[#111] ${areas[produto.peso]}`}
      data-cursor="Ver peça"
    >
      {/* Superfície da peça: sem foto, o material é sugerido por gradiente + textura */}
      <div ref={tecido} className="absolute -inset-y-[12%] inset-x-0">
        <div
          className="h-full w-full transition-transform duration-[900ms] ease-loba group-hover:scale-[1.07]"
          style={{
            background: `radial-gradient(120% 90% at 30% 20%, ${produto.cor}f2 0%, #0d0d0d 78%)`,
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-breu/85 via-transparent to-transparent" />

      {/* Etiqueta de estado, canto superior */}
      <span className="absolute left-5 top-5 z-10 border border-osso/25 px-3 py-1 font-stencil text-[0.65rem] tracking-[0.25em] text-osso/80 backdrop-blur-sm">
        {produto.estado}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-7">
        <div>
          <h3 className="font-display text-2xl uppercase leading-none text-osso md:text-3xl">
            {produto.nome}
          </h3>
          <p className="mt-2 font-corpo text-sm text-osso/55">
            {produto.detalhe} · tam {produto.tamanho}
          </p>
        </div>
        <p className="shrink-0 font-stencil text-xl text-sangue">
          R$ {produto.preco}
        </p>
      </div>

      {/* Linha vermelha que corre na base no hover */}
      <span className="absolute bottom-0 left-0 z-10 h-[3px] w-0 bg-sangue transition-all duration-700 ease-loba group-hover:w-full" />
    </motion.article>
  )
}
