"use client";
import { useI18n } from "@/components/providers/I18nProvider";


export default function TermsPage() {
  const { t } = useI18n();
  const sectionIds = [1, 2, 3, 4, 5, 6];
  const bulletIds = [1, 2, 3];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="mb-16 border-l-4 border-orange-500 pl-6">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight uppercase">
              {t("terms.title")}
            </h1>
            <p className="text-slate-500 text-sm font-medium italic">
              {t("terms.lastUpdated")}
            </p>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              {t("terms.intro")}
            </p>
          </div>

          {/* Terms Cards */}
          <div className="grid gap-8">
            {sectionIds.map((sId) => (
              <section 
                key={sId}
                className="bg-white border border-slate-200 rounded-2xl p-8 overflow-hidden hover:border-orange-400 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white text-sm font-bold">
                    {sId}
                  </span>
                  {t(`terms.section${sId}Title`)}
                </h2>
                
                <div className="pl-0 md:pl-11">
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    {t(`terms.section${sId}Desc`)}
                  </p>
                  
                  <div className="grid gap-3">
                    {bulletIds.map((bId) => {
                      const bulletKey = `terms.section${sId}Bullet${bId}`;
                      const content = t(bulletKey);
                      
                      // Fix lỗi 'Property has does not exist' bằng cách so sánh key
                      if (content !== bulletKey) {
                        return (
                          <div key={bId} className="flex items-start gap-4 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                            <span className="text-orange-500 font-bold">#</span>
                            <span>{content}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </section>
            ))}

            {/* Contact CTA */}
            <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-2 shadow-sm">
               <div className="bg-slate-900 rounded-2xl p-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                  {/* Decorative circle */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-2xl mb-2">
                      {t("terms.contactCardTitle")}
                    </h3>
                    <p className="text-slate-400">
                      {t("terms.contactText")}
                    </p>
                  </div>
                  
                  <a 
                    href="mailto:support@owsim.com"
                    className="relative z-10 whitespace-nowrap px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                  >
                    {t("terms.contactBtn")}
                  </a>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}