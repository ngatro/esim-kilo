import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📡</span>
              <span className="text-xl font-bold text-white">
                Sim<span className="text-sky-400">Pal</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Stay connected anywhere in the world with affordable eSIM data plans for 190+ countries.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Plans</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/#plans" className="hover:text-slate-300 transition-colors">Browse All Plans</Link></li>
              <li><Link href="/#plans" className="hover:text-slate-300 transition-colors">Global Plans</Link></li>
              <li><Link href="/#plans" className="hover:text-slate-300 transition-colors">Regional Plans</Link></li>
              <li><Link href="/#plans" className="hover:text-slate-300 transition-colors">Country Plans</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/#how-it-works" className="hover:text-slate-300 transition-colors">How It Works</Link></li>
              <li><Link href="/#faq" className="hover:text-slate-300 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-slate-300 transition-colors">Device Compatibility</Link></li>
              <li><Link href="#" className="hover:text-slate-300 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-slate-300 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-slate-300 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} SimPal. All rights reserved.</p>
          <p>Made for travelers. Powered by global networks.</p>
        </div>
      </div>
    </footer>
  );
}
