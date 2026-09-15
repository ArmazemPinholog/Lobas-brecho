import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import Estrela from '../../components/Estrela'

export default function Entrar() {
  const { sessao } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (sessao) return <Navigate to="/admin" replace />

  const entrar = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEnviando(false)
    // Mensagem genérica de propósito: não confirma se o e-mail existe.
    if (error) setErro('E-mail ou senha incorretos.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-breu px-6">
      <form onSubmit={entrar} className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-baseline gap-3">
          <span className="font-display text-3xl text-osso">LOBAS</span>
          <Estrela className="h-3 w-3 self-center" />
          <span className="font-stencil text-[0.65rem] tracking-[0.5em] text-osso/50">PAINEL</span>
        </Link>

        <label className="block font-stencil text-xs tracking-[0.3em] text-osso/50">E-MAIL</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username"
          className="mt-2 w-full border-b border-osso/25 bg-transparent py-3 text-osso focus:border-sangue focus:outline-none"
        />

        <label className="mt-8 block font-stencil text-xs tracking-[0.3em] text-osso/50">SENHA</label>
        <input
          type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password"
          className="mt-2 w-full border-b border-osso/25 bg-transparent py-3 text-osso focus:border-sangue focus:outline-none"
        />

        {erro && <p className="mt-5 text-sm text-sangue">{erro}</p>}

        <button
          type="submit" disabled={enviando}
          className="mt-10 w-full bg-sangue py-4 font-stencil text-sm tracking-[0.35em] text-osso transition-colors hover:bg-osso hover:text-breu disabled:opacity-50"
        >
          {enviando ? 'ENTRANDO...' : 'ENTRAR'}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-osso/35 hover:text-osso/70">voltar ao site</Link>
      </form>
    </div>
  )
}
