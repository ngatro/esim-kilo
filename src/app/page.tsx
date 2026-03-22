import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import PlansSection from "@/components/sections/PlansSection";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <PlansSection />
        <FAQ />

        {/* CTA Banner */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-sky-600/20 to-indigo-600/20 border border-sky-500/20 rounded-3xl p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready for your next adventure?
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                Join 500,000+ travelers who stay connected without the roaming bill shock.
              </p>
              <a
                href="#plans"
                className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl shadow-sky-900/30"
              >
                Find Your Plan
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
