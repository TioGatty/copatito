export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getOpenMatchesWithUserPredictions } from '@/lib/predictions/fetch'
import type { Match } from '@/lib/types/match'
import PredictAllList from '@/components/PredictAllList'

export default async function PredictAllPage() {
  const { matches, predictions } = await getOpenMatchesWithUserPredictions()
  return (
    <div className="screen-body">
      <div style={{ padding: '4px 20px 12px' }}>
        <Link href="/home" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--t-3)', textDecoration: 'none', marginBottom: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Inicio
        </Link>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Pronosticar rápido
        </h1>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>
          Lista compacta. Cambios se guardan automático al editar.
        </div>
      </div>
      <PredictAllList matches={matches as Match[]} predictions={predictions}/>
    </div>
  )
}
