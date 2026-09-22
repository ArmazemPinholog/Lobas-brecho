import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSite, linkWhats } from '../lib/site'

gsap.registerPlugin(ScrollTrigger)

/**
 * Selo com cantos de mira, no estilo "anotação de design" — referência que o
 * Christian trouxe do site da Born Agency (case no Behance, apresentação da
 * home): close no olho de um pássaro com pequenas marcações apontando
 * detalhes do trabalho. Aqui o mesmo recurso explica o brechó em vez de
 * vender a agência: reserva e closet virtual, ancorados junto à "TV".
 */
function Selo({ titulo, texto, className }) {
  if (!titulo) return null
  return (
    <div data-selo className={`absolute z-20 flex max-w-[13rem] items-start gap-3 opacity-0 ${className}`}>
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
      gsap.from('[data-tv]', {
        opacity: 0, y: 40, scale: 0.97, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: raiz.current, start: 'top 65%' },
      })
      gsap.to('[data-selo]', {
        opacity: 1, duration: 0.9, stagger: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: raiz.current, start: 'top 55%' },
      })
      gsap.from('[data-cta-circulo]', {
        scale: 0.7, opacity: 0, duration: 0.8, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: raiz.current, start: 'top 55%' },
      })
    }, raiz)
    return () => ctx.revert()
  }, [carregando])

  return (
    <section ref={raiz} className="relative overflow-hidden border-y border-osso/10 bg-breu py-24 md:py-36">
      <div className="relative mx-auto max-w-[1300px] px-6 md:px-12">
        {/* A "TV": moldura metálica escura com a tela em 16:9 cravada dentro —
            referência direta ao case da Born Agency, onde o destaque do site
            aparece rodando dentro de um monitor. Aqui é vídeo de verdade (uivo
            + correndo), tratado em duotone vermelho pra casar com a paleta. */}
        <div data-tv className="relative mx-auto w-full max-w-4xl">
          <div
            className="relative rounded-[1.75rem] bg-gradient-to-b from-[#232323] to-[#050505] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-osso/10 md:rounded-[2.25rem] md:p-5"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] md:rounded-2xl">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/video/destaques-lobo-poster.jpg"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              >
                <source src="/video/destaques-lobo.webm" type="video/webm" />
                <source src="/video/destaques-lobo.mp4" type="video/mp4" />
              </video>

              {/* Textura de scanline bem sutil — reforça a leitura de "tela",
                  sem virar efeito de filtro exagerado. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)',
                }}
              />
              {/* Vinheta nas bordas da tela, pra dar profundidade dentro do vidro. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: 'inset 0 0 6rem rgba(0,0,0,0.65)' }}
              />
            </div>

            {/* Detalhe da moldura: LED aceso + selo da marca, como o chrome
                discreto de um player/monitor. */}
            <div className="mt-3 flex items-center justify-between px-2 md:mt-4">
              <span className="font-stencil text-[0.6rem] tracking-[0.35em] text-osso/40">LOBAS BRECHÓ</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sangue shadow-[0_0_6px_2px_rgba(225,36,36,0.6)]" />
                <span className="font-stencil text-[0.55rem] tracking-[0.3em] text-osso/30">REC</span>
              </span>
            </div>
          </div>

          <Selo
            titulo={texto('destaques.selo1_titulo')}
            texto={texto('destaques.selo1_texto')}
            className="-bottom-6 left-0 sm:-bottom-8 sm:left-2 md:-left-12 md:bottom-10"
          />
          <Selo
            titulo={texto('destaques.selo2_titulo')}
            texto={texto('destaques.selo2_texto')}
            className="-top-6 right-0 text-right sm:-top-8 sm:right-2 md:-right-12 md:top-10 md:text-left"
          />

          {/* Ancorado à própria "TV" (não à seção inteira), como um selo
              pendurado no canto — protrai levemente pra fora da moldura. */}
          {whats && (
            <a
              data-cta-circulo
              href={whats}
              target="_blank"
              rel="noreferrer"
              className="group absolute -bottom-7 -right-3 z-20 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-osso text-center font-stencil text-[0.55rem] leading-tight tracking-[0.12em] text-breu shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-loba hover:scale-105 md:-bottom-9 md:-right-6 md:h-24 md:w-24 md:text-[0.6rem]"
            >
              {texto('destaques.botao')}
            </a>
          )}
        </div>

        {texto('destaques.frase') && (
          <div className="mx-auto mt-24 max-w-[62ch] md:mt-32">
            <p className="whitespace-pre-line font-corpo text-xl leading-relaxed text-osso/80 md:text-2xl">
              {texto('destaques.frase')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
