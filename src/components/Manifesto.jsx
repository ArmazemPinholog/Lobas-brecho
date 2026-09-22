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
      {/* No mobile a pata some — nesse tamanho de tela ela só duplicava a
          silhueta do lobo por cima do texto (era o "sobreposto comendo o
          espaço um do outro"). A partir do sm ela volta, bem menor do que
          antes, e só ganha o tamanho grande original lá no md. */}
      <img
        data-pata src="/brand/ELEMENTO_3.png" alt="" aria-hidden="true"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
        className="pointer-events-none absolute -right-10 top-1/2 hidden w-[16rem] -translate-y-1/2 opacity-[0.12] mix-blend-screen sm:block sm:w-[22rem] md:w-[42rem]"
      />
      {/* O lobo como motivo central da seção — antes ficava discreto
          demais (9% de opacidade) e sumia atrás do texto. Agora ele
          aparece de verdade, com o olho aceso, e o texto continua
          legível porque o título é sólido (osso/vermelho) por cima.
          No mobile ele entra bem menor (era w-[30rem] = maior que a
          própria tela, cobrindo o texto inteiro) e cresce progressivamente
          até o tamanho grande original a partir do md. */}
      <div
        data-lobo-perfil
        className="pointer-events-none absolute -left-6 top-[6%] w-[13rem] opacity-[0.3] mix-blend-screen sm:-left-8 sm:top-[4%] sm:w-[20rem] sm:opacity-[0.38] md:-left-2 md:top-[2%] md:w-[42rem] md:opacity-[0.42] lg:w-[50rem]"
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
