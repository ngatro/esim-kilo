import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. General Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                At OW SIM, we want you to be completely satisfied with your purchase. If you&apos;re not satisfied with your eSIM plan, we offer a refund policy as outlined below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility for Refund</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You may be eligible for a refund under the following conditions:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Request made within 7 days of purchase</li>
                <li>eSIM has not been activated or used</li>
                <li>Technical issues preventing eSIM installation that we cannot resolve</li>
                <li>Service unavailable in your destination country</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Non-Refundable Items</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>eSIM activation codes that have been activated</li>
                <li>Requests made after 7 days from purchase date</li>
                <li>Change of travel plans</li>
                <li>Reduced data usage than expected</li>
                <li>Network coverage issues in remote areas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. How to Request a Refund</h2>
              <p className="text-slate-300 leading-relaxed">
                To request a refund, please contact our support team at support@ow-sim.com with your order number and reason for the refund request. Our team will review your request within 3-5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Refund Processing</h2>
              <p className="text-slate-300 leading-relaxed">
                Approved refunds will be processed within 5-10 business days and credited to your original payment method. You will receive a confirmation email once the refund has been processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Partial Refunds</h2>
              <p className="text-slate-300 leading-relaxed">
                In some cases, partial refunds may be offered based on unused data or remaining validity period. Each case is reviewed individually by our support team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about our Refund Policy, please contact us at support@ow-sim.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
