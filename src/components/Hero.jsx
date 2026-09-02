import { Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import HeroScene from '../three/HeroScene'
import BotaoMagnetico from './BotaoMagnetico'
import Estrela from './Estrela'

export default function Hero() {
  const raiz = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Sequência única de entrada da página: as linhas do título sobem
      // por trás de máscaras, e o resto da interface aparece depois delas.
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.from('[data-reveal="linha"]', {
        yPercent: 115,
        duration: 1.25,
        stagger: 0.09,
      })
        .from('[data-reveal="canvas"]', { opacity: 0, duration: 1.6 }, 0.15)
        .from(
          '[data-reveal="meta"]',
          { opacity: 0, y: 24, duration: 0.9, stagger: 0.08 },
          '-=0.75'
        )
        .from('[data-reveal="cta"]', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
    }, raiz)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="topo"
      ref={raiz}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-32"
    >
      {/* Canvas 3D atrás do conteúdo, sem capturar cliques */}
      <div data-reveal="canvas" className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Brilho vermelho de apoio ao fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-sangue/12 blur-[140px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] grid-cols-12 gap-y-12 px-6 md:px-12">
        {/* Coluna editorial: título massivo alinhado à esquerda */}
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden">
            <p data-reveal="linha" className="font-stencil text-sm tracking-[0.45em] text-sangue">
              ACERVO DE OUTUBRO
            </p>
          </div>

          <h1 className="mt-4 font-display uppercase leading-[0.82] text-osso">
            <span className="block overflow-hidden">
              <span data-reveal="linha" className="block text-[18vw] lg:text-[11vw]">
                Roupa
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                data-reveal="linha"
                className="flex items-center gap-[0.12em] text-[18vw] lg:text-[11vw]"
              >
                com
                <Estrela className="h-[0.42em] w-[0.42em] shrink-0" />
                <span className="risco-metal">passado</span>
              </span>
            </span>
          </h1>

          <div className="mt-10 max-w-[46ch] overflow-hidden">
            <p data-reveal="meta" className="font-corpo text-base leading-relaxed text-osso/65">
              Garimpamos peça por peça, lavamos, consertamos e contamos de onde cada uma veio. Se está
              no site, existe uma só. Quando sai, não volta.
            </p>
          </div>

          <div data-reveal="cta" className="mt-10 flex flex-wrap items-center gap-5">
            <BotaoMagnetico href="#vitrine">VER O ACERVO</BotaoMagnetico>
            <BotaoMagnetico href="#manifesto" variante="linha">
              QUEM SOMOS
            </BotaoMagnetico>
          </div>
        </div>

        {/* Coluna de dados: informação real, não enfeite */}
        <aside className="col-span-12 flex flex-row justify-between gap-8 self-end border-t border-osso/15 pt-6 lg:col-span-3 lg:col-start-10 lg:flex-col lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div data-reveal="meta">
            <p className="font-display text-4xl text-osso">142</p>
            <p className="mt-1 font-corpo text-xs text-osso/50">peças no acervo agora</p>
          </div>
          <div data-reveal="meta">
            <p className="font-display text-4xl text-osso">1 de 1</p>
            <p className="mt-1 font-corpo text-xs text-osso/50">nenhuma peça se repete</p>
          </div>
          <div data-reveal="meta">
            <p className="font-display text-4xl text-osso">Qua–Sáb</p>
            <p className="mt-1 font-corpo text-xs text-osso/50">loja física, Rua Aurora 214</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
