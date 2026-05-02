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

  // Redirect root to /en
  if (pathname === '/') {
    const response = NextResponse.redirect(new URL('/en', request.url), 301);
    if (refCode && !hasRefCookie) {
      response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
    }
    return response;
  }

  // Handle paths with language prefix: /[lang]/*
  const pathMatch = pathname.match(/^\/([a-z]{2})(.*)$/);
  let langPrefix = '';
  let restOfPath = pathname;
  
  if (pathMatch) {
    const [, lang, rest] = pathMatch;
    // Validate that lang is one of our supported languages
    if (['en', 'de', 'fr', 'vi'].includes(lang)) {
      langPrefix = `/${lang}`;
      restOfPath = rest;
    }
  }

  // --- SEO Redirects (return immediately if matched) ---

  // Plans slug redirect: /[lang]/plans/{slug} -> /[lang]/esim/{country}/{slug}
  if (restOfPath.startsWith('/plans/')) {
    const slugParam = restOfPath.split('/')[2];
    if (slugParam && !/^\d+$/.test(slugParam)) {
      const countryMatch = slugParam.match(/^esim-([a-z]+)-/);
      const country = countryMatch ? countryMatch[1] : slugParam.split('-')[0];
      const response = NextResponse.redirect(new URL(`${langPrefix}/esim/${country}/${slugParam}`, request.url), 301);
      if (refCode && !hasRefCookie) {
        response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
      }
      return response;
    }
  }

  // Country code redirect: /[lang]/esim/{2-char-code} -> /[lang]/esim/{country-name}
  if (restOfPath.startsWith('/esim/')) {
    const segments = restOfPath.split('/');
    if (segments.length === 3) {
      const code = segments[2];
      if (code.length === 2 && COUNTRY_LOOKUP[code]) {
        const response = NextResponse.redirect(new URL(`${langPrefix}/esim/${COUNTRY_LOOKUP[code]}`, request.url), 301);
        if (refCode && !hasRefCookie) {
          response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
        }
        return response;
      }
    }
  }

  // Query param redirects on /[lang]/plans
  if (restOfPath === '/plans') {
    const countryId = searchParams.get('countryId');
    if (countryId) {
      const slug = COUNTRY_LOOKUP[countryId] || countryId.toLowerCase();
      const response = NextResponse.redirect(new URL(`${langPrefix}/esim/${slug}`, request.url), 301);
      if (refCode && !hasRefCookie) {
        response.cookies.set('simpal_ref', refCode, COOKIE_CONFIG);
      }
      return response;
    }

    const regionId = searchParams.get('regionId');
    if (regionId) {
      const slug = REGION_MAP[regionId] || regionId.toLowerCase();
      const response = NextResponse.redirect(new URL(`${langPrefix}/esim/${slug}`, request.url), 301);
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
