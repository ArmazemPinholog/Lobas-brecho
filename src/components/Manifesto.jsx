import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const linhas = [
  'Duas lobas.',
  'Duas forças.',
  'Uma energia.',
]

const corpo = [
  'A Lobas nasceu de duas amigas cansadas de ver roupa boa virar lixo.',
  'Compramos pouco e escolhemos muito: cada peça passa por lavagem,',
  'conserto e uma ficha com a história de quem usou antes.',
  'Não separamos por gênero. Separamos por caimento e por atitude.',
]

export default function Manifesto() {
  const raiz = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Revelação linha a linha: cada linha sobe por trás da sua máscara
      // conforme a seção entra no viewport.
      gsap.from('[data-linha]', {
        yPercent: 110,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: raiz.current,
          start: 'top 65%',
        },
      })

      gsap.from('[data-corpo]', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-corpo]', start: 'top 85%' },
      })

      // A pata sobe mais devagar que a página: profundidade sem exagero.
      gsap.fromTo(
        '[data-pata]',
        { yPercent: 14, rotate: -6 },
        {
          yPercent: -14,
          rotate: 4,
          ease: 'none',
          scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="manifesto"
      ref={raiz}
      className="relative overflow-hidden border-y border-osso/10 bg-[#0d0d0d] py-28 md:py-44"
    >
      <img
        data-pata
        src="/brand/ELEMENTO_3.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-1/2 w-[28rem] -translate-y-1/2 opacity-[0.12] mix-blend-screen md:w-[42rem]"
      />

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-12 gap-y-14 px-6 md:px-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 className="font-display uppercase leading-[0.86] text-osso">
            {linhas.map((linha, i) => (
              <span key={linha} className="block overflow-hidden">
                <span
                  data-linha
                  className={`block text-[13vw] lg:text-[7.5vw] ${
                    i === linhas.length - 1 ? 'text-sangue' : ''
                  }`}
                >
                  {linha}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div className="col-span-12 self-end lg:col-span-4 lg:col-start-9">
          <div className="space-y-3 border-l border-sangue/60 pl-6">
            {corpo.map((frase) => (
              <p
                key={frase}
                data-corpo
                className="max-w-[52ch] font-corpo text-base leading-relaxed text-osso/70"
              >
                {frase}
              </p>
            ))}
          </div>

          <img
            src="/brand/ELEMENTO_5.png"
            alt=""
            aria-hidden="true"
            className="mt-10 w-56 opacity-80 mix-blend-screen"
          />
        </div>
      </div>
    </section>
  )
}
