import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. ĐƯA BIẾN TĨNH RA NGOÀI: Khởi tạo 1 lần để tiết kiệm RAM
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

// 2. ĐỔI TÊN HÀM THÀNH "proxy" (Bắt buộc cho Next.js v16+)
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  let response = NextResponse.next();

  // Xử lý Referral Cookie
  const refCode = searchParams.get('ref');
  if (refCode && !request.cookies.has('simpal_ref')) {
    response.cookies.set('simpal_ref', refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2592000,
      path: '/',
    });
  }

  // --- SEO Redirects ---
  
  // Plans slug redirect
  if (pathname.startsWith('/plans/')) {
    const slugParam = pathname.split('/')[2];
    if (slugParam && !/^\d+$/.test(slugParam)) {
      const countryMatch = slugParam.match(/^esim-([a-z]+)-/);
      const country = countryMatch ? countryMatch[1] : slugParam.split('-')[0];
      return NextResponse.redirect(new URL(`/esim/${country}/${slugParam}`, request.url), 301);
    }
  }

  // Country code redirect (/esim/vn -> /esim/vietnam)
  if (pathname.startsWith('/esim/')) {
    const segments = pathname.split('/');
    if (segments.length === 3) {
      const code = segments[2];
      if (code.length === 2 && COUNTRY_LOOKUP[code]) {
        return NextResponse.redirect(new URL(`/esim/${COUNTRY_LOOKUP[code]}`, request.url), 301);
      }
    }
  }

  // Query Params Redirects
  const countryId = searchParams.get('countryId');
  if (pathname === '/plans' && countryId) {
    const slug = COUNTRY_LOOKUP[countryId] || countryId.toLowerCase();
    return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), 301);
  }

  const regionId = searchParams.get('regionId');
  if (pathname === '/plans' && regionId) {
    const slug = REGION_MAP[regionId] || regionId.toLowerCase();
    return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), 301);
  }

  return response;
}

// 3. MATCHER: Chặn các file tĩnh để không chạy logic này vô ích
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};


// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const response = NextResponse.next();
//   const pathname = request.nextUrl.pathname;
  
//   // Check for ref query parameter
//   const refCode = request.nextUrl.searchParams.get('ref');
  
//   if (refCode) {
//     // Set referral cookie if not already set
//     const existingCookie = request.cookies.get('simpal_ref');
    
//     if (!existingCookie) {
//       // Set cookie for 30 days
//       response.cookies.set('simpal_ref', refCode, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
//         path: '/',
//       });
//     }
//   }
  
//   // Redirect /plans/{slug} to /esim/{country}/{slug} for SEO-friendly URLs
//   const plansMatch = pathname.match(/^\/plans\/([^\/]+)$/);
//   if (plansMatch && plansMatch[1]) {
//     const slugParam = plansMatch[1];
//     // Only redirect for non-numeric IDs (slugs like esim-france-500mbday-unlimited)
//     if (!/^\d+$/.test(slugParam)) {
//       // Map slug to country: "esim-france-xxx" -> "france"
//       const countryMatch = slugParam.match(/^esim-(\w+)-/);
//       const country = countryMatch ? countryMatch[1] : slugParam.split('-')[0];
//       // Permanent redirect to SEO-friendly URL
//       return NextResponse.redirect(new URL(`/esim/${country}/${slugParam}`, request.url), { status: 301 });
//     }
//   }

//   // Redirect short /esim/{country}/{slug} to canonical /esim/{country}/esim-{country}-{slug}
//   const esimShortMatch = pathname.match(/^\/esim\/(\w+)\/((?!esim-)(\w+.+))$/);
//   if (esimShortMatch) {
//     const country = esimShortMatch[1];
//     const shortSlug = esimShortMatch[2];
//     return NextResponse.redirect(
//       new URL(`/esim/${country}/esim-${country}-${shortSlug}`, request.url),
//       { status: 301 }
//     );
//   }

//   // Map both uppercase and lowercase country codes to slug names
//   const codeToCountry: Record<string, string> = {
//     TH: 'thailand',
//     VN: 'vietnam',
//     JP: 'japan',
//     KR: 'south-korea',
//     CN: 'china',
//     US: 'usa',
//     AU: 'australia',
//     SG: 'singapore',
//     MY: 'malaysia',
//     ID: 'indonesia',
//     PH: 'philippines',
//     HK: 'hong-kong',
//     TW: 'taiwan',
//     IN: 'india',
//     AE: 'uae',
//     GB: 'uk',
//     FR: 'france',
//     DE: 'germany',
//     IT: 'italy',
//     ES: 'spain',
//     NL: 'netherlands',
//     CA: 'canada',
//     MX: 'mexico',
//     BR: 'brazil',
//     // Lowercase versions
//     th: 'thailand',
//     vn: 'vietnam',
//     jp: 'japan',
//     kr: 'south-korea',
//     cn: 'china',
//     us: 'usa',
//     au: 'australia',
//     sg: 'singapore',
//     my: 'malaysia',
//     id: 'indonesia',
//     ph: 'philippines',
//     hk: 'hong-kong',
//     tw: 'taiwan',
//     in: 'india',
//     ae: 'uae',
//     gb: 'uk',
//     fr: 'france',
//     de: 'germany',
//     it: 'italy',
//     es: 'spain',
//     nl: 'netherlands',
//     ca: 'canada',
//     mx: 'mexico',
//     br: 'brazil',
//   };
  
//   const regionMap: Record<string, string> = {
//     global: 'global',
//     asia: 'asia',
//     europe: 'europe',
//     americas: 'americas',
//     oceania: 'oceania',
//   };

//   // Redirect direct code path /esim/kr → /esim/south-korea
//   const codeOnlyMatch = pathname.match(/^\/esim\/([a-z]{2})$/i);
//   if (codeOnlyMatch) {
//     const code = codeOnlyMatch[1].toUpperCase();
//     if (code in codeToCountry) {
//       return NextResponse.redirect(new URL(`/esim/${codeToCountry[code]}`, request.url), { status: 301 });
//     }
//   }

//   // Redirect query URL /plans?countryId=TH → /esim/thailand
//   const countryId = request.nextUrl.searchParams.get('countryId');
//   if (pathname === '/plans' && countryId) {
//     const code = countryId.toUpperCase();
//     const slug = code in codeToCountry ? codeToCountry[code] : countryId.toLowerCase();
//     return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), { status: 301 });
//   }

//   // Redirect query URL /plans?regionId=asia → /esim/asia
//   const regionId = request.nextUrl.searchParams.get('regionId');
//   if (pathname === '/plans' && regionId) {
//     const slug = regionMap[regionId] || regionId.toLowerCase();
//     return NextResponse.redirect(new URL(`/esim/${slug}`, request.url), { status: 301 });
//   }

//   return response;
// }

// // Only run on page routes, not API or static files
// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };