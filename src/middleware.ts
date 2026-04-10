import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check for ref query parameter
  const refCode = request.nextUrl.searchParams.get('ref');
  
  if (refCode) {
    // Set referral cookie if not already set
    const existingCookie = request.cookies.get('simpal_ref');
    
    if (!existingCookie) {
      // Set cookie for 30 days
      response.cookies.set('simpal_ref', refCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/',
      });
    }
  }
  
  return response;
}

// Only run on page routes, not API or static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};