import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { precoVigente, dinheiro } from './supabase'

/**
 * Sacola guardada no próprio navegador da cliente.
 * Não existe pedido no banco: o fechamento acontece no WhatsApp,
 * então a sacola só precisa sobreviver a um F5.
 */

const CarrinhoCtx = createContext(null)
const CHAVE = 'lobas:sacola'

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || []
    } catch {
      return []
    }
  })
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(itens))
  }, [itens])

  const adicionar = (peca) => {
    // Peça única: nunca entra duas vezes.
    setItens((atual) => (atual.some((i) => i.id === peca.id) ? atual : [...atual, resumir(peca)]))
    setAberto(true)
  }

  const remover = (id) => setItens((atual) => atual.filter((i) => i.id !== id))
  const limpar = () => setItens([])
  const contem = (id) => itens.some((i) => i.id === id)

  const total = useMemo(() => itens.reduce((s, i) => s + Number(i.preco), 0), [itens])

  return (
    <CarrinhoCtx.Provider
      value={{ itens, adicionar, remover, limpar, contem, total, aberto, setAberto }}
    >
      {children}
    </CarrinhoCtx.Provider>
  )
}

export const useCarrinho = () => useContext(CarrinhoCtx)

/** Guarda só o necessário — e o preço do momento em que foi adicionada. */
function resumir(peca) {
  return {
    id: peca.id,
    codigo: peca.codigo,
    nome: peca.nome,
    tamanho: peca.tamanho,
    preco: precoVigente(peca),
  }
}

/**
 * Monta a mensagem que a cliente envia. Os códigos das peças são o
 * essencial: é com eles que as donas acham a peça na arara e no painel.
 */
export function mensagemPedido(itens, total) {
  const linhas = itens.map(
    (i) => `• ${i.codigo} — ${i.nome}${i.tamanho ? ` (tam ${i.tamanho})` : ''} — ${dinheiro(i.preco)}`
  )
  return [
    'Oi! Quero estas peças do site:',
    '',
    ...linhas,
    '',
    `Total das peças: ${dinheiro(total)}`,
    '',
    'Pode me passar o pagamento e a entrega?',
  ].join('\n')
}

/** Mensagem de dúvida sobre uma peça só. */
export function mensagemPeca(peca) {
  return `Oi! Tenho interesse na peça ${peca.codigo} — ${peca.nome}. Ainda está disponível?`
}
