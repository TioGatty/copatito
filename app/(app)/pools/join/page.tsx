import { redirect } from 'next/navigation'
import JoinByCodeClient from '@/components/JoinByCodeClient'

export default async function JoinPoolPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams
  if (!code) redirect('/pools')
  return <JoinByCodeClient initialCode={code.toUpperCase().slice(0, 6)}/>
}
