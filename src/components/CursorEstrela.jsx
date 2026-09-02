import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import Estrela from './Estrela'

/**
 * Cursor da marca: a estrela substitui a seta em ponteiros finos.
 * Elementos com data-cursor="texto" trocam o estado e mostram um rótulo.
 */
export default function CursorEstrela() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 700, damping: 40, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 700, damping: 40, mass: 0.4 })
  const [rotulo, setRotulo] = useState(null)
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fino) return
    document.body.classList.add('cursor-custom')
    setAtivo(true)

    const mover = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const alvo = e.target.closest('[data-cursor]')
      setRotulo(alvo ? alvo.dataset.cursor : null)
    }

    window.addEventListener('pointermove', mover)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.body.classList.remove('cursor-custom')
    }
  }, [x, y])

  if (!ativo) return null

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      <motion.div
        animate={{ scale: rotulo ? 2.1 : 1, rotate: rotulo ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Estrela className="h-6 w-6 drop-shadow-[0_0_8px_rgba(225,36,36,0.6)]" />
      </motion.div>

      <AnimatePresence>
        {rotulo && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute left-8 top-4 whitespace-nowrap font-stencil text-xs tracking-[0.3em] text-osso"
          >
            {rotulo}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
