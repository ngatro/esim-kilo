"use client";
import { useI18n } from "@/components/providers/I18nProvider";


export default function PrivacyPage() {
  const { t } = useI18n();
  // Mảng chứa các mục từ 1 đến 6
  const sectionIds = [1, 2, 3, 4, 5, 6];
  // Mảng chứa các bullet từ 1 đến 3
  const bulletIds = [1, 2, 3];

return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-16 border-l-4 border-orange-500 pl-6">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 uppercase tracking-tight">
              {t("privacy.title")}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {t("privacy.lastUpdated")}
            </p>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed italic">
              {t("privacy.intro")}
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid gap-8">
            {sectionIds.map((sId) => (
              <section 
                key={sId}
                className="bg-white border border-slate-200 rounded-2xl p-8 overflow-hidden hover:border-orange-400 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-200">
                    {sId}
                  </span>
                  {t(`privacy.section${sId}Title`)}
                </h2>
                
                <div className="pl-0 md:pl-11">
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    {t(`privacy.section${sId}Desc`)}
                  </p>
                  
                  <div className="grid gap-3">
                    {bulletIds.map((bId) => {
                      const bulletKey = `privacy.section${sId}Bullet${bId}`;
                      const content = t(bulletKey);
                      
                      // Kiểm tra nếu nội dung trả về khác với tên Key (nghĩa là key có tồn tại dữ liệu)
                      if (content !== bulletKey) {
                        return (
                          <div key={bId} className="flex items-start gap-3 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
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

            {/* Contact Card */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
               <div className="bg-slate-900 rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-white font-bold text-xl mb-2">
                      {t("privacy.contactCardTitle")}
                    </h3>
                    <p className="text-slate-400 text-sm italic">
                      {t("privacy.contactText")}
                    </p>
                  </div>
                  <a 
                    href="mailto:support@owsim.com"
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap"
                  >
                    {t("privacy.contactBtn")}
                  </a>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}