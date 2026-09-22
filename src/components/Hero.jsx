import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Estrela from './Estrela'
import BrilhoOlhos from './BrilhoOlhos'
import { useSite } from '../lib/site'

export default function Hero() {
  const raiz = useRef(null)
  const { texto, carregando } = useSite()

  useLayoutEffect(() => {
    if (carregando) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('[data-reveal="fundo"]', { opacity: 0, duration: 2 })
        .from('[data-reveal="linha"]', { yPercent: 115, duration: 1.25, stagger: 0.09 }, 0.25)
        .from('[data-reveal="meta"]', { opacity: 0, y: 24, duration: 0.9, stagger: 0.08 }, '-=0.75')
    }, raiz)
    return () => ctx.revert()
  }, [carregando])

  return (
    <section
      ref={raiz}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-32"
    >
      {/* O lobo cobre a tela inteira, já no mesmo duotone vermelho/preto dos
          Destaques — o fundo do próprio vídeo é preto, então ele se funde na
          seção em vez de parecer uma foto colada por cima como antes. */}
      <div data-reveal="fundo" className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-lobo-poster.jpg"
          className="h-full w-full object-cover"
          style={{ objectPosition: '58% 42%' }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        >
          <source src="/video/hero-lobo.webm" type="video/webm" />
          <source src="/video/hero-lobo.mp4" type="video/mp4" />
        </video>

        {/* Reforço de legibilidade: escurece de baixo pra cima (onde fica o
            texto, já que a seção é ancorada embaixo) e, em telas largas, um
            pouco da esquerda também — nunca uma borda dura, só gradiente. */}
        <div className="absolute inset-0 bg-gradient-to-t from-breu via-breu/45 to-transparent" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-breu/80 via-breu/10 to-transparent lg:block" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 z-[1] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-sangue/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] grid-cols-12 gap-y-12 px-6 md:px-12">
        <div className="col-span-12 lg:col-span-9">
          {texto('hero.etiqueta') && (
            <div className="overflow-hidden">
              <p data-reveal="linha" className="font-stencil text-sm tracking-[0.45em] text-sangue">
                {texto('hero.etiqueta')}
              </p>
            </div>
          )}
          <h1 className="mt-4 font-display uppercase leading-[0.82] text-osso">
            <span className="block overflow-hidden">
              <span data-reveal="linha" className="block text-[18vw] lg:text-[11vw]">{texto('hero.titulo1')}</span>
            </span>
            <span className="block overflow-hidden">
              <span data-reveal="linha" className="flex items-center gap-[0.12em] text-[18vw] lg:text-[11vw]">
                <Estrela className="h-[0.42em] w-[0.42em] shrink-0" />
                <span className="risco-metal">{texto('hero.titulo2')}</span>
              </span>
            </span>
          </h1>
          {texto('hero.texto') && (
            <div className="mt-10 max-w-[46ch] overflow-hidden">
              <p data-reveal="meta" className="text-base leading-relaxed text-osso/65">{texto('hero.texto')}</p>
            </div>
          )}
          <div data-reveal="meta" className="mt-10">
            <Link to="/acervo" className="group relative inline-flex items-center overflow-hidden bg-sangue px-9 py-4 font-stencil text-sm tracking-[0.35em] text-osso">
              <BrilhoOlhos />
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-osso transition-transform duration-500 ease-loba group-hover:scale-y-100" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-breu">{texto('hero.botao')}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
