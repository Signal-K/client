import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and the current path is / redirect the user to /game
  if (session && req.nextUrl.pathname === '/') {
    const redirectUrl = new URL('/game', req.url)
    const redirectRes = NextResponse.redirect(redirectUrl)
    
    // Copy cookies from the response object (which may contain refreshed tokens)
    // to the redirect response to ensure the session persists.
    const cookiesToSet = res.cookies.getAll()
    cookiesToSet.forEach(cookie => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return redirectRes
  }

  // If user is not signed in and the current path is /game redirect the user to /
  if (!session && req.nextUrl.pathname.startsWith('/game')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/game/:path*'],
}
