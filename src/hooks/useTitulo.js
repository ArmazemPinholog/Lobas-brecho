import { useEffect } from 'react'

const SUFIXO = ' — Lobas Brechó'

/**
 * Cada página pública tinha o mesmo <title> fixo do index.html, sem
 * distinção nenhuma na aba do navegador, no histórico ou nos favoritos.
 * Este hook troca o título (e a meta description, quando informada)
 * enquanto a página está montada, e devolve o título original ao sair —
 * assim uma SPA sem esse cuidado não "vaza" o título de uma página pra outra.
 */
export function useTitulo(titulo, descricao) {
  useEffect(() => {
    const tituloAnterior = document.title
    const metaDescricao = document.querySelector('meta[name="description"]')
    const descricaoAnterior = metaDescricao?.getAttribute('content')

    if (titulo) document.title = `${titulo}${SUFIXO}`
    if (descricao && metaDescricao) metaDescricao.setAttribute('content', descricao)

    return () => {
      document.title = tituloAnterior
      if (descricao && metaDescricao && descricaoAnterior != null) {
        metaDescricao.setAttribute('content', descricaoAnterior)
      }
    }
  }, [titulo, descricao])
}
