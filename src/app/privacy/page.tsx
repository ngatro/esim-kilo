import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-slate-300 leading-relaxed">
                At OW SIM, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our eSIM data services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Register on the Website</li>
                <li>Purchase eSIM plans</li>
                <li>Contact our support team</li>
                <li>Subscribe to our newsletter</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-300 leading-relaxed">
                We use the information we collect to: provide, maintain, and improve our services; process your transactions; send you technical notices, updates, and support messages; respond to your comments and questions; and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="text-slate-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-slate-300 leading-relaxed">
                We may share your information with third-party service providers who assist us in operating our website, conducting our business, or servicing you. These parties are obligated to maintain the confidentiality of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-slate-300 leading-relaxed">
                You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications from us at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@ow-sim.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
