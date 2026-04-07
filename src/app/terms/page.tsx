import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using OW SIM&apos;s services, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using OW SIM&apos;s services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-slate-300 leading-relaxed">
                OW SIM provides eSIM data plans for international travelers. The service includes access to mobile data in various countries through eSIM technology. We reserve the right to modify or discontinue the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="text-slate-300 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Payment and Billing</h2>
              <p className="text-slate-300 leading-relaxed">
                All purchases are final unless otherwise stated in our Refund Policy. You agree to pay all charges associated with your use of the service at the prices then in effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. eSIM Activation</h2>
              <p className="text-slate-300 leading-relaxed">
                Once purchased, eSIM activation codes will be delivered via email within minutes. You are responsible for ensuring your device is eSIM-compatible. Activation codes are non-refundable after 30 days from purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed">
                OW SIM shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at support@ow-sim.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
