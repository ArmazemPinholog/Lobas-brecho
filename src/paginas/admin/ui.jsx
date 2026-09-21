import { useState } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/* Peças de formulário reaproveitadas por todas as abas do painel. */

export function Campo({ rotulo, dica, children }) {
  return (
    <label className="block">
      <span className="font-stencil text-xs tracking-[0.25em] text-osso/50">{rotulo.toUpperCase()}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-osso/30">{dica}</span>}
    </label>
  )
}

const baseInput =
  'mt-2 w-full border border-osso/15 bg-[#141414] px-4 py-3 text-osso placeholder:text-osso/25 focus:border-sangue focus:outline-none'

export function Texto({ multilinha, linhas = 4, ...props }) {
  return multilinha ? (
    <textarea rows={linhas} {...props} className={baseInput} />
  ) : (
    <input {...props} className={baseInput} />
  )
}

export function Selecao({ opcoes, ...props }) {
  return (
    <select {...props} className={baseInput}>
      {opcoes.map(([valor, rotulo]) => (
        <option key={valor} value={valor}>{rotulo}</option>
      ))}
    </select>
  )
}

export function Botao({ children, variante = 'solido', ...props }) {
  const estilos = {
    solido: 'bg-sangue text-osso hover:bg-osso hover:text-breu',
    linha: 'border border-osso/25 text-osso hover:border-osso',
    perigo: 'border border-sangue/50 text-sangue hover:bg-sangue hover:text-osso',
  }
  return (
    <button
      {...props}
      className={`px-6 py-3 font-stencil text-xs tracking-[0.3em] transition-colors disabled:opacity-40 ${estilos[variante]}`}
    >
      {children}
    </button>
  )
}

export function Aviso({ tipo = 'ok', children }) {
  if (!children) return null
  return (
    <p className={`text-sm ${tipo === 'ok' ? 'text-osso/70' : 'text-sangue'}`}>{children}</p>
  )
}

/**
 * Redimensiona e recomprime uma imagem no navegador antes do upload.
 * PNG mantém a transparência (o provador virtual depende dela) e só é
 * redimensionado; os outros formatos viram JPEG, bem mais leve para
 * fotos comuns. Qualquer erro no canvas devolve o arquivo original —
 * a foto nunca deixa de subir por causa da otimização.
 */
async function comprimirImagem(arquivo, { maxLargura = 1600, maxAltura = 1600, qualidade = 0.82 } = {}) {
  if (!arquivo.type?.startsWith('image/') || arquivo.type === 'image/svg+xml') return arquivo

  try {
    const bitmap = await createImageBitmap(arquivo)
    const escala = Math.min(1, maxLargura / bitmap.width, maxAltura / bitmap.height)

    // Já é pequena: reprocessar só gastaria bateria à toa.
    if (escala >= 1 && arquivo.size < 400_000) {
      bitmap.close?.()
      return arquivo
    }

    const largura = Math.max(1, Math.round(bitmap.width * escala))
    const altura = Math.max(1, Math.round(bitmap.height * escala))
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    canvas.getContext('2d').drawImage(bitmap, 0, 0, largura, altura)
    bitmap.close?.()

    const manterAlpha = arquivo.type === 'image/png'
    const tipoSaida = manterAlpha ? 'image/png' : 'image/jpeg'
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, tipoSaida, qualidade))
    if (!blob || blob.size >= arquivo.size) return arquivo

    const nomeBase = arquivo.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${nomeBase}.${manterAlpha ? 'png' : 'jpg'}`, { type: tipoSaida })
  } catch {
    return arquivo
  }
}

/**
 * Envia um arquivo para o Storage e devolve o caminho salvo.
 * O nome ganha data e sufixo aleatório: dois arquivos "frente.jpg"
 * de peças diferentes não se sobrescrevem.
 */
export async function enviarArquivo(arquivo, bucket, pasta = '', { comprimir = true } = {}) {
  const arquivoFinal = comprimir ? await comprimirImagem(arquivo) : arquivo
  const extensao = arquivoFinal.name.split('.').pop().toLowerCase()
  const nome = `${pasta ? pasta + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`
  const { error } = await supabase.storage.from(bucket).upload(nome, arquivoFinal, { cacheControl: '31536000' })
  if (error) throw error
  return nome
}

/** Botão de envio de arquivo com estado de carregamento embutido. */
export function BotaoUpload({ rotulo = 'ENVIAR ARQUIVO', aceita = 'image/*', bucket, pasta, multiplo = false, comprimir = true, onPronto }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const selecionar = async (e) => {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return
    setEnviando(true)
    setErro('')
    try {
      const caminhos = []
      for (const a of arquivos) caminhos.push(await enviarArquivo(a, bucket, pasta, { comprimir }))
      onPronto(multiplo ? caminhos : caminhos[0])
    } catch (err) {
      setErro('Falha no envio: ' + err.message)
    } finally {
      setEnviando(false)
      e.target.value = ''   // permite reenviar o mesmo arquivo
    }
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 border border-osso/25 px-5 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:border-sangue">
        <Upload size={14} strokeWidth={1.5} />
        {enviando ? 'ENVIANDO...' : rotulo}
        <input type="file" accept={aceita} multiple={multiplo} onChange={selecionar} disabled={enviando} className="hidden" />
      </label>
      {erro && <p className="mt-2 text-xs text-sangue">{erro}</p>}
    </div>
  )
}
