import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, urlArquivo } from '../lib/supabase'
import { useSite } from '../lib/site'
import { Carregando, ErroCarregamento } from '../components/Estado'
import { useTitulo } from '../hooks/useTitulo'

export default function Blog() {
  const { texto } = useSite()
  useTitulo('Blog', texto('blog.texto') || 'Histórias e novidades da Lobas Brechó.')
  const [posts, setPosts] = useState(null)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let vivo = true
    setPosts(null)
    setErro(false)
    supabase
      .from('posts')
      .select('id, slug, titulo, resumo, capa, publicado_em, blocos')
      .eq('publicado', true)
      .order('publicado_em', { ascending: false })
      .then(({ data, error }) => {
        if (!vivo) return
        error ? setErro(true) : setPosts(data || [])
      })
    return () => { vivo = false }
  }, [tentativa])

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-28 pt-40 md:px-12 md:pb-40">
      <header className="mb-16">
        <h1 className="font-display text-6xl uppercase leading-[0.88] text-osso md:text-8xl">{texto('blog.titulo')}</h1>
        {texto('blog.texto') && <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-osso/50">{texto('blog.texto')}</p>}
      </header>

      {erro ? (
        <ErroCarregamento mensagem="Não foi possível carregar o blog agora." onTentar={() => setTentativa((t) => t + 1)} />
      ) : posts === null ? (
        <Carregando />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed border-osso/15 py-24 text-center">
          <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">NENHUM POST PUBLICADO AINDA</p>
          <p className="max-w-[40ch] text-sm text-osso/35">Os conteúdos aparecem aqui assim que forem publicados no painel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ type: 'spring', stiffness: 130, damping: 20, delay: (i % 3) * 0.06 }}
            >
              <Link to={`/blog/${p.slug}`} className="group block" data-cursor="Ler">
                <div className="aspect-[4/3] overflow-hidden bg-[#141414]">
                  {p.capa ? (
                    <img
                      src={urlArquivo(p.capa, 'diario')} alt="" loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-loba group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-stencil text-xs tracking-[0.3em] text-osso/20">
                      SEM CAPA
                    </div>
                  )}
                </div>
                {p.publicado_em && (
                  <p className="mt-5 font-stencil text-xs tracking-[0.3em] text-sangue">
                    {new Date(p.publicado_em).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <h2 className="mt-2 font-display text-2xl uppercase leading-tight text-osso">{p.titulo}</h2>
                {p.resumo && <p className="mt-2 text-sm leading-relaxed text-osso/50">{p.resumo}</p>}
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}
