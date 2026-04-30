import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static lookup maps - initialized once for performance
const CODE_TO_COUNTRY: Record<string, string> = {
  TH: 'thailand', VN: 'vietnam', JP: 'japan', KR: 'south-korea', CN: 'china',
  US: 'united-states', AU: 'australia', SG: 'singapore', MY: 'malaysia', ID: 'indonesia',
  PH: 'philippines', HK: 'hong-kong', TW: 'taiwan', IN: 'india', AE: 'uae',
  GB: 'united-kingdom', FR: 'france', DE: 'germany', IT: 'italy', ES: 'spain', NL: 'netherlands',
  CA: 'canada', MX: 'mexico', BR: 'brazil',
};

const COUNTRY_LOOKUP = Object.fromEntries(
  Object.entries(CODE_TO_COUNTRY).flatMap(([k, v]) => [
    [k.toUpperCase(), v],
    [k.toLowerCase(), v]
  ])
);

const REGION_MAP: Record<string, string> = {
  global: 'global', asia: 'asia', europe: 'europe', americas: 'americas', oceania: 'oceania',
};

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 2592000, // 30 days
  path: '/',
};

// Middleware function
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const refCode = searchParams.get('ref');
  const hasRefCookie = request.cookies.has('simpal_ref');

  // --- SEO Redirects (return immediately if matched) ---

  // Plans slug redirect: /plans/{slug} -> /esim/{country}/{slug}
  if (pathname.startsWith('/plans/')) {
    const slugParam = pathname.split('/')[2];
    if (slugParam && !/^\d+$/.test(slugParam)) {
      const countryMatch = slugParam.match(/^esim-([a-z]+)-/);
      const country = countryMatch ? countryMatch[1] : slugParam.split('-')[0];
      const response = NextResponse.redirect(new URL(`/esim/${country}/${slugParam}`, request.url), 301);
      if (refCode && !hasRefCookie) {
        response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
      }
      return response;
    }
  }

  // Country code redirect: /esim/{2-char-code} -> /esim/{country-name}
  if (pathname.startsWith('/esim/')) {
    const segments = pathname.split('/');
    if (segments.length === 3) {
      const code = segments[2];
      if (code.length === 2 && COUNTRY_LOOKUP[code]) {
        const response = NextResponse.redirect(new URL(`/esim/${COUNTRY_LOOKUP[code]}`, request.url), 301);
        if (refCode && !hasRefCookie) {
          response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
        }
        return response;
      }
    }
  }

  // Query param redirects on /plans
  if (pathname === '/plans') {
    const countryId = searchParams.get('countryId');
    if (countryId) {
      const slug = COUNTRY_LOOKUP[countryId] || countryId.toLowerCase();
      const response = NextResponse.redirect(new URL(`/esim/${slug}`, request.url), 301);
      if (refCode && !hasRefCookie) {
        response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
      }
      return response;
    }

    const regionId = searchParams.get('regionId');
    if (regionId) {
      const slug = REGION_MAP[regionId] || regionId.toLowerCase();
      const response = NextResponse.redirect(new URL(`/esim/${slug}`, request.url), 301);
      if (refCode && !hasRefCookie) {
        response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
      }
      return response;
    }
  }

  // No redirects - proceed to next handler, set referral cookie if needed
  if (refCode && !hasRefCookie) {
    const response = NextResponse.next();
    response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
    return response;
  }
  return NextResponse.next();
}

// Run on all non-static routes (including /api/admin/*)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};
