import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Estrela from './Estrela'

const frases = ['Estilo com identidade', 'Sem gênero', 'Peça única', 'Feito por nós', 'Nada novo, tudo novo']

export default function Faixa() {
  const trilho = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Duas cópias idênticas: animar -50% e repetir cria loop sem emenda.
      gsap.to(trilho.current, {
        xPercent: -50,
        duration: 26,
        ease: 'none',
        repeat: -1,
      })
    }, trilho)
    return () => ctx.revert()
  }, [])

  return (
    <div className="overflow-hidden border-y border-osso/10 bg-sangue py-4" aria-hidden="true">
      <div ref={trilho} className="flex w-max items-center gap-10 pr-10">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex items-center gap-10">
            {frases.map((frase) => (
              <span key={frase} className="flex items-center gap-10">
                <span className="font-stencil text-lg tracking-[0.35em] text-osso">
                  {frase.toUpperCase()}
                </span>
                <Estrela className="h-3 w-3" cor="#0b0b0b" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
