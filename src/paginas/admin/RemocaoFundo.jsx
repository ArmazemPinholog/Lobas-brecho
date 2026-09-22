import { useEffect, useRef, useState } from 'react'
import { Wand2, Eraser, Brush, Undo2 } from 'lucide-react'
import { enviarArquivo } from './ui'

/**
 * Depois que a IA de remoção de fundo termina, sobra sempre um resto de
 * "poluição visual" na borda: uma franja de 1-2px com a cor do fundo antigo
 * misturada (halo), e uma margem grande de transparência ao redor da peça
 * (a resolução que a IA processa é sempre quadrada/fixa, não do tamanho da
 * roupa). Isso faz cada peça aparecer em escala diferente no provador e
 * deixa uma auréola sutil ao redor do tecido, meio "colada". Esta função
 * arruma as duas coisas, sem nenhuma IA extra — é só matemática de pixel:
 *
 * 1) Encolhe (erode) o canal alfa em ~1px: qualquer pixel de borda que
 *    ainda carregue um pouco da cor do fundo antigo é cortado fora junto
 *    com a transparência, em vez de ficar como uma franja colorida.
 * 2) Suaviza (feather) essa borda já encolhida, pra não sobrar serrilhado.
 * 3) Recorta a imagem pro retângulo exato da peça (bounding box do que
 *    sobrou visível, com uma margem pequena) — assim toda peça cadastrada
 *    fica na mesma escala relativa dentro do próprio arquivo, e o Closet
 *    não precisa mais compensar peça por peça na hora de exibir.
 *
 * Roda duas vezes no fluxo: uma vez assim que a IA termina, e de novo
 * depois que a lojista apaga à mão o que sobrou (mesma limpeza de borda,
 * agora encaixando o traço da borracha).
 */
async function refinarRecorte(fonte) {
  try {
    const bitmap = fonte instanceof HTMLCanvasElement ? fonte : await createImageBitmap(fonte)
    const largura = bitmap.width
    const altura = bitmap.height
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close?.()

    const imagem = ctx.getImageData(0, 0, largura, altura)
    const dados = imagem.data
    const total = largura * altura

    const alfaOriginal = new Uint8ClampedArray(total)
    for (let i = 0; i < total; i++) alfaOriginal[i] = dados[i * 4 + 3]

    const vizinhoMinimo = (origem, x, y) => {
      let minimo = origem[y * largura + x]
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || ny < 0 || nx >= largura || ny >= altura) continue
          const v = origem[ny * largura + nx]
          if (v < minimo) minimo = v
        }
      }
      return minimo
    }

    const erodido = new Uint8ClampedArray(total)
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) erodido[y * largura + x] = vizinhoMinimo(alfaOriginal, x, y)
    }

    const suavizado = new Uint8ClampedArray(total)
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let soma = 0, contagem = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy
            if (nx < 0 || ny < 0 || nx >= largura || ny >= altura) continue
            soma += erodido[ny * largura + nx]
            contagem++
          }
        }
        suavizado[y * largura + x] = soma / contagem
      }
    }

    for (let i = 0; i < total; i++) dados[i * 4 + 3] = suavizado[i]
    ctx.putImageData(imagem, 0, 0)

    let minX = largura, minY = altura, maxX = 0, maxY = 0
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        if (dados[(y * largura + x) * 4 + 3] > 8) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    // Nada detectado (a lojista apagou tudo) — devolve a imagem como estava.
    if (maxX <= minX || maxY <= minY) return canvas

    const margem = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02)
    minX = Math.max(0, minX - margem)
    minY = Math.max(0, minY - margem)
    maxX = Math.min(largura - 1, maxX + margem)
    maxY = Math.min(altura - 1, maxY + margem)

    const larguraFinal = maxX - minX + 1
    const alturaFinal = maxY - minY + 1
    const canvasFinal = document.createElement('canvas')
    canvasFinal.width = larguraFinal
    canvasFinal.height = alturaFinal
    canvasFinal.getContext('2d').drawImage(canvas, minX, minY, larguraFinal, alturaFinal, 0, 0, larguraFinal, alturaFinal)

    return canvasFinal
  } catch {
    // Qualquer falha devolve a fonte como veio — o refinamento é só um
    // bônus, nunca pode travar o fluxo de cadastro.
    return fonte
  }
}

const canvasParaBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))

/**
 * Carimba um círculo macio (borda com degradê, não serrilhada) no ponto (x,y).
 * "apagar" usa destination-out pra virar transparência; "restaurar" recorta
 * um círculo e desenha por cima o canvas original guardado antes de qualquer
 * traço — devolve o que a borracha tirou sem perder o resto do trabalho.
 */
function carimbar(ctx, x, y, raio, ferramenta, canvasOriginal) {
  ctx.save()
  if (ferramenta === 'apagar') {
    ctx.globalCompositeOperation = 'destination-out'
    const grad = ctx.createRadialGradient(x, y, 0, x, y, raio)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.72, 'rgba(0,0,0,1)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, raio, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(x, y, raio, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(canvasOriginal, 0, 0)
  }
  ctx.restore()
}

