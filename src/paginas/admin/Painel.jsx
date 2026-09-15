import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom'
import { LogOut, Shirt, Newspaper, Type, Store, KeyRound, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import AdminPecas from './AdminPecas'
import AdminBlog from './AdminBlog'
import AdminTextos from './AdminTextos'
import AdminLoja from './AdminLoja'
import AdminConta from './AdminConta'

const abas = [
  { para: '/admin/pecas',  rotulo: 'Peças',   Icone: Shirt },
  { para: '/admin/blog',   rotulo: 'Blog',    Icone: Newspaper },
  { para: '/admin/textos', rotulo: 'Textos',  Icone: Type },
  { para: '/admin/loja',   rotulo: 'Loja',    Icone: Store },
  { para: '/admin/conta',  rotulo: 'Conta',   Icone: KeyRound },
]

export default function Painel() {
  const { sessao } = useAuth()

  return (
    <div className="min-h-screen bg-breu text-osso">
      <header className="border-b border-osso/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl">LOBAS</span>
            <span className="font-stencil text-[0.65rem] tracking-[0.5em] text-osso/50">PAINEL</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-osso/40 md:inline">{sessao?.user?.email}</span>
            <Link to="/" target="_blank" className="inline-flex items-center gap-2 text-osso/60 hover:text-osso">
              <ExternalLink size={15} strokeWidth={1.5} /> ver site
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 text-osso/60 hover:text-sangue">
              <LogOut size={15} strokeWidth={1.5} /> sair
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-6">
          {abas.map(({ para, rotulo, Icone }) => (
            <NavLink
              key={para} to={para}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-stencil text-sm tracking-[0.2em] transition-colors ${
                  isActive ? 'border-sangue text-osso' : 'border-transparent text-osso/45 hover:text-osso'
                }`
              }
            >
              <Icone size={15} strokeWidth={1.5} /> {rotulo.toUpperCase()}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <Routes>
          <Route index element={<Navigate to="/admin/pecas" replace />} />
          <Route path="pecas"  element={<AdminPecas />} />
          <Route path="blog"   element={<AdminBlog />} />
          <Route path="textos" element={<AdminTextos />} />
          <Route path="loja"   element={<AdminLoja />} />
          <Route path="conta"  element={<AdminConta />} />
        </Routes>
      </main>
    </div>
  )
}
