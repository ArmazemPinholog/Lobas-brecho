import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CardPeca, { tamanhoCard } from './CardPeca'
import FichaPeca from './FichaPeca'
import { Carregando, ErroCarregamento } from './Estado'

const TAMANHO_PAGINA = 24

const ordenarFotos = (p) => ({
  ...p,
  peca_fotos: (p.peca_fotos || []).sort((a, b) => a.ordem - b.ordem),
})

/**
 * Busca as peças publicadas e monta o bento.
 * `limite` deixa a home mostrar só os destaques sem duplicar código.
 * Sem `limite` (acervo completo), busca em páginas de 24 em vez de trazer
 * a tabela inteira de uma vez — antes ela crescia sem paginação nenhuma.
 */
export default function GradeDePecas({ limite = null, somenteDestaques = false }) {
  const [pecas, setPecas] = useState(null)   // null = ainda carregando
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [temMais, setTemMais] = useState(false)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [aberta, setAberta] = useState(null)

  const paginar = !limite

  useEffect(() => {
    let vivo = true
    setPecas(null)
    setErro(false)
    setPagina(0)
    ;(async () => {
      let q = supabase
        .from('pecas')
        .select('*, peca_fotos(caminho, alt, ordem)')
        .in('status', ['disponivel', 'reservada', 'vendida'])
        .order('criada_em', { ascending: false })

      if (somenteDestaques) q = q.eq('destaque', true)
      if (limite) q = q.limit(limite)
      else q = q.range(0, TAMANHO_PAGINA - 1)

      const { data, error } = await q
      if (!vivo) return
      if (error) { setErro(true); return }
      const lista = (data || []).map(ordenarFotos)
      setPecas(lista)
      if (paginar) setTemMais(lista.length === TAMANHO_PAGINA)
    })()
    return () => { vivo = false }
  }, [limite, somenteDestaques, tentativa])

  const carregarMais = async () => {
    const proxima = pagina + 1
    setCarregandoMais(true)
    let q = supabase
      .from('pecas')
      .select('*, peca_fotos(caminho, alt, ordem)')
      .in('status', ['disponivel', 'reservada', 'vendida'])
      .order('criada_em', { ascending: false })
      .range(proxima * TAMANHO_PAGINA, proxima * TAMANHO_PAGINA + TAMANHO_PAGINA - 1)
    if (somenteDestaques) q = q.eq('destaque', true)

    const { data, error } = await q
    setCarregandoMais(false)
    if (error) return   // falha ao paginar: mantém o que já tem na tela, sem travar nada
    const lista = (data || []).map(ordenarFotos)
    setPecas((atual) => [...atual, ...lista])
    setTemMais(lista.length === TAMANHO_PAGINA)
    setPagina(proxima)
  }

  if (erro) {
    return <ErroCarregamento mensagem="Não foi possível carregar as peças agora." onTentar={() => setTentativa((t) => t + 1)} />
  }

  if (pecas === null) {
    return <Carregando />
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

      {paginar && temMais && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={carregarMais}
            disabled={carregandoMais}
            className="border border-osso/25 px-8 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:border-sangue disabled:opacity-40"
          >
            {carregandoMais ? 'CARREGANDO...' : 'VER MAIS PEÇAS'}
          </button>
        </div>
      )}

      <FichaPeca peca={aberta} onFechar={() => setAberta(null)} />
    </>
  )
}
