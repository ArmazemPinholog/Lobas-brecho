import { useState } from 'react'
import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSite, linkWhats } from '../lib/site'

export default function Rodape() {
  const { texto, config } = useSite()
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState('parado')  // parado | enviando | ok | erro

  const inscrever = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setEstado('enviando')
    const { error } = await supabase.from('inscritos').insert({ email: email.trim().toLowerCase() })
    // E-mail repetido (código 23505) não é erro para quem está do outro lado.
    setEstado(!error || error.code === '23505' ? 'ok' : 'erro')
  }

  const linkVender = linkWhats(config.whatsapp, 'Oi! Tenho peças para vender. Posso mandar fotos?')

  return (
    <footer className="bg-breu pt-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-y-16 border-b border-osso/10 pb-20">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="max-w-[14ch] font-display text-5xl uppercase leading-[0.88] text-osso md:text-6xl">
              {texto('rodape.titulo')}
            </h2>
            {texto('rodape.texto') && (
              <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-osso/55">{texto('rodape.texto')}</p>
            )}
            {linkVender && (
              <a
                href={linkVender} target="_blank" rel="noreferrer"
                className="group relative mt-8 inline-flex items-center overflow-hidden bg-sangue px-9 py-4 font-stencil text-sm tracking-[0.35em] text-osso"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-osso transition-transform duration-500 ease-loba group-hover:scale-y-100" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-breu">MANDAR FOTOS</span>
              </a>
            )}
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 lg:col-start-7">
            <p className="font-stencil text-xs tracking-[0.4em] text-sangue">A LOJA</p>
            <address className="mt-5 space-y-3 text-sm not-italic text-osso/65">
              {config.endereco && (
                <p className="flex items-start gap-3">
                  <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-osso/40" />{config.endereco}
                </p>
              )}
              {config.whatsapp && (
                <a href={linkWhats(config.whatsapp, 'Oi! Vim pelo site.')} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition-colors hover:text-osso">
                  <MessageCircle size={16} strokeWidth={1.5} className="shrink-0 text-osso/40" />WhatsApp
                </a>
              )}
              {config.instagram && (
                <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition-colors hover:text-osso">
                  <Instagram size={16} strokeWidth={1.5} className="shrink-0 text-osso/40" />@{config.instagram}
                </a>
              )}
            </address>
            {config.horario && <p className="mt-5 text-sm text-osso/40">{config.horario}</p>}
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <p className="font-stencil text-xs tracking-[0.4em] text-sangue">AVISO DE NOVIDADES</p>
            <p className="mt-5 max-w-[34ch] text-sm text-osso/55">
              Avisamos por e-mail quando peças novas entrarem no site.
            </p>

            {estado === 'ok' ? (
              <p className="mt-6 text-sm text-osso">Pronto. Você entra na lista do próximo aviso.</p>
            ) : (
              <form onSubmit={inscrever} className="mt-6 flex items-center border-b border-osso/25">
                <label htmlFor="email-aviso" className="sr-only">Seu e-mail</label>
                <input
                  id="email-aviso" type="email" value={email} required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent py-3 text-sm text-osso placeholder:text-osso/30 focus:outline-none"
                />
                <button type="submit" disabled={estado === 'enviando'} className="shrink-0 py-3 font-stencil text-xs tracking-[0.3em] text-sangue disabled:opacity-40">
                  {estado === 'enviando' ? '...' : 'QUERO SABER'}
                </button>
              </form>
            )}
            {estado === 'erro' && <p className="mt-3 text-xs text-sangue">Não deu certo. Tente de novo em instantes.</p>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-10 md:flex-row md:justify-between">
          <img
            src="/brand/ELEMENTO_1_.png" alt="Lobas Brechó"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="w-56 opacity-70 invert"
          />
          <p className="text-xs text-osso/35">Lobas Brechó · peças únicas, garimpadas à mão</p>
        </div>
      </div>
    </footer>
  )
}
