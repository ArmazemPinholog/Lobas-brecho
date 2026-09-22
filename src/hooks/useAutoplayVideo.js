import { useEffect } from 'react'

/**
 * O autoplay declarativo (`autoPlay muted playsInline` no JSX) nem sempre
 * é suficiente no Safari do iPhone: o navegador não libera o autoplay e
 * mostra o botão de play nativo por cima do vídeo, em vez de tocar sozinho
 * como acontece nos outros navegadores. É um problema conhecido de
 * React + vídeo no iOS — o `muted` do JSX às vezes chega tarde demais pro
 * Safari confirmar que o vídeo é mudo e liberar o autoplay. Forçar
 * `.muted = true` como propriedade do próprio elemento (não só o atributo
 * declarado no JSX) e chamar `.play()` na mão logo que o vídeo monta cobre
 * esse caso.
 */
export function useAutoplayVideo(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    const tentar = () => el.play().catch(() => {})
    tentar()
    // Alguns iPhones só liberam o autoplay quando a aba volta a ficar
    // visível (ex: trocar de app e voltar) — tenta de novo nesse momento.
    document.addEventListener('visibilitychange', tentar)
    return () => document.removeEventListener('visibilitychange', tentar)
  }, [ref])
}
