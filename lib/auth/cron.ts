import { timingSafeEqual } from 'crypto'

function safeEq(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/**
 * Validate the cron-secret on incoming requests.
 * Accepts either:
 *   - x-cron-secret: <secret>
 *   - Authorization: Bearer <secret>  (Vercel cron uses this)
 *
 * Comparison is constant-time to avoid timing oracle (CWE-208).
 */
export function authOk(request: Request): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const header = request.headers.get('x-cron-secret') ?? ''
  if (safeEq(header, expected)) return true
  const bearer = request.headers.get('authorization') ?? ''
  return safeEq(bearer, `Bearer ${expected}`)
}
