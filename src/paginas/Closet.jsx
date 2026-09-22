import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react'
import { supabase, urlArquivo, precoVigente, dinheiro } from '../lib/supabase'
import { useSite } from '../lib/site'
import { useCarrinho } from '../lib/carrinho'
import { Carregando, ErroCarregamento } from '../components/Estado'
import { useTitulo } from '../hooks/useTitulo'

// Mesmo motivo do Hero: three.js/@react-three/fiber só carregam quando o
// Closet realmente monta, sem pesar no bundle principal do site.
const ManequimScene = lazy(() => import('../three/ManequimScene'))

/**
 * O manequim 3D é iluminado por três luzes fixas (ManequimScene.jsx): uma
 * luz quente vindo de cima-direita, um reflexo vermelho vindo de baixo-
 * esquerda, e uma luz de preenchimento por baixo. A foto da peça, em si, foi
 * fotografada com a luz do ambiente da lojista — quase nunca bate com esse
 * mesmo ângulo. É esse descompasso de luz, mais do que a colagem em si, que
 * faz a peça "não pertencer" ao manequim. Corrigir isso não precisa de IA
 * generativa: um gradiente pintado só por cima dos pixels já visíveis da
 * própria peça (globalCompositeOperation="source-atop" usa o alfa da peça
 * como máscara automática) já imita o mesmo rig de luz — sem inventar
 * textura nova, só reencenando a mesma luz que já ilumina o corpo por baixo.
 */
const cacheIluminado = new Map()

function useFotoIluminada(src) {
  const [saida, setSaida] = useState(() => cacheIluminado.get(src) || src)

  useEffect(() => {
    if (!src) return
    if (cacheIluminado.has(src)) {
      setSaida(cacheIluminado.get(src))
      return
    }
    let vivo = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!vivo) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        // A partir daqui só pinta em cima do que já é opaco na peça —
        // o resto do canvas (transparente) fica intocado.
        ctx.globalCompositeOperation = 'source-atop'

        const luzGeral = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        luzGeral.addColorStop(0, 'rgba(242,239,233,0.32)')
        luzGeral.addColorStop(0.35, 'rgba(242,239,233,0.06)')
        luzGeral.addColorStop(0.6, 'rgba(0,0,0,0)')
        luzGeral.addColorStop(1, 'rgba(0,0,0,0.34)')
        ctx.fillStyle = luzGeral
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const reflexoRubro = ctx.createLinearGradient(canvas.width * 0.42, 0, 0, 0)
        reflexoRubro.addColorStop(0, 'rgba(225,36,36,0)')
        reflexoRubro.addColorStop(1, 'rgba(225,36,36,0.2)')
        ctx.fillStyle = reflexoRubro
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const url = canvas.toDataURL('image/png')
        cacheIluminado.set(src, url)
        setSaida(url)
      } catch {
        // Foto de outra origem sem cabeçalho CORS liberado: o canvas fica
        // "contaminado" e não deixa exportar. Sem problema — a peça
        // continua aparecendo normalmente, só sem o retoque de luz.
        cacheIluminado.set(src, src)
        setSaida(src)
      }
    }
    img.onerror = () => setSaida(src)
    img.src = src
    return () => { vivo = false }
  }, [src])

  return saida
}

// Limite do arrasto: NÃO é o tamanho do palco. O framer-motion, com
// dragConstraints ligado a um elemento, trava a CAIXA INTEIRA da peça
// dentro da caixa do palco — e como a foto já ocupa quase toda a largura
// do palco (pra aparecer num tamanho decente), sobrava uma margem mínima
// antes de travar na borda, dando a sensação de "não consigo arrastar pro
// lugar certo". Uma folga fixa e generosa (bem maior que o palco) resolve:
// o palco já corta visualmente o que passa da borda (overflow-hidden), então
// arrastar a peça mais longe só desliza ela até quase sair de vista, sem
// nunca travar antes da hora.
const FOLGA_ARRASTO = { left: -260, right: 260, top: -320, bottom: 320 }

