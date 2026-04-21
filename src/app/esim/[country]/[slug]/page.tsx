// import { notFound } from "next/navigation";
// import EsimDetailModal from "./EsimDetailModal";

// interface PageProps {
//   params: Promise<{
//     country: string;
//     slug: string;
//   }>;
// }

// export default async function EsimPlanPage({ params }: PageProps) {
//   const { country, slug } = await params;
  
//   // Build full slug: If slug already starts with "esim-", use as-is, otherwise prefix
//   const fullSlug = slug.startsWith('esim-') ? slug : `esim-${country}-${slug}`;

//   // Fetch plan to include details
//   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
//   const res = await fetch(`${baseUrl}/api/plans?id=${fullSlug}`);
//   if (!res.ok) return notFound();

//   const data = await res.json();
//   const plan = data.plans?.[0];
//   if (!plan?.id) return notFound();

//   // Pass full plan to client to render without another fetch or navigation
//   return <EsimDetailModal plan={plan} country={country} slug={slug} />;
// }