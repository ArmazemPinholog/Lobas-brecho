import { useState } from 'react'
import { products } from '../data/products'
import CardProduto from './CardProduto'
import ModalProduto from './ModalProduto'

export default function Vitrine() {
  const [selecionado, setSelecionado] = useState(null)

  return (
    <section id="vitrine" className="relative mx-auto max-w-[1600px] px-6 py-28 md:px-12 md:py-40">
      <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="max-w-[16ch] font-display text-5xl uppercase leading-[0.88] text-osso md:text-7xl">
          Entrou essa semana
        </h2>
        <p className="max-w-[38ch] font-corpo text-sm leading-relaxed text-osso/50">
          Reposição toda quarta, às 19h. O que some daqui já foi levado por alguém.
        </p>
      </div>

      {/* Bento assimétrico: 12 colunas com peças de larguras diferentes */}
      <div className="grid grid-cols-1 gap-4 md:auto-rows-[minmax(0,1fr)] md:grid-cols-12">
        {products.map((produto, i) => (
          <CardProduto key={produto.id} produto={produto} indice={i} onAbrir={setSelecionado} />
        ))}
      </div>

      <ModalProduto produto={selecionado} onFechar={() => setSelecionado(null)} />
    </section>
  )
}
