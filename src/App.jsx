import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import CursorEstrela from './components/CursorEstrela'
import Navegacao from './components/Navegacao'
import Hero from './components/Hero'
import Faixa from './components/Faixa'
import Vitrine from './components/Vitrine'
import Manifesto from './components/Manifesto'
import Rodape from './components/Rodape'

export default function App() {
  useSmoothScroll()

  // Depois que fontes e canvas assentam, as alturas mudam: recalcula os triggers.
  useEffect(() => {
    const recalcular = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(recalcular)
    window.addEventListener('load', recalcular)
    return () => window.removeEventListener('load', recalcular)
  }, [])

  return (
    <div className="grain vinheta relative min-h-screen bg-breu">
      <CursorEstrela />
      <Navegacao />
      <main>
        <Hero />
        <Faixa />
        <Vitrine />
        <Manifesto />
      </main>
      <Rodape />
    </div>
  )
}
