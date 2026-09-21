import { RefreshCw } from 'lucide-react'

/**
 * Estados de carregamento e erro reaproveitados nas listas do site e do
 * painel. Sem isso, uma falha de rede (Supabase fora do ar, sem internet)
 * deixava a tela presa em "CARREGANDO" pra sempre, sem explicação nem
 * saída — agora sempre dá pra tentar de novo.
 */
export function Carregando({ texto = 'CARREGANDO', className = 'py-20' }) {
  return (
    <p className={`text-center font-stencil text-sm tracking-[0.3em] text-osso/30 ${className}`}>
      {texto}
    </p>
  )
}

export function ErroCarregamento({
  mensagem = 'Não foi possível carregar agora.',
  onTentar,
  className = 'py-20',
}) {
  return (
    <div className={`flex flex-col items-center gap-4 text-center ${className}`}>
      <p className="max-w-[36ch] text-sm text-osso/50">{mensagem}</p>
      {onTentar && (
        <button
          onClick={onTentar}
          className="inline-flex items-center gap-2 border border-osso/25 px-5 py-3 font-stencil text-xs tracking-[0.3em] text-osso transition-colors hover:border-sangue"
        >
          <RefreshCw size={14} strokeWidth={1.5} /> TENTAR DE NOVO
        </button>
      )}
    </div>
  )
}