/** Uma peça vestida no manequim: arrasto, escala e o retoque de luz por cima. */
function PecaVestida({ v, ajustar }) {
  const fonteOriginal = urlArquivo(v.peca.closet_foto)
  const fonte = useFotoIluminada(fonteOriginal)

  return (
    <motion.img
      src={fonte}
      alt={v.peca.nome}
      drag
      dragConstraints={FOLGA_ARRASTO}
      dragElastic={0.15}
      dragMomentum={false}
      onDragEnd={(_, info) => ajustar(v.peca.id, { x: v.x + info.offset.x, y: v.y + info.offset.y })}
      style={{
        zIndex: CAMADAS[v.peca.closet_slot] || 25,
        scale: v.escala,
        // Sombra colada na própria peça: acompanha arraste e escala
        // automaticamente (é filtro, não elemento separado) — separa a
        // peça do fundo, como se estivesse apoiada no corpo, não boiando
        // por cima da foto.
        filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.55)) drop-shadow(0 2px 5px rgba(0,0,0,0.4)) drop-shadow(0 0 1px rgba(0,0,0,0.3))',
      }}
      className="absolute inset-0 m-auto max-h-[78%] w-auto cursor-grab object-contain active:cursor-grabbing"
      data-cursor="Arraste"
    />
  )
}

/**
 * Provador: peças com PNG de fundo removido são empilhadas sobre um manequim.
 * A ordem das camadas é fixa — calça sempre abaixo da camisa, casaco por cima —
 * senão o look monta invertido e parece defeito.
 */
const CAMADAS = {
  corpo_inteiro: 20,
  baixo: 10,
  topo: 30,
  sobreposicao: 40,
  calcado: 5,
  acessorio: 50,
}

const NOMES_CAMADA = {
  corpo_inteiro: 'Inteiro',
  baixo: 'Parte de baixo',
  topo: 'Parte de cima',
  sobreposicao: 'Sobreposição',
  calcado: 'Calçado',
  acessorio: 'Acessório',
}

