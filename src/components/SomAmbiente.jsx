import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const CHAVE_PREFERENCIA = 'loba:audio-ambiente'

/**
 * Áudio ambiente opcional: vento/floresta em loop e um uivo sutil na
 * primeira ativação. Nunca toca sozinho — autoplay com som é bloqueado
 * pelos navegadores e, mesmo quando não fosse, ligar som sem avisar é
 * uma escolha ruim de UX. O visitante ativa pelo botão; a preferência
 * fica salva para as próximas visitas.
 */
export default function SomAmbiente() {
  const [ativo, setAtivo] = useState(false)
  const ambienteRef = useRef(null)
  const uivoRef = useRef(null)
  const jaUivou = useRef(false)

  useEffect(() => {
    try {
      setAtivo(localStorage.getItem(CHAVE_PREFERENCIA) === 'ligado')
    } catch {
      // Armazenamento bloqueado (aba privada, por exemplo): segue desligado.
    }
  }, [])

  useEffect(() => {
    const ambiente = ambienteRef.current
    if (!ambiente) return

    if (ativo) {
      ambiente.volume = 0.22
      ambiente.play().catch(() => {})

      if (!jaUivou.current) {
        jaUivou.current = true
        const uivo = uivoRef.current
        if (uivo) {
          uivo.volume = 0.5
          const tempo = window.setTimeout(() => uivo.play().catch(() => {}), 900)
          return () => window.clearTimeout(tempo)
        }
      }
    } else {
      ambiente.pause()
    }

    try {
      localStorage.setItem(CHAVE_PREFERENCIA, ativo ? 'ligado' : 'desligado')
    } catch {
      // Sem storage disponível: a preferência só vale para esta sessão.
    }
  }, [ativo])

  return (
    <>
      <audio ref={ambienteRef} src="/audio/ambiente-floresta.mp3" loop preload="none" />
      <audio ref={uivoRef} src="/audio/uivo-lobo.mp3" preload="none" />
      <button
        type="button"
        onClick={() => setAtivo((v) => !v)}
        aria-pressed={ativo}
        aria-label={ativo ? 'Desligar som ambiente' : 'Ligar som ambiente'}
        title={ativo ? 'Desligar som ambiente' : 'Ligar som ambiente'}
        className="fixed bottom-6 left-6 z-[45] flex h-11 w-11 items-center justify-center rounded-full border border-osso/15 bg-breu/70 text-osso/60 backdrop-blur transition-colors duration-300 hover:border-sangue/50 hover:text-osso"
      >
        {ativo ? <Volume2 className="h-4 w-4" strokeWidth={1.5} /> : <VolumeX className="h-4 w-4" strokeWidth={1.5} />}
      </button>
    </>
  )
}
