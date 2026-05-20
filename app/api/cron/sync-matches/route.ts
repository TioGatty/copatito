// app/api/cron/sync-matches/route.ts
import { NextResponse } from 'next/server'

// Called by Vercel Cron hourly during the tournament.
// Will sync scores from API-Football when implemented.
export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    { message: 'API-Football sync not yet implemented' },
    { status: 501 }
  )
}
