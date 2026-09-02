import { motion } from 'framer-motion'
import { useMagnetic } from '../hooks/useMagnetic'

/**
 * CTA magnético: o botão inteiro persegue o cursor e o preenchimento
 * vermelho sobe de baixo para cima no hover.
 */
export default function BotaoMagnetico({ children, href = '#vitrine', variante = 'solido', onClick }) {
  const magnetico = useMagnetic({ forca: 0.4 })
  const solido = variante === 'solido'

  return (
    <motion.a
      ref={magnetico.ref}
      href={href}
      onClick={onClick}
      onMouseMove={magnetico.onMouseMove}
      onMouseLeave={magnetico.onMouseLeave}
      style={magnetico.style}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`group relative inline-flex items-center overflow-hidden px-9 py-4 font-stencil text-sm tracking-[0.35em] ${
        solido ? 'bg-sangue text-osso' : 'border border-osso/30 text-osso'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-loba group-hover:scale-y-100 ${
          solido ? 'bg-osso' : 'bg-sangue'
        }`}
      />
      <span
        className={`relative z-10 transition-colors duration-300 ${
          solido ? 'group-hover:text-breu' : 'group-hover:text-osso'
        }`}
      >
        {children}
      </span>
    </motion.a>
  )
}
