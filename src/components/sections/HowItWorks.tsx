const STEPS = [
  {
    step: "01",
    icon: "🔍",
    title: "Choose Your Destination",
    description:
      "Browse our plans by region or country. Compare data, validity, and pricing to find the perfect plan for your trip.",
  },
  {
    step: "02",
    icon: "💳",
    title: "Purchase Instantly",
    description:
      "Secure checkout in seconds. Pay with card or popular digital wallets. No subscription, no hidden fees.",
  },
  {
    step: "03",
    icon: "📱",
    title: "Activate Your eSIM",
    description:
      "Scan the QR code we send to your email and install the eSIM profile on your compatible device in minutes.",
  },
  {
    step: "04",
    icon: "✈️",
    title: "Fly & Stay Connected",
    description:
      "Land at your destination and connect automatically. Browse, map, message — no roaming charges, ever.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get connected in four simple steps — from browsing to boarding in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-sky-500/40 to-transparent z-10" />
              )}

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-xs font-bold text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
