/**
 * Estrela de 4 pontas da marca em vetor.
 * Mesma construção da versão 3D: pontas côncavas puxadas para o centro.
 */
export default function Estrela({ className = '', cor = '#e12424', ...props }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true" {...props}>
      <path
        d="M0 -48 Q4.5 -4.5 48 0 Q4.5 4.5 0 48 Q-4.5 4.5 -48 0 Q-4.5 -4.5 0 -48 Z"
        fill={cor}
      />
    </svg>
  )
}
