import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <span className="text-xl font-bold text-white tracking-tight">
            Sim<span className="text-sky-400">Pal</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/#plans" className="hover:text-white transition-colors">Plans</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="/#destinations" className="hover:text-white transition-colors">Destinations</Link>
          <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </button>
          <button className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
