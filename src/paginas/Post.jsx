import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase, urlArquivo } from '../lib/supabase'
import { Carregando, ErroCarregamento } from '../components/Estado'
import { useTitulo } from '../hooks/useTitulo'

/** Extrai o id do vídeo e devolve o endereço de incorporação (YouTube ou Vimeo). */
function urlEmbed(url = '') {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

function Bloco({ bloco }) {
  switch (bloco.tipo) {
    case 'texto':
      return (
        <p className="mx-auto max-w-[68ch] whitespace-pre-line text-base leading-[1.8] text-osso/75">
          {bloco.valor}
        </p>
      )

    case 'imagem':
      return (
        <figure className="mx-auto max-w-[80ch]">
          <img src={urlArquivo(bloco.caminho, 'diario')} alt={bloco.legenda || ''} loading="lazy" className="w-full" />
          {bloco.legenda && <figcaption className="mt-3 text-xs text-osso/40">{bloco.legenda}</figcaption>}
        </figure>
      )

    case 'galeria':
      return (
        <div className="mx-auto grid max-w-[90ch] grid-cols-2 gap-3 md:grid-cols-3">
          {(bloco.itens || []).map((c) => (
            <img key={c} src={urlArquivo(c, 'diario')} alt="" loading="lazy" className="aspect-square w-full object-cover" />
          ))}
        </div>
      )

    case 'video': {
      const embed = urlEmbed(bloco.url)
      if (!embed) return null
      return (
        <div className="mx-auto aspect-video max-w-[90ch]">
          <iframe
            src={embed} title="Vídeo" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            className="h-full w-full border-0"
          />
        </div>
      )
    }

    case 'audio':
      return (
        <div className="mx-auto flex max-w-[68ch] items-center gap-5 border border-osso/12 bg-[#111] p-5">
          {bloco.capa && (
            <img src={urlArquivo(bloco.capa, 'diario')} alt="" className="h-20 w-20 shrink-0 object-cover" />
          )}
          <div className="min-w-0 flex-1">
            {bloco.titulo && <p className="mb-3 font-stencil tracking-[0.2em] text-osso">{bloco.titulo}</p>}
            <audio controls preload="none" src={urlArquivo(bloco.caminho, 'diario')} className="w-full">
              Seu navegador não reproduz áudio.
            </audio>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState(undefined)  // undefined = carregando, null = não achou
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let vivo = true
    setPost(undefined)
    setErro(false)
    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!vivo) return
        error ? setErro(true) : setPost(data || null)
      })
    return () => { vivo = false }
  }, [slug, tentativa])

  useTitulo(post?.titulo, post?.resumo)

  if (erro) {
    return (
      <ErroCarregamento
        className="py-60"
        mensagem="Não foi possível carregar este post agora."
        onTentar={() => setTentativa((t) => t + 1)}
      />
    )
  }

  if (post === undefined) {
    return <Carregando className="py-60" />
  }

  if (post === null) {
    return (
      <div className="flex flex-col items-center gap-5 py-60 text-center">
        <p className="font-stencil text-sm tracking-[0.3em] text-osso/40">POST NÃO ENCONTRADO</p>
        <Link to="/blog" className="text-sm text-sangue underline underline-offset-4">voltar para o blog</Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-[1100px] px-6 pb-32 pt-40 md:px-12">
      <Link to="/blog" className="inline-flex items-center gap-2 font-stencil text-xs tracking-[0.3em] text-osso/50 transition-colors hover:text-sangue">
        <ArrowLeft size={14} strokeWidth={1.5} /> BLOG
      </Link>

      <header className="mb-12 mt-8">
        {post.publicado_em && (
          <p className="font-stencil text-xs tracking-[0.4em] text-sangue">
            {new Date(post.publicado_em).toLocaleDateString('pt-BR')}
          </p>
        )}
        <h1 className="mt-4 max-w-[20ch] font-display text-5xl uppercase leading-[0.9] text-osso md:text-7xl">
          {post.titulo}
        </h1>
        {post.resumo && <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-osso/60">{post.resumo}</p>}
      </header>

      {post.capa && <img src={urlArquivo(post.capa, 'diario')} alt="" className="mb-14 w-full" />}

      <div className="space-y-10">
        {(post.blocos || []).map((b, i) => <Bloco key={i} bloco={b} />)}
      </div>
    </article>
  )
}
