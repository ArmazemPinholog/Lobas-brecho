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
  'como.titulo': 'Como funciona',
  'como.texto': 'Do garimpo até a peça na sua mão — o passo a passo de como a gente vende por aqui.',
  'como.garimpo_titulo': 'Garimpo e reserva de 1 hora',
  'como.garimpo_texto': 'Cada peça é única. Ao colocar na sacola, ela fica reservada só pra você por 1 hora enquanto vocês combinam os detalhes no WhatsApp — depois disso, volta pro acervo pra quem mais quiser.',
  'como.entrega_titulo': 'Entrega só em Curitiba',
  'como.entrega_texto': 'Por enquanto entregamos apenas em Curitiba, combinado direto pelo WhatsApp. Fora da cidade ainda não rola — mas fica de olho, isso pode mudar.',
  'como.pagamento_titulo': 'Pagamento fora do site',
  'como.pagamento_texto': 'Não vendemos direto por aqui: depois de reservar a peça, a forma de pagamento e o valor final são combinados na conversa do WhatsApp.',
  'como.troca_titulo': 'Política de troca',
  'como.troca_texto': 'Cada peça é vintage e única — o estado de uso está descrito na ficha antes da compra. Ainda assim, por ser uma compra combinada fora de loja física, você tem direito de arrependimento em até 7 dias corridos após receber a peça, conforme o art. 49 do Código de Defesa do Consumidor — é só avisar pelo WhatsApp. Fora desse prazo, trocas são avaliadas caso a caso.',
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
