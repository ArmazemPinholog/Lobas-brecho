import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Faixa from '../components/Faixa'
import GradeDePecas from '../components/GradeDePecas'
import Manifesto from '../components/Manifesto'
import { useSite } from '../lib/site'

export default function Home() {
  const { texto } = useSite()

  return (
    <>
      <Hero />
      <Faixa />

      <section className="mx-auto max-w-[1600px] px-6 py-28 md:px-12 md:py-40">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-[16ch] font-display text-5xl uppercase leading-[0.88] text-osso md:text-7xl">
            {texto('acervo.titulo')}
          </h2>
          <Link to="/acervo" className="font-stencil text-sm tracking-[0.3em] text-sangue transition-colors hover:text-osso">
            VER TUDO →
          </Link>
        </div>

        {/* Home mostra só os destaques; o acervo inteiro fica em /acervo */}
        <GradeDePecas limite={6} />
      </section>

      <Manifesto />
    </>
  )
}
