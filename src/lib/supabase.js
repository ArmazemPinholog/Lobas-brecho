import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

// Falha cedo e com mensagem clara: sem isso o erro só aparece
// lá na frente, disfarçado de "tabela não encontrada".
if (!url || !chave) {
  console.error(
    'Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
    'Crie o arquivo .env a partir do .env.example (local) ou configure ' +
    'as variáveis no painel da Vercel (produção).'
  )
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', chave || 'placeholder')

/** Caminho no Storage -> endereço público da imagem. */
export function urlArquivo(caminho, bucket = 'pecas') {
  if (!caminho) return null
  return supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl
}

/** Preço que vale agora: a promoção só conta enquanto não venceu. */
export function precoVigente(peca) {
  if (!peca) return 0
  const promoValida =
    peca.preco_promo && (!peca.promo_ate || new Date(peca.promo_ate) > new Date())
  return promoValida ? Number(peca.preco_promo) : Number(peca.preco)
}

export function emPromocao(peca) {
  return precoVigente(peca) < Number(peca?.preco || 0)
}

export const dinheiro = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
