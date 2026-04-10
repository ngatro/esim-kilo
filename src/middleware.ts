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

  // Redirect short /esim/{country}/{slug} to canonical /esim/{country}/esim-{country}-{slug}
  const esimShortMatch = pathname.match(/^\/esim\/(\w+)\/((?!esim-)(\w+.+))$/);
  if (esimShortMatch) {
    const country = esimShortMatch[1];
    const shortSlug = esimShortMatch[2];
    return NextResponse.redirect(
      new URL(`/esim/${country}/esim-${country}-${shortSlug}`, request.url),
      { status: 301 }
    );
  }

  // Map both uppercase and lowercase country codes to slug names
  const codeToCountry: Record<string, string> = {
    TH: 'thailand',
    VN: 'vietnam',
    JP: 'japan',
    KR: 'south-korea',
    CN: 'china',
    US: 'usa',
    AU: 'australia',
    SG: 'singapore',
    MY: 'malaysia',
    ID: 'indonesia',
    PH: 'philippines',
    HK: 'hong-kong',
    TW: 'taiwan',
    IN: 'india',
    AE: 'uae',
    GB: 'uk',
    FR: 'france',
    DE: 'germany',
    IT: 'italy',
    ES: 'spain',
    NL: 'netherlands',
    CA: 'canada',
    MX: 'mexico',
    BR: 'brazil',
    // Lowercase versions
    th: 'thailand',
    vn: 'vietnam',
    jp: 'japan',
    kr: 'south-korea',
    cn: 'china',
    us: 'usa',
    au: 'australia',
    sg: 'singapore',
    my: 'malaysia',
    id: 'indonesia',
    ph: 'philippines',
    hk: 'hong-kong',
    tw: 'taiwan',
    in: 'india',
    ae: 'uae',
    gb: 'uk',
    fr: 'france',
    de: 'germany',
    it: 'italy',
    es: 'spain',
    nl: 'netherlands',
    ca: 'canada',
    mx: 'mexico',
    br: 'brazil',
  };
  
  const regionMap: Record<string, string> = {
    global: 'global',
    asia: 'asia',
    europe: 'europe',
    americas: 'americas',
    oceania: 'oceania',
  };

  // Redirect direct code path /esim/kr → /esim/south-korea
  const codeOnlyMatch = pathname.match(/^\/esim\/([a-z]{2})$/i);
  if (codeOnlyMatch) {
    const code = codeOnlyMatch[1].toUpperCase();
    if (code in codeToCountry) {
      return NextResponse.redirect(new URL(`/esim/${codeToCountry[code]}`, request.url), { status: 301 });
    }
  }

  // Redirect query URL /plans?countryId=TH → /esim/thailand
  const countryId = request.nextUrl.searchParams.get('countryId');
  if (pathname === '/plans' && countryId) {
    const code = countryId.toUpperCase();
    const slug = code in codeToCountry ? codeToCountry[code] : countryId.toLowerCase();
    return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), { status: 301 });
  }

  // Redirect query URL /plans?regionId=asia → /esim/asia
  const regionId = request.nextUrl.searchParams.get('regionId');
  if (pathname === '/plans' && regionId) {
    const slug = regionMap[regionId] || regionId.toLowerCase();
    return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), { status: 301 });
  }

  return response;
}

// Only run on page routes, not API or static files
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};