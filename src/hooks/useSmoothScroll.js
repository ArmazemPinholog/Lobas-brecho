import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Rolagem contínua com Lenis, dirigida pelo ticker do GSAP.
 * Usar o mesmo relógio para os dois evita o "descolamento" clássico
 * entre a posição real da página e o que o ScrollTrigger acredita ser a posição.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    // Cada frame do GSAP avança o Lenis e sincroniza os triggers.
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Expõe o instance para links âncora do menu.
    window.__lenis = lenis

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

/** Rola até um elemento respeitando o Lenis (ou nativo, se desativado). */
export function scrollToSection(hash) {
  const el = document.querySelector(hash)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -40, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
