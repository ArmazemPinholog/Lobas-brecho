import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import CursorEstrela from './CursorEstrela'
import Navegacao from './Navegacao'
import Rodape from './Rodape'
import SacolaPainel from './SacolaPainel'
import { useSite } from '../lib/site'

export default function Layout() {
  const { pathname } = useLocation()
  const { config } = useSite()
  useSmoothScroll()

  // Trocar de página volta ao topo — o Lenis não faz isso sozinho.
  useEffect(() => {
    window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="grain vinheta relative min-h-screen bg-breu">
      <CursorEstrela />
      {config.aviso_topo && (
        <div className="relative z-50 bg-sangue px-4 py-2 text-center font-stencil text-xs tracking-[0.3em] text-osso">
          {config.aviso_topo}
        </div>
      )}
      <Navegacao />
      <main>
        <Outlet />
      </main>
      <Rodape />
      <SacolaPainel />
    </div>
  )
}
