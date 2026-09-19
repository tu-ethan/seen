import { NextResponse } from 'next/server'
import { getServerState } from '@/lib/integrations/server/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ contributions: getServerState().contributions })
}
