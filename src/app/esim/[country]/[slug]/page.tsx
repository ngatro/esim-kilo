import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    country: string;
    slug: string;
  }>;
}

export default async function EsimPlanPage({ params }: PageProps) {
  const { country, slug } = await params;
  
  // Build API URL for plan-by-slug
  // This fetches plan using provided slug via param
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/plans?slug=${slug}`);
  
  if (!res.ok) {
    // If not found, 404
    redirect("/404");
  }
  
  const plans = await res.json();
  
  // Find the matching plan
  const plan = plans.find((p: any) => p.slug === slug);
  
  if (!plan?.id) {
    // Not found, go to 404
    redirect("/404");
  }
  
  // Use existing route now with numeric ID
  redirect(`/plans/${plan.id}`);
}