"use client";
import { useI18n } from "@/components/providers/I18nProvider";

export default function RefundPage() {
  const { t } = useI18n();

return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{t("refund.title")}</h1>
            <p className="text-slate-500">{t("refund.lastUpdated")}</p>
          </div>
          
          <div className="space-y-8">
            {/* 1. General Policy - Simple Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                {t("refund.section1Title")}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {t("refund.section1Desc")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 2. Eligibility - Greenish/Soft Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-orange-400 hover:shadow-lg transition-all group">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <svg className="w-5 h-5 text-green-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {t("refund.section2Title")}
                </h2>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                      <span className="text-green-500 font-bold">•</span>
                      {t(`refund.eligibilityItem${i}`)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Non-Refundable - Warning Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-red-400 hover:shadow-lg transition-all group">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  {t("refund.section3Title")}
                </h2>
                <ul className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                      <span className="text-red-400 font-bold">•</span>
                      {t(`refund.nonRefundableItem${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Process & Contact */}
            <div className="bg-slate-900 text-white rounded-2xl p-10 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
               <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-4">{t("refund.section4Title")}</h2>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {t("refund.section4Desc")}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm border border-white/10">
                    <span className="text-orange-400">✉</span>
                    {t("refund.contactText")}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}