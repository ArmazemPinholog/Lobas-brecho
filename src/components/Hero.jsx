import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Estrela from './Estrela'
import BrilhoOlhos from './BrilhoOlhos'
import { useSite } from '../lib/site'

// three.js + @react-three/fiber/drei pesam bastante no pacote principal —
// carregam só quando a Hero realmente monta, nunca bloqueando o resto do site.
const HeroScene = lazy(() => import('../three/HeroScene'))

export default function Hero() {
  const raiz = useRef(null)
  const { texto, carregando } = useSite()
  // Close nos olhos: ativado ao passar o mouse em qualquer ponto da hero,
  // não só sobre o vídeo — o wrapper do vídeo fica atrás do grid de texto
  // (z-10), que cobre a largura toda, então um :hover em CSS no próprio
  // vídeo nunca dispararia. Ouvindo no <section> isso não depende de qual
  // elemento está por cima em cada pixel.
  const [olhosAtivos, setOlhosAtivos] = useState(false)

  useLayoutEffect(() => {
    // Só anima depois que os textos chegaram: animar o estado vazio
    // faria as linhas subirem em branco e "aparecerem" depois.
    if (carregando) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('[data-reveal="linha"]', { yPercent: 115, duration: 1.25, stagger: 0.09 })
        .from('[data-reveal="canvas"]', { opacity: 0, duration: 1.6 }, 0.15)
        .from('[data-reveal="meta"]', { opacity: 0, y: 24, duration: 0.9, stagger: 0.08 }, '-=0.75')
    }, raiz)
    return () => ctx.revert()
  }, [carregando])

  return (
    <section
      ref={raiz}
      onMouseEnter={() => setOlhosAtivos(true)}
      onMouseLeave={() => setOlhosAtivos(false)}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-32"
    >
      {/* Lobo em vídeo: camada atmosférica atrás da estrela 3D, que continua
          sendo o símbolo principal da marca. Fundo preto puro do vídeo some
          com mix-blend-screen, igual à técnica já usada no ELEMENTO_3 do
          Manifesto — sem precisar de chroma-key. Escondido no mobile para
          não pesar em conexão/bateria numa faixa estreita demais pra valer. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[46%] items-center overflow-hidden lg:flex">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-lobo-poster.jpg"
          className="h-[88%] w-full object-cover object-center opacity-60 mix-blend-screen"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        >
          <source src="/video/hero-lobo.webm" type="video/webm" />
          <source src="/video/hero-lobo.mp4" type="video/mp4" />
        </video>

        {/* Close nos olhos do lobo: revelado no hover da hero inteira (ver
            comentário acima do estado). Fica só nesse recorte à direita, onde
            o vídeo já está — como um corte de câmera pro close. */}
        <div
          aria-hidden="true"
          style={{ backgroundImage: 'url(/brand/lobo-olhos.png)' }}
          className={`pointer-events-none absolute inset-0 m-auto h-[46%] w-[85%] bg-contain bg-center bg-no-repeat mix-blend-screen transition-all duration-700 ease-loba ${
            olhosAtivos ? 'scale-100 opacity-90' : 'scale-95 opacity-0'
          }`}
        />
      </div>

      <div data-reveal="canvas" className="absolute inset-0 z-0">
        <Suspense fallback={null}><HeroScene /></Suspense>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-sangue/10 blur-[140px]" />

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
            <Link
              to="/acervo"
              className="group relative inline-flex items-center overflow-hidden bg-sangue px-9 py-4 font-stencil text-sm tracking-[0.35em] text-osso"
            >
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
