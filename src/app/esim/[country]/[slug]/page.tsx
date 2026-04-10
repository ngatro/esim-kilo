import { notFound } from "next/navigation";
import EsimRedirectClient from "./EsimRedirectClient";

interface PageProps {
  params: Promise<{
    country: string;
    slug: string;
  }>;
}

export default async function EsimPlanPage({ params }: PageProps) {
  const { country, slug } = await params;
  
  // Build full slug: If slug already starts with "esim-", use as-is, otherwise prefix
  // Convert short "100mb-7days" to "esim-thailand-100mb-7days"
  const fullSlug = slug.startsWith('esim-') ? slug : `esim-${country}-${slug}`;
  
  // Fetch plan by slug
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/plans?slug=${fullSlug}`);
  
  if (!res.ok) {
    return notFound();
  }
  
  const data = await res.json();
  const plan = data.plans?.[0];
  
  if (!plan?.id) {
    return notFound();
  }
  
  // Pass all needed info to client component for rendering with URL preserve
  return <EsimRedirectClient planId={plan.id} country={country} slug={slug} />;
}