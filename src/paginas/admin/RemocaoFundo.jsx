import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { enviarArquivo } from './ui'

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
  const [previaUrl, setPreviaUrl] = useState(null)
  const [blobPronto, setBlobPronto] = useState(null)
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
      setBlobPronto(resultado)
      setPreviaUrl(URL.createObjectURL(resultado))
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

  const usar = async () => {
    if (!blobPronto) return
    setEnviando(true)
    try {
      const arquivo = new File([blobPronto], 'sem-fundo.png', { type: 'image/png' })
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
    if (previaUrl) URL.revokeObjectURL(previaUrl)
    setPreviaUrl(null)
    setBlobPronto(null)
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

      {estado === 'pronto' && previaUrl && (
        <div className="space-y-3">
          <p className="text-xs text-osso/40">
            Confira o recorte antes de salvar — o fundo quadriculado é só pra mostrar a transparência.
          </p>
          <div
            className="inline-block h-40 w-32"
            style={{
              backgroundColor: '#2a2a2a',
              backgroundImage:
                'linear-gradient(45deg, #3a3a3a 25%, transparent 25%), linear-gradient(-45deg, #3a3a3a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3a3a3a 75%), linear-gradient(-45deg, transparent 75%, #3a3a3a 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            <img src={previaUrl} alt="Prévia da foto sem fundo" className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={usar} disabled={enviando}
              className="bg-sangue px-5 py-2.5 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:bg-osso hover:text-breu disabled:opacity-40"
            >
              {enviando ? 'SALVANDO...' : 'USAR ESTA FOTO'}
            </button>
            <button
              onClick={descartar} disabled={enviando}
              className="text-xs text-osso/40 underline underline-offset-4 hover:text-osso/70"
            >
              descartar e tentar outra
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
