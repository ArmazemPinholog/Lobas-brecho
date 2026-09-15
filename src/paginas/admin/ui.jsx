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
 * Envia um arquivo para o Storage e devolve o caminho salvo.
 * O nome ganha data e sufixo aleatório: dois arquivos "frente.jpg"
 * de peças diferentes não se sobrescrevem.
 */
export async function enviarArquivo(arquivo, bucket, pasta = '') {
  const extensao = arquivo.name.split('.').pop().toLowerCase()
  const nome = `${pasta ? pasta + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`
  const { error } = await supabase.storage.from(bucket).upload(nome, arquivo, { cacheControl: '31536000' })
  if (error) throw error
  return nome
}

/** Botão de envio de arquivo com estado de carregamento embutido. */
export function BotaoUpload({ rotulo = 'ENVIAR ARQUIVO', aceita = 'image/*', bucket, pasta, multiplo = false, onPronto }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const selecionar = async (e) => {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return
    setEnviando(true)
    setErro('')
    try {
      const caminhos = []
      for (const a of arquivos) caminhos.push(await enviarArquivo(a, bucket, pasta))
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
