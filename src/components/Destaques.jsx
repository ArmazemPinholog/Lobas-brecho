import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSite, linkWhats } from '../lib/site'

gsap.registerPlugin(ScrollTrigger)

/**
 * Selo com cantos de mira, no estilo "anotação de design" — referência que o
 * Christian trouxe do site da Born Agency (case no Behance, apresentação da
 * home): closo no olho de um pássaro com pequenas marcações apontando
 * detalhes do trabalho. Aqui o mesmo recurso explica o brechó em vez de
 * vender a agência: reserva e closet virtual, ancorados no rosto do lobo.
 */
function Selo({ titulo, texto, className }) {
  if (!titulo) return null
  return (
    <div data-selo className={`absolute z-10 flex max-w-[13rem] items-start gap-3 opacity-0 ${className}`}>
      <span className="relative mt-0.5 h-8 w-8 shrink-0">
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-osso/80" />
        <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-osso/80" />
        <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-osso/80" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-osso/80" />
      </span>
      <span>
        <span className="block font-stencil text-[0.65rem] leading-tight tracking-[0.25em] text-osso">
          {titulo}
        </span>
        {texto && (
          <span className="mt-1.5 block font-corpo text-[0.72rem] leading-snug tracking-normal text-osso/60">
            {texto}
          </span>
        )}
      </span>
    </div>
  )
}

export default function Destaques() {
  const raiz = useRef(null)
  const { texto, config, carregando } = useSite()
  const whats = linkWhats(config.whatsapp, 'Oi! Vi o site e quero saber mais sobre o acervo da Lobas Brechó.')

  useLayoutEffect(() => {
    if (carregando) return
    const ctx = gsap.context(() => {
      gsap.to('[data-selo]', {
        opacity: 1, duration: 0.9, stagger: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: raiz.current, start: 'top 60%' },
      })
      gsap.from('[data-cta-circulo]', {
        scale: 0.7, opacity: 0, duration: 0.8, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: raiz.current, start: 'top 55%' },
      })
    }, raiz)
    return () => ctx.revert()
  }, [carregando])

  return (
    <section ref={raiz} className="border-y border-osso/10 bg-breu">
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] md:aspect-[21/9]">
        <img
          src="/brand/lobo-destaque.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[30%_center]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-breu/40 via-transparent to-transparent" />

        <Selo
          titulo={texto('destaques.selo1_titulo')}
          texto={texto('destaques.selo1_texto')}
          className="left-[6%] top-[10%] sm:left-[8%] sm:top-[16%] md:left-[27%] md:top-[64%]"
        />
        <Selo
          titulo={texto('destaques.selo2_titulo')}
          texto={texto('destaques.selo2_texto')}
          className="right-[6%] bottom-[8%] sm:bottom-[12%] md:bottom-auto md:right-[8%] md:top-[18%]"
        />

        {whats && (
          <a
            data-cta-circulo
            href={whats}
            target="_blank"
            rel="noreferrer"
            className="group absolute bottom-6 right-6 z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-osso text-center font-stencil text-[0.55rem] leading-tight tracking-[0.12em] text-breu transition-transform duration-500 ease-loba hover:scale-105 md:h-24 md:w-24 md:text-[0.6rem]"
          >
            {texto('destaques.botao')}
          </a>
        )}
      </div>

      {texto('destaques.frase') && (
        <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-12 md:py-24">
          <p className="max-w-[62ch] whitespace-pre-line font-corpo text-xl leading-relaxed text-osso/80 md:text-2xl">
            {texto('destaques.frase')}
          </p>
        </div>
      )}
    </section>
  )
}
