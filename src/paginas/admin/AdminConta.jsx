import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Campo, Texto, Botao, Aviso } from './ui'

/** Troca de senha da própria conta logada. */
export default function AdminConta() {
  const { sessao } = useAuth()
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [estado, setEstado] = useState({ tipo: 'ok', msg: '' })
  const [salvando, setSalvando] = useState(false)

  const trocar = async (e) => {
    e.preventDefault()
    setEstado({ tipo: 'ok', msg: '' })

    if (nova.length < 8) {
      setEstado({ tipo: 'erro', msg: 'A senha precisa ter pelo menos 8 caracteres.' })
      return
    }
    if (nova !== confirma) {
      setEstado({ tipo: 'erro', msg: 'As duas senhas não são iguais.' })
      return
    }

    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: nova })
    setSalvando(false)

    if (error) {
      setEstado({ tipo: 'erro', msg: 'Não foi possível trocar: ' + error.message })
    } else {
      setNova(''); setConfirma('')
      setEstado({ tipo: 'ok', msg: 'Senha alterada. Use a nova no próximo acesso.' })
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-2 font-display text-3xl uppercase">Conta</h1>
      <p className="mb-8 text-sm text-osso/45">Conectada como {sessao?.user?.email}</p>

      <form onSubmit={trocar} className="space-y-5">
        {/* Campo oculto: ajuda o gerenciador de senhas do navegador a associar a conta certa */}
        <input type="text" autoComplete="username" value={sessao?.user?.email || ''} readOnly hidden />

        <Campo rotulo="Nova senha" dica="Pelo menos 8 caracteres">
          <Texto type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" />
        </Campo>

        <Campo rotulo="Repita a nova senha">
          <Texto type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} autoComplete="new-password" />
        </Campo>

        <div className="flex items-center gap-4 pt-2">
          <Botao type="submit" disabled={salvando}>{salvando ? 'TROCANDO...' : 'TROCAR SENHA'}</Botao>
        </div>
        <Aviso tipo={estado.tipo}>{estado.msg}</Aviso>
      </form>

      <p className="mt-10 border-t border-osso/10 pt-6 text-xs leading-relaxed text-osso/35">
        Para criar acesso para a segunda sócia, cadastre o e-mail dela no painel do Supabase,
        em Authentication → Users → Add user. Cada uma entra com a própria senha.
      </p>
    </div>
  )
}
