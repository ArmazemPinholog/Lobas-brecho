import { useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * Atração magnética: o elemento persegue o cursor dentro do próprio raio.
 * `forca` = quanto do deslocamento do mouse é aplicado (0.4 = 40%).
 */
export function useMagnetic({ forca = 0.35, stiffness = 220, damping = 18 } = {}) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness, damping, mass: 0.6 })
  const springY = useSpring(y, { stiffness, damping, mass: 0.6 })

  const onMouseMove = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centroX = rect.left + rect.width / 2
    const centroY = rect.top + rect.height / 2
    x.set((event.clientX - centroX) * forca)
    y.set((event.clientY - centroY) * forca)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { ref, style: { x: springX, y: springY }, onMouseMove, onMouseLeave }
}
