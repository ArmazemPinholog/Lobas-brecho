import GradeDePecas from '../components/GradeDePecas'
import { useSite } from '../lib/site'

export default function Acervo() {
  const { texto } = useSite()

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-28 pt-40 md:px-12 md:pb-40">
      <header className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h1 className="max-w-[16ch] font-display text-6xl uppercase leading-[0.88] text-osso md:text-8xl">
          {texto('acervo.titulo')}
        </h1>
        {texto('acervo.texto') && (
          <p className="max-w-[38ch] text-sm leading-relaxed text-osso/50">{texto('acervo.texto')}</p>
        )}
      </header>

      <GradeDePecas />
    </section>
  )
}
