import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SiteProvider } from './lib/site'
import { CarrinhoProvider } from './lib/carrinho'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Home from './paginas/Home'
import Acervo from './paginas/Acervo'
import Blog from './paginas/Blog'
import Post from './paginas/Post'
import Closet from './paginas/Closet'
import Entrar from './paginas/admin/Entrar'
import Painel from './paginas/admin/Painel'

/** Rota do painel: sem sessão, manda para o login. */
function Protegida({ children }) {
  const { sessao, carregando } = useAuth()
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-breu">
        <p className="font-stencil tracking-[0.3em] text-osso/40">CARREGANDO</p>
      </div>
    )
  }
  return sessao ? children : <Navigate to="/entrar" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <CarrinhoProvider>
            <Routes>
              {/* Site público */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/acervo" element={<Acervo />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<Post />} />
                <Route path="/closet" element={<Closet />} />
              </Route>

              {/* Painel */}
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/admin/*" element={<Protegida><Painel /></Protegida>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CarrinhoProvider>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
