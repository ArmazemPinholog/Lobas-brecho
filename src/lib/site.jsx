import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Carrega, uma vez por visita, os textos editáveis e a configuração da loja.
 *
 * Todo texto tem um padrão escrito aqui no código. Se a linha ainda não
 * foi preenchida no painel — ou se alguém apagar sem querer — a página
 * continua fazendo sentido em vez de mostrar um espaço em branco.
 */

const PADROES = {
  'hero.etiqueta': 'ACERVO',
  'hero.titulo1': 'Roupa',
  'hero.titulo2': 'com passado',
  'hero.texto': '',
  'hero.botao': 'VER O ACERVO',
  'acervo.titulo': 'O acervo',
  'acervo.texto': '',
  'manifesto.linha1': 'Duas lobas.',
  'manifesto.linha2': 'Duas forças.',
  'manifesto.linha3': 'Uma energia.',
  'manifesto.texto': '',
  'blog.titulo': 'Blog',
  'blog.texto': '',
  'closet.titulo': 'Closet',
  'closet.texto': 'Monte o look arrastando as peças sobre o manequim.',
  'rodape.titulo': 'Tem peça parada aí?',
  'rodape.texto': '',
}

const CONFIG_PADRAO = {
  whatsapp: '',
  instagram: '',
  email: '',
  endereco: '',
  horario: '',
  entrega_local: '',
  entrega_correios: '',
  aviso_topo: '',
  vendas_ativas: true,
}

const SiteCtx = createContext({ texto: (c) => PADROES[c] || '', config: CONFIG_PADRAO, carregando: true })

export function SiteProvider({ children }) {
  const [textos, setTextos] = useState({})
  const [config, setConfig] = useState(CONFIG_PADRAO)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [t, c] = await Promise.all([
        supabase.from('textos').select('chave, valor'),
        supabase.from('config_loja').select('*').eq('id', 1).maybeSingle(),
      ])
      if (!vivo) return
      if (t.data) setTextos(Object.fromEntries(t.data.map((l) => [l.chave, l.valor])))
      if (c.data) setConfig({ ...CONFIG_PADRAO, ...c.data })
      setCarregando(false)
    })()
    return () => { vivo = false }
  }, [])

  // Valor em branco no banco conta como "não preenchido" e cai no padrão.
  const texto = (chave) => {
    const v = textos[chave]
    return v && v.trim() ? v : PADROES[chave] || ''
  }

  return <SiteCtx.Provider value={{ texto, config, carregando }}>{children}</SiteCtx.Provider>
}

export const useSite = () => useContext(SiteCtx)

/** Link do WhatsApp com mensagem pronta. Sem número configurado, devolve null. */
export function linkWhats(numero, mensagem) {
  const limpo = (numero || '').replace(/\D/g, '')
  if (!limpo) return null
  return `https://wa.me/${limpo}?text=${encodeURIComponent(mensagem)}`
}
