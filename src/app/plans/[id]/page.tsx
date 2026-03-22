import Link from "next/link";
import { notFound } from "next/navigation";
import { ESIM_PLANS, formatData } from "@/lib/esim-data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export async function generateStaticParams() {
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

  const isUnlimited = plan.dataGb >= 999;
  const pricePerDay = (plan.priceUsd / plan.validityDays).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#plans" className="hover:text-slate-300 transition-colors">Plans</Link>
            <span>/</span>
            <span className="text-slate-300">{plan.destination}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-6xl">{plan.flag}</span>
                  {plan.badge && (
                    <span className="bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white">{plan.destination} eSIM</h1>
                {plan.coverageCountries > 1 && (
                  <p className="text-slate-400 mt-1">{plan.coverageCountries} countries covered</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Data", value: formatData(plan.dataGb) },
                  { label: "Validity", value: `${plan.validityDays} days` },
                  { label: "Cost/day", value: `$${pricePerDay}` },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-center">
                    <p className="text-2xl font-bold text-sky-400">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Network Speeds</h2>
                <div className="flex flex-wrap gap-2">
                  {plan.speeds.map((speed) => (
                    <span key={speed} className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium px-3 py-1.5 rounded-lg">
                      {speed}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">What&apos;s Included</h2>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-300">
                      <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-slate-800/70 border border-slate-700/60 rounded-3xl p-7 shadow-2xl">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-4xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">one-time</p>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  {isUnlimited ? "Unlimited data" : `${plan.dataGb} GB data`} · {plan.validityDays} days
                </p>

                <Link href={`/checkout?planId=${plan.id}`}>
                  <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-sky-900/30 mb-3">
                    Buy Now
                  </button>
                </Link>

                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                  {[
                    { icon: "⚡", text: "Instant eSIM delivery" },
                    { icon: "🔒", text: "Secure checkout" },
                    { icon: "💰", text: "30-day money-back guarantee" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <Link
              href="/#plans"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all plans
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