/**
 * Editor de retoque manual: a peça já processada pela IA aparece num canvas
 * de verdade (não uma <img>), então dá pra apagar com o mouse (ou o dedo, no
 * celular) qualquer resto que a remoção automática não conseguiu tirar —
 * como um objeto atrás da roupa que ficou colado junto. "Restaurar" faz o
 * caminho contrário, caso a lojista apague um pedaço da própria peça sem
 * querer, e "desfazer" volta um traço por vez.
 */
function EditorRecorte({ canvasInicial, onFinalizar, onDescartar, enviando }) {
  const canvasRef = useRef(null)
  const canvasOriginalRef = useRef(null)
  const historicoRef = useRef([])
  const desenhandoRef = useRef(false)
  const ultimoPontoRef = useRef(null)
  const containerRef = useRef(null)

  const [ferramenta, setFerramenta] = useState('apagar')
  const [tamanhoPincel, setTamanhoPincel] = useState(36)
  const [podeDesfazer, setPodeDesfazer] = useState(false)
  const [cursor, setCursor] = useState(null) // {xTela, yTela, raioTela}

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = canvasInicial.width
    canvas.height = canvasInicial.height
    canvas.getContext('2d').drawImage(canvasInicial, 0, 0)

    const original = document.createElement('canvas')
    original.width = canvasInicial.width
    original.height = canvasInicial.height
    original.getContext('2d').drawImage(canvasInicial, 0, 0)
    canvasOriginalRef.current = original

    historicoRef.current = []
    setPodeDesfazer(false)
    // canvasInicial só deveria trocar quando a lojista escolhe outra foto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasInicial])

  const paraCanvasXY = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const escalaX = canvas.width / rect.width
    const escalaY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * escalaX,
      y: (e.clientY - rect.top) * escalaY,
      xTela: e.clientX - rect.left,
      yTela: e.clientY - rect.top,
      escalaX,
    }
  }

  const salvarHistorico = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    historicoRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (historicoRef.current.length > 15) historicoRef.current.shift()
    setPodeDesfazer(true)
  }

  const desfazer = () => {
    const anterior = historicoRef.current.pop()
    if (!anterior) return
    canvasRef.current.getContext('2d').putImageData(anterior, 0, 0)
    setPodeDesfazer(historicoRef.current.length > 0)
  }

  const iniciarTraco = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    salvarHistorico()
    desenhandoRef.current = true
    const p = paraCanvasXY(e)
    ultimoPontoRef.current = p
    const ctx = canvasRef.current.getContext('2d')
    const raioCanvas = tamanhoPincel * p.escalaX
    carimbar(ctx, p.x, p.y, raioCanvas, ferramenta, canvasOriginalRef.current)
  }

  const moverTraco = (e) => {
    const p = paraCanvasXY(e)
    setCursor({ xTela: p.xTela, yTela: p.yTela, raioTela: tamanhoPincel })
    if (!desenhandoRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const raioCanvas = tamanhoPincel * p.escalaX
    const anterior = ultimoPontoRef.current || p
    const dist = Math.hypot(p.x - anterior.x, p.y - anterior.y)
    const passos = Math.max(1, Math.ceil(dist / (raioCanvas * 0.35)))
    for (let i = 1; i <= passos; i++) {
      const x = anterior.x + (p.x - anterior.x) * (i / passos)
      const y = anterior.y + (p.y - anterior.y) * (i / passos)
      carimbar(ctx, x, y, raioCanvas, ferramenta, canvasOriginalRef.current)
    }
    ultimoPontoRef.current = p
  }

  const finalizarTraco = () => {
    desenhandoRef.current = false
    ultimoPontoRef.current = null
  }

  const concluir = async () => {
    const refinado = await refinarRecorte(canvasRef.current)
    const blob = refinado instanceof HTMLCanvasElement ? await canvasParaBlob(refinado) : refinado
    onFinalizar(blob)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-osso/40">
        Apague com o mouse (ou o dedo) qualquer resto que a remoção automática não conseguiu tirar —
        um objeto atrás da peça, um pedacinho de fundo esquecido. Errou? "Restaurar" pinta de volta,
        e "desfazer" volta o último traço.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden border border-osso/15">
          <button
            type="button"
            onClick={() => setFerramenta('apagar')}
            className={`flex items-center gap-2 px-4 py-2 font-stencil text-xs tracking-[0.25em] transition-colors ${
              ferramenta === 'apagar' ? 'bg-sangue text-osso' : 'text-osso/50 hover:text-osso'
            }`}
          >
            <Eraser size={14} strokeWidth={1.5} /> APAGAR
          </button>
          <button
            type="button"
            onClick={() => setFerramenta('restaurar')}
            className={`flex items-center gap-2 px-4 py-2 font-stencil text-xs tracking-[0.25em] transition-colors ${
              ferramenta === 'restaurar' ? 'bg-sangue text-osso' : 'text-osso/50 hover:text-osso'
            }`}
          >
            <Brush size={14} strokeWidth={1.5} /> RESTAURAR
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-osso/50">
          PINCEL
          <input
            type="range" min={8} max={90} value={tamanhoPincel}
            onChange={(e) => setTamanhoPincel(Number(e.target.value))}
            className="w-28 accent-sangue"
          />
        </label>

        <button
          type="button"
          onClick={desfazer}
          disabled={!podeDesfazer}
          className="flex items-center gap-2 text-xs text-osso/50 hover:text-osso disabled:opacity-30"
        >
          <Undo2 size={14} strokeWidth={1.5} /> desfazer
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative inline-block touch-none select-none"
        style={{
          backgroundColor: '#2a2a2a',
          backgroundImage:
            'linear-gradient(45deg, #3a3a3a 25%, transparent 25%), linear-gradient(-45deg, #3a3a3a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3a3a3a 75%), linear-gradient(-45deg, transparent 75%, #3a3a3a 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-80 w-64 cursor-none object-contain"
          onPointerDown={iniciarTraco}
          onPointerMove={moverTraco}
          onPointerUp={finalizarTraco}
          onPointerLeave={() => { finalizarTraco(); setCursor(null) }}
          onPointerCancel={finalizarTraco}
        />
        {cursor && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full border border-osso/70"
            style={{
              left: cursor.xTela - cursor.raioTela,
              top: cursor.yTela - cursor.raioTela,
              width: cursor.raioTela * 2,
              height: cursor.raioTela * 2,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={concluir} disabled={enviando}
          className="bg-sangue px-5 py-2.5 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:bg-osso hover:text-breu disabled:opacity-40"
        >
          {enviando ? 'SALVANDO...' : 'USAR ESTA FOTO'}
        </button>
        <button
          onClick={onDescartar} disabled={enviando}
          className="text-xs text-osso/40 underline underline-offset-4 hover:text-osso/70"
        >
          descartar e tentar outra
        </button>
      </div>
    </div>
  )
}

/**
 * Remove o fundo da foto direto no navegador da lojista, sem servidor
 * nem custo por imagem. A biblioteca @imgly/background-removal é pesada
 * (baixa um modelo de alguns MB) — por isso o import é dinâmico: só entra
 * no navegador quando este botão é realmente usado, nunca no carregamento
 * normal do site ou do painel.
 */
export default function RemocaoFundo({ bucket, pasta, onPronto }) {
  const [estado, setEstado] = useState('ocioso') // ocioso | processando | pronto | erro
  const [progresso, setProgresso] = useState(0)
  const [canvasPronto, setCanvasPronto] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const processar = async (arquivo) => {
    setEstado('processando')
    setProgresso(0)
    setErro('')
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const resultado = await removeBackground(arquivo, {
        progress: (_etapa, atual, total) => {
          if (total) setProgresso(Math.round((atual / total) * 100))
        },
      })
      const refinado = await refinarRecorte(resultado)
      setCanvasPronto(refinado)
      setEstado('pronto')
    } catch {
      setErro('Não foi possível remover o fundo automaticamente agora. Envie um PNG já sem fundo abaixo.')
      setEstado('erro')
    }
  }

  const aoSelecionar = (e) => {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (arquivo) processar(arquivo)
  }

  const usar = async (blob) => {
    setEnviando(true)
    try {
      const arquivo = new File([blob], 'sem-fundo.png', { type: 'image/png' })
      const caminho = await enviarArquivo(arquivo, bucket, pasta)
      onPronto(caminho)
      descartar()
    } catch (err) {
      setErro('Falha ao salvar a imagem: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  const descartar = () => {
    setCanvasPronto(null)
    setEstado('ocioso')
    setProgresso(0)
  }

  return (
    <div className="space-y-3">
      {estado !== 'pronto' && (
        <label className="inline-flex cursor-pointer items-center gap-2 border border-osso/25 px-5 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:border-sangue">
          <Wand2 size={14} strokeWidth={1.5} />
          {estado === 'processando' ? `REMOVENDO FUNDO... ${progresso}%` : 'REMOVER FUNDO AUTOMATICAMENTE'}
          <input
            type="file" accept="image/*" onChange={aoSelecionar}
            disabled={estado === 'processando'} className="hidden"
          />
        </label>
      )}

      {estado === 'processando' && (
        <div className="h-1 w-full max-w-xs overflow-hidden bg-osso/10">
          <div className="h-full bg-sangue transition-all duration-300" style={{ width: `${progresso}%` }} />
        </div>
      )}

      {erro && <p className="text-xs text-sangue">{erro}</p>}

      {estado === 'pronto' && canvasPronto && (
        <EditorRecorte
          canvasInicial={canvasPronto}
          onFinalizar={usar}
          onDescartar={descartar}
          enviando={enviando}
        />
      )}
    </div>
  )
}
