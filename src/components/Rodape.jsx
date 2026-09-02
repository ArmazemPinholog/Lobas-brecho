import { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import BotaoMagnetico from './BotaoMagnetico'

export default function Rodape() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  const enviar = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setEnviado(true)
  }

  return (
    <footer id="rodape" className="relative bg-breu pt-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-y-16 border-b border-osso/10 pb-20">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="max-w-[14ch] font-display text-5xl uppercase leading-[0.88] text-osso md:text-6xl">
              Tem peça parada aí?
            </h2>
            <p className="mt-6 max-w-[44ch] font-corpo text-sm leading-relaxed text-osso/55">
              Avaliamos por WhatsApp em até 48h. Se entrar no acervo, você escolhe entre dinheiro na
              hora ou crédito com 30% a mais.
            </p>
            <div className="mt-8">
              <BotaoMagnetico href="#" onClick={(e) => e.preventDefault()}>
                MANDAR FOTOS
              </BotaoMagnetico>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 lg:col-start-7">
            <p className="font-stencil text-xs tracking-[0.4em] text-sangue">A LOJA</p>
            <address className="mt-5 space-y-3 font-corpo text-sm not-italic text-osso/65">
              <p className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-osso/40" />
                Rua Aurora, 214 — Centro
              </p>
              <p className="flex items-center gap-3">
                <MessageCircle size={16} strokeWidth={1.5} className="shrink-0 text-osso/40" />
                (11) 90000-0000
              </p>
              <p className="flex items-center gap-3">
                <Instagram size={16} strokeWidth={1.5} className="shrink-0 text-osso/40" />
                @lobasbrecho
              </p>
            </address>
            <p className="mt-5 font-corpo text-sm text-osso/40">Quarta a sábado, 12h às 20h.</p>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <p className="font-stencil text-xs tracking-[0.4em] text-sangue">REPOSIÇÃO DE QUARTA</p>
            <p className="mt-5 max-w-[34ch] font-corpo text-sm text-osso/55">
              Avisamos por e-mail 30 minutos antes das peças entrarem no site.
            </p>

            {enviado ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="mt-6 font-corpo text-sm text-osso"
              >
                Pronto. O próximo aviso sai na quarta, 18h30.
              </motion.p>
            ) : (
              <form onSubmit={enviar} className="mt-6 flex items-center border-b border-osso/25">
                <label htmlFor="email-aviso" className="sr-only">
                  Seu e-mail
                </label>
                <input
                  id="email-aviso"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent py-3 font-corpo text-sm text-osso placeholder:text-osso/30 focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="shrink-0 py-3 font-stencil text-xs tracking-[0.3em] text-sangue"
                >
                  QUERO SABER
                </motion.button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 py-10 md:flex-row md:justify-between">
          <img src="/brand/ELEMENTO_1_.png" alt="Lobas Brechó" className="w-56 invert opacity-70" />
          <p className="font-corpo text-xs text-osso/35">
            Lobas Brechó · CNPJ 00.000.000/0001-00 · Trocas em 7 dias com etiqueta
          </p>
        </div>
      </div>
    </footer>
  )
}
