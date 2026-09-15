import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Type, Image, Images, Video, Mic } from 'lucide-react'
import { supabase, urlArquivo } from '../../lib/supabase'
import { Campo, Texto, Botao, Aviso, BotaoUpload } from './ui'

const NOVO = { slug: '', titulo: '', resumo: '', capa: null, blocos: [], publicado: false }

/** Gera o endereço do post a partir do título, sem acento nem espaço. */
function gerarSlug(titulo) {
  return titulo
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 60)
}

export default function AdminBlog() {
  const [posts, setPosts] = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = async () => {
    const { data } = await supabase.from('posts').select('*').order('criado_em', { ascending: false })
    setPosts(data || [])
  }

  useEffect(() => { carregar() }, [])

  const apagar = async (post) => {
    if (!confirm(`Apagar "${post.titulo}"? Isso não tem volta.`)) return
    await supabase.from('posts').delete().eq('id', post.id)
    carregar()
  }

  if (editando) {
    return <Editor inicial={editando} onFechar={() => setEditando(null)} onSalvo={() => { setEditando(null); carregar() }} />
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">Blog</h1>
        <Botao onClick={() => setEditando({ ...NOVO })}>
          <span className="inline-flex items-center gap-2"><Plus size={14} strokeWidth={2} /> NOVO POST</span>
        </Botao>
      </div>

      {posts === null ? (
        <p className="font-stencil text-sm tracking-[0.3em] text-osso/30">CARREGANDO</p>
      ) : posts.length === 0 ? (
        <div className="border border-dashed border-osso/15 py-20 text-center">
          <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">NENHUM POST CRIADO</p>
          <p className="mt-3 text-sm text-osso/35">
            Dá para misturar texto, fotos, galeria, vídeo do YouTube e áudio no mesmo post.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border border-osso/10 bg-[#101010] p-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden bg-[#1a1a1a]">
                {p.capa && <img src={urlArquivo(p.capa, 'diario')} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-osso">{p.titulo}</p>
                <p className="text-xs text-osso/40">
                  {p.publicado ? 'Publicado' : 'Rascunho'} · {(p.blocos || []).length} bloco(s) · /blog/{p.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditando(p)} aria-label="Editar" className="p-2 text-osso/50 hover:text-osso">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => apagar(p)} aria-label="Apagar" className="p-2 text-osso/50 hover:text-sangue">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Editor({ inicial, onFechar, onSalvo }) {
  const [f, setF] = useState({ ...inicial, blocos: inicial.blocos || [] })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const addBloco = (bloco) => setF({ ...f, blocos: [...f.blocos, bloco] })
  const mudarBloco = (i, mudanca) =>
    setF({ ...f, blocos: f.blocos.map((b, j) => (j === i ? { ...b, ...mudanca } : b)) })
  const removerBloco = (i) => setF({ ...f, blocos: f.blocos.filter((_, j) => j !== i) })

  const mover = (i, direcao) => {
    const destino = i + direcao
    if (destino < 0 || destino >= f.blocos.length) return
    const copia = [...f.blocos]
    ;[copia[i], copia[destino]] = [copia[destino], copia[i]]
    setF({ ...f, blocos: copia })
  }

  const salvar = async () => {
    setErro('')
    if (!f.titulo.trim()) { setErro('O título é obrigatório.'); return }
    setSalvando(true)

    const dados = {
      titulo: f.titulo.trim(),
      slug: (f.slug || gerarSlug(f.titulo)).trim(),
      resumo: f.resumo,
      capa: f.capa,
      blocos: f.blocos,
      publicado: f.publicado,
      // A data de publicação é gravada na primeira vez que o post vai ao ar.
      publicado_em: f.publicado ? inicial.publicado_em || new Date().toISOString() : null,
    }

    const { error } = inicial.id
      ? await supabase.from('posts').update(dados).eq('id', inicial.id)
      : await supabase.from('posts').insert(dados)

    setSalvando(false)
    if (error) setErro(error.code === '23505' ? 'Já existe um post com esse endereço.' : error.message)
    else onSalvo()
  }

  const tiposDeBloco = [
    { rotulo: 'Texto',   Icone: Type,   novo: { tipo: 'texto', valor: '' } },
    { rotulo: 'Foto',    Icone: Image,  novo: { tipo: 'imagem', caminho: '', legenda: '' } },
    { rotulo: 'Galeria', Icone: Images, novo: { tipo: 'galeria', itens: [] } },
    { rotulo: 'Vídeo',   Icone: Video,  novo: { tipo: 'video', url: '' } },
    { rotulo: 'Áudio',   Icone: Mic,    novo: { tipo: 'audio', caminho: '', titulo: '', capa: '' } },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">{inicial.id ? 'Editar post' : 'Novo post'}</h1>
        <button onClick={onFechar} aria-label="Fechar" className="text-osso/50 hover:text-osso">
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dados do post */}
        <div className="space-y-5 lg:col-span-1">
          <Campo rotulo="Título">
            <Texto
              value={f.titulo}
              onChange={(e) => setF({ ...f, titulo: e.target.value, slug: inicial.id ? f.slug : gerarSlug(e.target.value) })}
            />
          </Campo>

          <Campo rotulo="Endereço" dica={`O post ficará em /blog/${f.slug || '...'}`}>
            <Texto value={f.slug} onChange={(e) => setF({ ...f, slug: gerarSlug(e.target.value) })} />
          </Campo>

          <Campo rotulo="Resumo" dica="Aparece na listagem do blog">
            <Texto multilinha linhas={3} value={f.resumo || ''} onChange={(e) => setF({ ...f, resumo: e.target.value })} />
          </Campo>

          <Campo rotulo="Capa">
            <div className="mt-2 space-y-3">
              <BotaoUpload bucket="diario" pasta="capas" onPronto={(c) => setF({ ...f, capa: c })} />
              {f.capa && (
                <div className="flex items-center gap-3">
                  <img src={urlArquivo(f.capa, 'diario')} alt="" className="h-16 w-24 object-cover" />
                  <button onClick={() => setF({ ...f, capa: null })} className="text-xs text-sangue underline">remover</button>
                </div>
              )}
            </div>
          </Campo>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox" checked={!!f.publicado}
              onChange={(e) => setF({ ...f, publicado: e.target.checked })}
              className="h-4 w-4 accent-[#E12424]"
            />
            <span className="text-sm text-osso/70">Publicado (visível no site)</span>
          </label>
        </div>

        {/* Blocos de conteúdo */}
        <div className="lg:col-span-2">
          <p className="font-stencil text-xs tracking-[0.25em] text-osso/50">CONTEÚDO</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {tiposDeBloco.map(({ rotulo, Icone, novo }) => (
              <button
                key={rotulo}
                onClick={() => addBloco({ ...novo })}
                className="inline-flex items-center gap-2 border border-osso/20 px-4 py-2 text-xs text-osso/70 transition-colors hover:border-sangue hover:text-osso"
              >
                <Icone size={13} strokeWidth={1.5} /> {rotulo}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {f.blocos.length === 0 && (
              <p className="border border-dashed border-osso/15 p-8 text-center text-sm text-osso/30">
                Adicione blocos acima. Eles aparecem no post na ordem em que estiverem aqui.
              </p>
            )}

            {f.blocos.map((b, i) => (
              <div key={i} className="border border-osso/12 bg-[#101010] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-stencil text-xs tracking-[0.3em] text-sangue">{b.tipo.toUpperCase()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => mover(i, -1)} aria-label="Subir" className="p-1.5 text-osso/40 hover:text-osso"><ArrowUp size={14} strokeWidth={1.5} /></button>
                    <button onClick={() => mover(i, 1)} aria-label="Descer" className="p-1.5 text-osso/40 hover:text-osso"><ArrowDown size={14} strokeWidth={1.5} /></button>
                    <button onClick={() => removerBloco(i)} aria-label="Remover" className="p-1.5 text-osso/40 hover:text-sangue"><Trash2 size={14} strokeWidth={1.5} /></button>
                  </div>
                </div>

                {b.tipo === 'texto' && (
                  <Texto multilinha linhas={6} value={b.valor} onChange={(e) => mudarBloco(i, { valor: e.target.value })} placeholder="Escreva aqui..." />
                )}

                {b.tipo === 'imagem' && (
                  <div className="space-y-3">
                    <BotaoUpload bucket="diario" pasta="posts" onPronto={(c) => mudarBloco(i, { caminho: c })} />
                    {b.caminho && <img src={urlArquivo(b.caminho, 'diario')} alt="" className="max-h-48 object-contain" />}
                    <Texto value={b.legenda || ''} onChange={(e) => mudarBloco(i, { legenda: e.target.value })} placeholder="Legenda (opcional)" />
                  </div>
                )}

                {b.tipo === 'galeria' && (
                  <div className="space-y-3">
                    <BotaoUpload
                      rotulo="ADICIONAR FOTOS" bucket="diario" pasta="posts" multiplo
                      onPronto={(cs) => mudarBloco(i, { itens: [...(b.itens || []), ...cs] })}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(b.itens || []).map((c, j) => (
                        <button
                          key={c} title="Remover"
                          onClick={() => mudarBloco(i, { itens: b.itens.filter((_, k) => k !== j) })}
                          className="h-16 w-16 overflow-hidden border border-osso/15"
                        >
                          <img src={urlArquivo(c, 'diario')} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {b.tipo === 'video' && (
                  <Texto
                    value={b.url} onChange={(e) => mudarBloco(i, { url: e.target.value })}
                    placeholder="Cole o link do YouTube ou Vimeo"
                  />
                )}

                {b.tipo === 'audio' && (
                  <div className="space-y-3">
                    <Texto value={b.titulo || ''} onChange={(e) => mudarBloco(i, { titulo: e.target.value })} placeholder="Título do episódio" />
                    <BotaoUpload rotulo="ENVIAR ÁUDIO" aceita="audio/*" bucket="diario" pasta="audios" onPronto={(c) => mudarBloco(i, { caminho: c })} />
                    {b.caminho && <audio controls src={urlArquivo(b.caminho, 'diario')} className="w-full" />}
                    <BotaoUpload rotulo="CAPA DO ÁUDIO" bucket="diario" pasta="capas" onPronto={(c) => mudarBloco(i, { capa: c })} />
                    {b.capa && <img src={urlArquivo(b.capa, 'diario')} alt="" className="h-20 w-20 object-cover" />}
                  </div>
                )}
              </div>
            ))}
          </div>
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
