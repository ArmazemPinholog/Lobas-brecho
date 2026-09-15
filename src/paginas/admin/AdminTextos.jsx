import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Campo, Texto, Botao, Aviso } from './ui'

/** Edição das frases do site. Cada campo diz onde aparece, para não editar às cegas. */
export default function AdminTextos() {
  const [linhas, setLinhas] = useState(null)
  const [valores, setValores] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    supabase.from('textos').select('*').order('grupo').order('ordem').then(({ data }) => {
      setLinhas(data || [])
      setValores(Object.fromEntries((data || []).map((l) => [l.chave, l.valor])))
    })
  }, [])

  const salvar = async () => {
    setSalvando(true)
    setAviso('')
    // upsert em lote: uma chamada para todas as frases alteradas
    const { error } = await supabase.from('textos').upsert(
      linhas.map((l) => ({ ...l, valor: valores[l.chave] ?? '' }))
    )
    setSalvando(false)
    setAviso(error ? 'Erro ao salvar: ' + error.message : 'Textos salvos. Recarregue o site para ver.')
  }

  if (linhas === null) return <p className="font-stencil text-sm tracking-[0.3em] text-osso/30">CARREGANDO</p>

  const grupos = [...new Set(linhas.map((l) => l.grupo))]

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl uppercase">Textos do site</h1>
      <p className="mb-8 max-w-[60ch] text-sm text-osso/45">
        Campo vazio usa o texto padrão do site, então nada fica em branco por engano.
      </p>

      <div className="space-y-10">
        {grupos.map((grupo) => (
          <section key={grupo}>
            <p className="mb-4 font-stencil text-xs tracking-[0.4em] text-sangue">{grupo.toUpperCase()}</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {linhas.filter((l) => l.grupo === grupo).map((l) => (
                <Campo key={l.chave} rotulo={l.descricao} dica={l.chave}>
                  <Texto
                    multilinha={l.multilinha}
                    value={valores[l.chave] ?? ''}
                    onChange={(e) => setValores({ ...valores, [l.chave]: e.target.value })}
                  />
                </Campo>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-4 border-t border-osso/10 pt-6">
        <Botao onClick={salvar} disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR TEXTOS'}</Botao>
        <Aviso>{aviso}</Aviso>
      </div>
    </div>
  )
}