export default function Closet() {
  const { texto } = useSite()
  const { adicionar } = useCarrinho()
  useTitulo('Closet', 'Monte o look no provador virtual da Lobas Brechó.')
  const palco = useRef(null)

  const [disponiveis, setDisponiveis] = useState(null)
  const [erroDisponiveis, setErroDisponiveis] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [vestidas, setVestidas] = useState([])   // { peca, x, y, escala }
  const [genero, setGenero] = useState('masculino')

  useEffect(() => {
    let vivo = true
    setDisponiveis(null)
    setErroDisponiveis(false)
    supabase
      .from('pecas')
      .select('*')
      .eq('status', 'disponivel')
      .not('closet_foto', 'is', null)
      .order('criada_em', { ascending: false })
      .then(({ data, error }) => {
        if (!vivo) return
        error ? setErroDisponiveis(true) : setDisponiveis(data || [])
      })
    return () => { vivo = false }
  }, [tentativa])

  const vestir = (peca) => {
    setVestidas((atual) => {
      // Trocar de peça na mesma camada substitui, em vez de sobrepor duas calças.
      const semMesmaCamada = atual.filter((v) => v.peca.closet_slot !== peca.closet_slot)
      if (atual.some((v) => v.peca.id === peca.id)) return atual.filter((v) => v.peca.id !== peca.id)
      return [...semMesmaCamada, { peca, x: 0, y: 0, escala: 1 }]
    })
  }

  const ajustar = (id, mudanca) =>
    setVestidas((atual) => atual.map((v) => (v.peca.id === id ? { ...v, ...mudanca } : v)))

  const total = vestidas.reduce((s, v) => s + precoVigente(v.peca), 0)

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-28 pt-40 md:px-12">
      <header className="mb-12">
        <h1 className="font-display text-6xl uppercase leading-[0.88] text-osso md:text-8xl">{texto('closet.titulo')}</h1>
        <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-osso/50">{texto('closet.texto')}</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Manequim */}
        <div className="col-span-12 lg:col-span-7">
          {/* Escolha do manequim: define só a forma do corpo por baixo —
              as peças já vestidas continuam nos mesmos x/y, então trocar
              aqui não desmonta o look. */}
          <div className="mx-auto mb-4 flex max-w-[34rem] gap-2">
            {[
              { valor: 'masculino', rotulo: 'MASCULINO' },
              { valor: 'feminino', rotulo: 'FEMININO' },
            ].map((opcao) => (
              <button
                key={opcao.valor}
                onClick={() => setGenero(opcao.valor)}
                aria-pressed={genero === opcao.valor}
                className={`flex-1 border px-4 py-2.5 font-stencil text-xs tracking-[0.3em] transition-colors ${
                  genero === opcao.valor
                    ? 'border-sangue bg-sangue/10 text-osso'
                    : 'border-osso/12 text-osso/45 hover:border-osso/30 hover:text-osso/70'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>

          <div
            ref={palco}
            className="relative mx-auto aspect-[3/4] w-full max-w-[34rem] overflow-hidden border border-osso/10 bg-gradient-to-b from-[#161616] to-[#0d0d0d]"
          >
            <div className="absolute inset-0">
              <Suspense fallback={null}>
                <ManequimScene genero={genero} />
              </Suspense>
            </div>

            {/* Sombra de contato no "chão" do palco — sem ela o manequim
                parece flutuar. Fixa, não acompanha as peças individualmente,
                mas ancora a composição inteira num mesmo espaço. */}
            {vestidas.length > 0 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[6%] left-1/2 h-8 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-xl"
              />
            )}

            {vestidas.map((v) => (
              <PecaVestida key={v.peca.id} v={v} ajustar={ajustar} />
            ))}

            {vestidas.length === 0 && (
              <p className="absolute inset-x-0 bottom-6 text-center font-stencil text-xs tracking-[0.3em] text-osso/25">
                ESCOLHA UMA PEÇA AO LADO
              </p>
            )}
          </div>

          {vestidas.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-[34rem] flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setVestidas([])}
                className="inline-flex items-center gap-2 font-stencil text-xs tracking-[0.3em] text-osso/50 transition-colors hover:text-sangue"
              >
                <RotateCcw size={14} strokeWidth={1.5} /> LIMPAR
              </button>
              <div className="flex items-center gap-5">
                <span className="font-stencil text-xs tracking-[0.3em] text-osso/50">LOOK: {dinheiro(total)}</span>
                <button
                  onClick={() => vestidas.forEach((v) => adicionar(v.peca))}
                  className="inline-flex items-center gap-2 bg-sangue px-6 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:bg-osso hover:text-breu"
                >
                  <ShoppingBag size={14} strokeWidth={1.5} /> LEVAR O LOOK
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Arara */}
        <aside className="col-span-12 lg:col-span-5">
          <p className="mb-5 font-stencil text-xs tracking-[0.4em] text-sangue">PEÇAS DISPONÍVEIS</p>

          {erroDisponiveis ? (
            <ErroCarregamento
              className="py-10"
              mensagem="Não foi possível carregar as peças do provador."
              onTentar={() => setTentativa((t) => t + 1)}
            />
          ) : disponiveis === null ? (
            <Carregando className="py-10" />
          ) : disponiveis.length === 0 ? (
            <div className="border border-dashed border-osso/15 p-10 text-center">
              <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">PROVADOR VAZIO</p>
              <p className="mt-3 text-sm leading-relaxed text-osso/35">
                Aparecem aqui as peças que tiverem a foto sem fundo cadastrada no painel.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[40rem] grid-cols-3 gap-3 overflow-y-auto pr-2">
              {disponiveis.map((p) => {
                const vestida = vestidas.some((v) => v.peca.id === p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => vestir(p)}
                    className={`group relative aspect-square overflow-hidden border p-2 transition-colors ${vestida ? 'border-sangue bg-sangue/10' : 'border-osso/12 hover:border-osso/40'}`}
                    title={p.nome}
                  >
                    <img src={urlArquivo(p.closet_foto)} alt={p.nome} loading="lazy" className="h-full w-full object-contain" />
                    <span className="absolute inset-x-0 bottom-0 bg-breu/75 px-1 py-1 text-[0.6rem] leading-tight text-osso/70">
                      {NOMES_CAMADA[p.closet_slot] || 'Peça'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Ajuste fino de cada peça no manequim */}
          {vestidas.length > 0 && (
            <div className="mt-8 space-y-3 border-t border-osso/10 pt-6">
              {vestidas.map((v) => (
                <div key={v.peca.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-osso/70">{v.peca.nome}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => ajustar(v.peca.id, { escala: Math.max(0.5, v.escala - 0.08) })}
                      aria-label="Diminuir" className="p-2 text-osso/40 hover:text-osso"
                    >
                      <Minus size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => ajustar(v.peca.id, { escala: Math.min(1.8, v.escala + 0.08) })}
                      aria-label="Aumentar" className="p-2 text-osso/40 hover:text-osso"
                    >
                      <Plus size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => vestir(v.peca)}
                      aria-label="Tirar" className="p-2 text-osso/40 hover:text-sangue"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
