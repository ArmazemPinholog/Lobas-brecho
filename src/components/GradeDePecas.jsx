import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CardPeca, { tamanhoCard } from './CardPeca'
import FichaPeca from './FichaPeca'

/**
 * Busca as peças publicadas e monta o bento.
 * `limite` deixa a home mostrar só os destaques sem duplicar código.
 */
export default function GradeDePecas({ limite = null, somenteDestaques = false }) {
  const [pecas, setPecas] = useState(null)   // null = ainda carregando
  const [aberta, setAberta] = useState(null)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      let q = supabase
        .from('pecas')
        .select('*, peca_fotos(caminho, alt, ordem)')
        .in('status', ['disponivel', 'reservada', 'vendida'])
        .order('criada_em', { ascending: false })

      if (somenteDestaques) q = q.eq('destaque', true)
      if (limite) q = q.limit(limite)

      const { data } = await q
      if (!vivo) return
      // Ordena as fotos de cada peça: a de ordem 0 é a capa.
      setPecas((data || []).map((p) => ({
        ...p,
        peca_fotos: (p.peca_fotos || []).sort((a, b) => a.ordem - b.ordem),
      })))
    })()
    return () => { vivo = false }
  }, [limite, somenteDestaques])

  if (pecas === null) {
    return <p className="py-20 text-center font-stencil text-sm tracking-[0.3em] text-osso/30">CARREGANDO</p>
  }

  if (pecas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed border-osso/15 py-24 text-center">
        <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">NENHUMA PEÇA CADASTRADA AINDA</p>
        <p className="max-w-[40ch] text-sm text-osso/35">
          As peças aparecem aqui assim que forem publicadas no painel.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:auto-rows-[minmax(0,1fr)] md:grid-cols-12">
        {pecas.map((p, i) => (
          <CardPeca key={p.id} peca={p} indice={i} tamanho={tamanhoCard(p, i)} onAbrir={setAberta} />
        ))}
      </div>
      <FichaPeca peca={aberta} onFechar={() => setAberta(null)} />
    </>
  )
}
