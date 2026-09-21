/**
 * Lampejo dos olhos do lobo por trás dos botões principais, no hover.
 * O elemento-pai precisa das classes `group relative overflow-hidden`
 * para conter a camada e disparar a transição.
 */
export default function BrilhoOlhos() {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundImage: 'url(/brand/lobo-olhos.png)' }}
      className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 mix-blend-screen transition-opacity duration-500 ease-loba group-hover:opacity-45"
    />
  )
}
