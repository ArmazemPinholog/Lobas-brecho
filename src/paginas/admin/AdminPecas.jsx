import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { supabase, urlArquivo, dinheiro, precoVigente } from '../../lib/supabase'
import { Campo, Texto, Selecao, Botao, Aviso, BotaoUpload } from './ui'

const STATUS = [
  ['rascunho', 'Rascunho (não aparece no site)'],
  ['disponivel', 'Disponível'],
  ['reservada', 'Reservada'],
  ['vendida', 'Vendida'],
  ['arquivada', 'Arquivada (some do site)'],
]

const CAMADAS = [
  ['', 'Não usar no provador'],
  ['topo', 'Parte de cima'],
  ['baixo', 'Parte de baixo'],
  ['corpo_inteiro', 'Vestido / macacão'],
  ['sobreposicao', 'Casaco / sobreposição'],
  ['calcado', 'Calçado'],
  ['acessorio', 'Acessório'],
]

const VAZIA = {
  codigo: '', nome: '', detalhe: '', historia: '', categoria: '', tamanho: '', estado: '',
  medidas: '', preco: '', preco_promo: '', promo_ate: '', status: 'rascunho',
  destaque: false, cor_hex: '#1a1a1a', closet_foto: null, closet_slot: '',
}

export default function AdminPecas() {
  const [pecas, setPecas] = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = async () => {
    const { data } = await supabase
      .from('pecas')
      .select('*, peca_fotos(id, caminho, ordem)')
      .order('criada_em', { ascending: false })
    setPecas(data || [])
  }

  useEffect(() => { carregar() }, [])

  const apagar = async (peca) => {
    if (!confirm(`Apagar a peça ${peca.codigo} — ${peca.nome}? Isso não tem volta.`)) return
    await supabase.from('pecas').delete().eq('id', peca.id)
    carregar()
  }

  if (editando) {
    return (
      <Formulario
        inicial={editando}
        onFechar={() => setEditando(null)}
        onSalvo={() => { setEditando(null); carregar() }}
      />
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">Peças</h1>
        <Botao onClick={() => setEditando({ ...VAZIA })}>
          <span className="inline-flex items-center gap-2"><Plus size={14} strokeWidth={2} /> NOVA PEÇA</span>
        </Botao>
      </div>

      {pecas === null ? (
        <p className="font-stencil text-sm tracking-[0.3em] text-osso/30">CARREGANDO</p>
      ) : pecas.length === 0 ? (
        <div className="border border-dashed border-osso/15 py-20 text-center">
          <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">NENHUMA PEÇA CADASTRADA</p>
          <p className="mt-3 text-sm text-osso/35">Clique em "nova peça" para começar o acervo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pecas.map((p) => {
            const capa = p.peca_fotos?.sort((a, b) => a.ordem - b.ordem)[0]
            return (
              <div key={p.id} className="flex items-center gap-4 border border-osso/10 bg-[#101010] p-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden bg-[#1a1a1a]">
                  {capa ? (
                    <img src={urlArquivo(capa.caminho)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" style={{ background: p.cor_hex }} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-stencil text-xs tracking-[0.25em] text-sangue">
                    {p.codigo}
                    {p.destaque && <Star size={11} strokeWidth={2} className="text-osso/50" />}
                  </p>
                  <p className="truncate text-osso">{p.nome}</p>
                  <p className="text-xs text-osso/40">
                    {STATUS.find(([v]) => v === p.status)?.[1]} · {p.peca_fotos?.length || 0} foto(s)
                  </p>
                </div>

                <span className="shrink-0 font-stencil text-osso">{dinheiro(precoVigente(p))}</span>

                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setEditando(p)} aria-label="Editar" className="p-2 text-osso/50 hover:text-osso">
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => apagar(p)} aria-label="Apagar" className="p-2 text-osso/50 hover:text-sangue">
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Formulario({ inicial, onFechar, onSalvo }) {
  const [f, setF] = useState({
    ...inicial,
    promo_ate: inicial.promo_ate ? inicial.promo_ate.slice(0, 10) : '',
    preco_promo: inicial.preco_promo ?? '',
    closet_slot: inicial.closet_slot || '',
  })
  const [fotos, setFotos] = useState(
    (inicial.peca_fotos || []).slice().sort((a, b) => a.ordem - b.ordem)
  )
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const campo = (k) => ({ value: f[k] ?? '', onChange: (e) => setF({ ...f, [k]: e.target.value }) })

  const salvar = async () => {
    setErro('')
    if (!f.codigo.trim() || !f.nome.trim() || !f.preco) {
      setErro('Código, nome e preço são obrigatórios.')
      return
    }
    setSalvando(true)

    const dados = {
      codigo: f.codigo.trim().toUpperCase(),
      nome: f.nome.trim(),
      detalhe: f.detalhe, historia: f.historia, categoria: f.categoria,
      tamanho: f.tamanho, estado: f.estado, medidas: f.medidas,
      preco: Number(f.preco),
      preco_promo: f.preco_promo ? Number(f.preco_promo) : null,
      promo_ate: f.promo_ate || null,
      status: f.status, destaque: f.destaque, cor_hex: f.cor_hex,
      closet_foto: f.closet_foto || null,
      closet_slot: f.closet_slot || null,
    }

    let pecaId = inicial.id
    if (pecaId) {
      const { error } = await supabase.from('pecas').update(dados).eq('id', pecaId)
      if (error) { setErro(traduzir(error)); setSalvando(false); return }
    } else {
      const { data, error } = await supabase.from('pecas').insert(dados).select('id').single()
      if (error) { setErro(traduzir(error)); setSalvando(false); return }
      pecaId = data.id
    }

    // Regrava a lista de fotos: mais simples e seguro que sincronizar item a item.
    await supabase.from('peca_fotos').delete().eq('peca_id', pecaId)
    if (fotos.length) {
      await supabase.from('peca_fotos').insert(
        fotos.map((foto, i) => ({ peca_id: pecaId, caminho: foto.caminho, ordem: i, alt: f.nome }))
      )
    }

    setSalvando(false)
    onSalvo()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">{inicial.id ? 'Editar peça' : 'Nova peça'}</h1>
        <button onClick={onFechar} aria-label="Fechar" className="text-osso/50 hover:text-osso">
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Código" dica="Aparece para a cliente. Ex: LB-001">
              <Texto {...campo('codigo')} placeholder="LB-001" />
            </Campo>
            <Campo rotulo="Tamanho"><Texto {...campo('tamanho')} placeholder="M, 40, 38..." /></Campo>
          </div>

          <Campo rotulo="Nome"><Texto {...campo('nome')} placeholder="Jaqueta de couro preta" /></Campo>
          <Campo rotulo="Detalhe" dica="Linha curta abaixo do nome">
            <Texto {...campo('detalhe')} placeholder="Biker, ombro estruturado" />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Categoria"><Texto {...campo('categoria')} placeholder="Jaquetas" /></Campo>
            <Campo rotulo="Estado"><Texto {...campo('estado')} placeholder="Ótimo" /></Campo>
          </div>

          <Campo rotulo="Medidas" dica="Ajuda a evitar troca por tamanho">
            <Texto {...campo('medidas')} placeholder="Ombro 42cm, busto 96cm, comprimento 61cm" />
          </Campo>

          <Campo rotulo="História da peça" dica="De onde veio, o que foi consertado">
            <Texto multilinha {...campo('historia')} />
          </Campo>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Preço (R$)"><Texto type="number" step="0.01" {...campo('preco')} placeholder="189.90" /></Campo>
            <Campo rotulo="Preço promocional" dica="Deixe vazio se não houver promoção">
              <Texto type="number" step="0.01" {...campo('preco_promo')} placeholder="149.90" />
            </Campo>
          </div>

          <Campo rotulo="Promoção até" dica="Depois dessa data o preço cheio volta sozinho">
            <Texto type="date" {...campo('promo_ate')} />
          </Campo>

          <Campo rotulo="Status">
            <Selecao opcoes={STATUS} {...campo('status')} />
          </Campo>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox" checked={!!f.destaque}
              onChange={(e) => setF({ ...f, destaque: e.target.checked })}
              className="h-4 w-4 accent-[#E12424]"
            />
            <span className="text-sm text-osso/70">Destaque (ocupa o card grande da vitrine)</span>
          </label>

          <Campo rotulo="Fotos" dica="A primeira é a capa. Clique numa foto para removê-la.">
            <div className="mt-2 space-y-3">
              <BotaoUpload
                rotulo="ADICIONAR FOTOS" bucket="pecas" pasta="fotos" multiplo
                onPronto={(caminhos) => setFotos([...fotos, ...caminhos.map((c) => ({ caminho: c }))])}
              />
              {fotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fotos.map((foto, i) => (
                    <button
                      key={foto.caminho}
                      onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                      className="relative h-20 w-16 overflow-hidden border border-osso/15"
                      title="Remover"
                    >
                      <img src={urlArquivo(foto.caminho)} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-sangue text-[0.55rem] tracking-widest text-osso">CAPA</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Campo>

          <div className="border-t border-osso/10 pt-5">
            <Campo rotulo="Provador virtual" dica="Só funciona com PNG de fundo removido">
              <div className="mt-2 space-y-3">
                <Selecao opcoes={CAMADAS} {...campo('closet_slot')} />
                <BotaoUpload
                  rotulo="FOTO SEM FUNDO (PNG)" aceita="image/png" bucket="pecas" pasta="closet"
                  onPronto={(caminho) => setF({ ...f, closet_foto: caminho })}
                />
                {f.closet_foto && (
                  <div className="flex items-center gap-3">
                    <img src={urlArquivo(f.closet_foto)} alt="" className="h-20 w-16 object-contain" />
                    <button onClick={() => setF({ ...f, closet_foto: null })} className="text-xs text-sangue underline">remover</button>
                  </div>
                )}
              </div>
            </Campo>
          </div>

          <Campo rotulo="Cor de fundo" dica="Usada enquanto a peça não tem foto">
            <input
              type="color" value={f.cor_hex || '#1a1a1a'}
              onChange={(e) => setF({ ...f, cor_hex: e.target.value })}
              className="mt-2 h-11 w-20 cursor-pointer border border-osso/15 bg-transparent"
            />
          </Campo>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4 border-t border-osso/10 pt-6">
        <Botao onClick={salvar} disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR'}</Botao>
        <Botao variante="linha" onClick={onFechar}>CANCELAR</Botao>
        <Aviso tipo="erro">{erro}</Aviso>
      </div>
    </div>
  )
}

function traduzir(error) {
  if (error.code === '23505') return 'Já existe uma peça com esse código.'
  return 'Não foi possível salvar: ' + error.message
}
