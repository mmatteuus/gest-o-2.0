
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not signed in and the current path is not /auth, redirect to /auth
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access /auth, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is trying to access /master but is not master, redirect to home
  if (req.nextUrl.pathname.startsWith('/master')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'MASTER') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
