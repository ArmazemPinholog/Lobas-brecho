import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSite } from '../lib/site'

gsap.registerPlugin(ScrollTrigger)

export default function Manifesto() {
  const raiz = useRef(null)
  const { texto, carregando } = useSite()

  useLayoutEffect(() => {
    if (carregando) return
    const ctx = gsap.context(() => {
      // Cada linha sobe por trás da própria máscara quando a seção entra na tela.
      gsap.from('[data-linha]', {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: raiz.current, start: 'top 65%' },
      })
      gsap.from('[data-corpo]', {
        opacity: 0, y: 18, duration: 0.8,
        scrollTrigger: { trigger: raiz.current, start: 'top 55%' },
      })
      gsap.fromTo('[data-pata]', { yPercent: 14, rotate: -6 }, {
        yPercent: -14, rotate: 4, ease: 'none',
        scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      // Silhueta do lobo: mesmo esquema de paralaxe via scrub, deslocamento
      // menor e no sentido oposto da pata — profundidades diferentes pra
      // não ler como um espelhamento do mesmo elemento.
      gsap.fromTo('[data-lobo-perfil]', { yPercent: -8, xPercent: -3 }, {
        yPercent: 8, xPercent: 2, ease: 'none',
        scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      // Olho do lobo: um brilho vermelho pulsando devagar, tipo brasa —
      // é o que faz o olhar dele "acender" em vez de ficar só uma
      // silhueta apagada atrás do texto.
      gsap.to('[data-lobo-olho]', {
        opacity: 0.95, scale: 1.25, duration: 1.9, ease: 'sine.inOut',
        repeat: -1, yoyo: true, transformOrigin: 'center center',
      })
    }, raiz)
    return () => ctx.revert()
  }, [carregando])

  const linhas = ['manifesto.linha1', 'manifesto.linha2', 'manifesto.linha3']

  return (
    <section ref={raiz} className="relative overflow-hidden border-y border-osso/10 bg-[#0d0d0d] py-28 md:py-44">
      <img
        data-pata src="/brand/ELEMENTO_3.png" alt="" aria-hidden="true"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
        className="pointer-events-none absolute -right-16 top-1/2 w-[28rem] -translate-y-1/2 opacity-[0.12] mix-blend-screen md:w-[42rem]"
      />
      {/* O lobo como motivo central da seção — antes ficava discreto
          demais (9% de opacidade) e sumia atrás do texto. Agora ele
          aparece de verdade, com o olho aceso, e o texto continua
          legível porque o título é sólido (osso/vermelho) por cima. */}
      <div
        data-lobo-perfil
        className="pointer-events-none absolute -left-10 top-[4%] w-[30rem] opacity-[0.42] mix-blend-screen md:-left-2 md:top-[2%] md:w-[42rem] lg:w-[50rem]"
      >
        <img
          src="/brand/lobo-perfil-osso.png" alt="" aria-hidden="true"
          onError={(e) => { e.currentTarget.closest('[data-lobo-perfil]').style.display = 'none' }}
          className="w-full"
        />
        <span
          data-lobo-olho
          aria-hidden="true"
          style={{ left: '73%', top: '18.5%' }}
          className="absolute h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sangue opacity-60 blur-[7px]"
        />
      </div>
      <div className="relative mx-auto grid max-w-[1600px] grid-cols-12 gap-y-14 px-6 md:px-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 className="font-display uppercase leading-[0.86] text-osso">
            {linhas.map((chave, i) => (
              <span key={chave} className="block overflow-hidden">
                <span data-linha className={`block text-[13vw] lg:text-[7.5vw] ${i === 2 ? 'text-sangue' : ''}`}>
                  {texto(chave)}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {texto('manifesto.texto') && (
          <div className="col-span-12 self-end lg:col-span-4 lg:col-start-9">
            <div className="border-l border-sangue/60 pl-6">
              <p data-corpo className="max-w-[52ch] whitespace-pre-line text-base leading-relaxed text-osso/70">
                {texto('manifesto.texto')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
