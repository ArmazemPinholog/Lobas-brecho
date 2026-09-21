import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Campo, Texto, Botao, Aviso } from './ui'
import { Carregando, ErroCarregamento } from '../../components/Estado'

/** Contato, entrega e avisos: o que muda sem precisar de código. */
export default function AdminLoja() {
  const [c, setC] = useState(null)
  const [erro, setErro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setC(null)
    setErro(false)
    supabase.from('config_loja').select('*').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        error ? setErro(true) : setC(data || { id: 1 })
      })
  }, [tentativa])

  const campo = (k) => ({ value: c?.[k] ?? '', onChange: (e) => setC({ ...c, [k]: e.target.value }) })

  const salvar = async () => {
    setSalvando(true)
    setAviso('')
    const { error } = await supabase.from('config_loja').upsert({ ...c, id: 1, atualizado_em: new Date().toISOString() })
    setSalvando(false)
    setAviso(error ? 'Erro ao salvar: ' + error.message : 'Configuração salva. Recarregue o site para ver.')
  }

  if (erro) return <ErroCarregamento mensagem="Não foi possível carregar a configuração da loja." onTentar={() => setTentativa((t) => t + 1)} />
  if (c === null) return <Carregando />

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl uppercase">Loja</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Campo rotulo="WhatsApp" dica="Só números, com 55 e DDD. Ex: 5541999998888">
          <Texto {...campo('whatsapp')} placeholder="5541999998888" inputMode="numeric" />
        </Campo>

        <Campo rotulo="Instagram" dica="Só o usuário, sem @">
          <Texto {...campo('instagram')} placeholder="lobasbrecho" />
        </Campo>

        <Campo rotulo="E-mail"><Texto type="email" {...campo('email')} /></Campo>
        <Campo rotulo="Endereço"><Texto {...campo('endereco')} placeholder="Rua, número — bairro, cidade" /></Campo>
        <Campo rotulo="Horário"><Texto {...campo('horario')} placeholder="Quarta a sábado, 12h às 20h" /></Campo>

        <Campo rotulo="Aviso no topo" dica="Faixa vermelha no topo do site. Vazio = não aparece.">
          <Texto {...campo('aviso_topo')} placeholder="Peças novas toda quarta às 19h" />
        </Campo>

        <Campo rotulo="Entrega local" dica="Aparece na sacola. Hoje a loja só entrega em Curitiba.">
          <Texto multilinha linhas={3} {...campo('entrega_local')} />
        </Campo>

        <Campo rotulo="Entrega para fora de Curitiba" dica="Deixe vazio enquanto não entregarem fora da cidade — some da sacola sozinho.">
          <Texto multilinha linhas={3} {...campo('entrega_correios')} />
        </Campo>
      </div>

      <label className="mt-8 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox" checked={c.vendas_ativas !== false}
          onChange={(e) => setC({ ...c, vendas_ativas: e.target.checked })}
          className="h-4 w-4 accent-[#E12424]"
        />
        <span className="text-sm text-osso/70">
          Vendas ativas — desmarque para pausar os botões de compra sem tirar o site do ar
        </span>
      </label>

      <div className="mt-10 flex items-center gap-4 border-t border-osso/10 pt-6">
        <Botao onClick={salvar} disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR'}</Botao>
        <Aviso>{aviso}</Aviso>
      </div>
    </div>
  )
}
