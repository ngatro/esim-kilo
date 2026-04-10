import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
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
  
  // Redirect /plans/{slug} to /esim/{country}/{slug} for SEO-friendly URLs
  const plansMatch = pathname.match(/^\/plans\/([^\/]+)$/);
  if (plansMatch && plansMatch[1]) {
    const slugParam = plansMatch[1];
    // Only redirect for non-numeric IDs (slugs like esim-france-500mbday-unlimited)
    if (!/^\d+$/.test(slugParam)) {
      // Map slug to country: "esim-france-xxx" -> "france"
      const countryMatch = slugParam.match(/^esim-(\w+)-/);
      const country = countryMatch ? countryMatch[1] : slugParam.split('-')[0];
      // Permanent redirect to SEO-friendly URL
      return NextResponse.redirect(new URL(`/esim/${country}/${slugParam}`, request.url), { status: 301 });
    }
  }
  
  return response;
}

// Only run on page routes, not API or static files
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};