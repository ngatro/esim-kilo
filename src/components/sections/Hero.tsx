export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sky-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          190+ Countries Covered
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Travel Data,{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            No Borders
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-10">
          Instant eSIM activation. Affordable data plans. Stay connected the moment you land — no physical SIM, no roaming surprises.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#plans"
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-sky-900/30"
          >
            Browse Plans
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            How It Works
          </a>
        </div>

        {/* Trust stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
          {[
            { value: "190+", label: "Countries" },
            { value: "500K+", label: "Travelers Served" },
            { value: "Instant", label: "Activation" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
