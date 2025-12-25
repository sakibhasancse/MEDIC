import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './lib/navigation';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Run intl middleware first to handle locale redirection and rewriting
  const response = intlMiddleware(request);

  // Get the path without the locale prefix to check auth rules
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(en|bn)/, '') || '/';

  const token = request.cookies.get('patient_token')?.value;

  // Public paths that don't need auth (but might need locale)
  const isAuthPage = pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register');
  const isPublicPage = pathWithoutLocale === '/';

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    const locale = pathname.match(/^\/(en|bn)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // If user is not logged in and tries to access protected pages, redirect to login
  if (!token && !isAuthPage && !isPublicPage) {
    const locale = pathname.match(/^\/(en|bn)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Enable a comprehensive source matching for i18n
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
