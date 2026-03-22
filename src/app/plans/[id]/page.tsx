import Link from "next/link";
import { notFound } from "next/navigation";
import { ESIM_PLANS, formatData } from "@/lib/esim-data";
import PlanDetailContent from "./PlanDetailContent";

export function generateStaticParams() {
  return ESIM_PLANS.map((plan) => ({ id: plan.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const plan = ESIM_PLANS.find((p) => p.id === id);

  if (!plan) {
    notFound();
  }

  return <PlanDetailContent plan={plan} />;
}
