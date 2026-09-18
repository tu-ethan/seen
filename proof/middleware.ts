import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextResponse, NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next()
  }
  
  return withMiddlewareAuthRequired()(req as any, {} as any)
}

export const config = { matcher: ['/manager/:path*', '/employee/:path*'] }
