import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | OpenWorldeSIM",
  description: "Get help with your eSIM purchase and activation",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">How can we help?</h1>
            <p className="text-lg text-slate-600">Choose your preferred way to reach us</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <a
              href="#live-chat"
              className="bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-2xl p-6 text-center transition-colors group"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 transition-colors">
                <svg className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Live Chat</h3>
              <p className="text-sm text-slate-500">Chat with us directly</p>
              <span className="inline-block mt-3 text-xs font-medium text-green-600">Online now</span>
            </a>

            <a
              href="https://wa.me/84912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-2xl p-6 text-center transition-colors group"
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                <svg className="w-7 h-7 text-green-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">WhatsApp</h3>
              <p className="text-sm text-slate-500">Message us on WhatsApp</p>
              <span className="inline-block mt-3 text-xs font-medium text-green-600">Quick response</span>
            </a>

            <a
              href="mailto:support@openworldesim.com"
              className="bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-2xl p-6 text-center transition-colors group"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                <svg className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-5 8v1a2 2 0 002 2h2a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Email</h3>
              <p className="text-sm text-slate-500">Send us an email</p>
              <span className="inline-block mt-3 text-xs font-medium text-slate-500">24-48 hours</span>
            </a>
          </div>

          <div id="live-chat" className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Start a Live Chat</h2>
            <p className="text-slate-600 mb-6">Click the chat button in the bottom right corner to start chatting with our support team.</p>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Typically replies within minutes</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Common Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">How do I activate my eSIM?</h3>
                <p className="text-slate-600">After purchase, you'll receive an email with activation instructions. Go to your phone's Settings &gt; Cellular/Mobile Data &gt; Add Cellular Plan, then scan the QR code or enter the activation code manually.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What if my eSIM doesn't work?</h3>
                <p className="text-slate-600">Contact our support team immediately. We offer a 7-day refund policy for unused plans. Make sure your device is eSIM-compatible before purchasing.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Can I top up my data?</h3>
                <p className="text-slate-600">Yes! Most of our plans support data top-up. Check the plan details or visit our top-up page to add more data to your existing eSIM.</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Still need help?</h2>
            <p className="text-slate-600 mb-6">Our support team is available 24/7 to assist you with any questions or issues.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/84912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="mailto:support@openworldesim.com"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-400 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-5 8v1a2 2 0 002 2h2a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Email Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}