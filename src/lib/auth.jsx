import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

/** Sessão do painel. Quem está logada é administradora — não há outro tipo de conta. */

const AuthCtx = createContext({ sessao: null, carregando: true })

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    // Mantém a tela em dia se a sessão expirar ou a pessoa sair em outra aba.
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSessao(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return <AuthCtx.Provider value={{ sessao, carregando }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
