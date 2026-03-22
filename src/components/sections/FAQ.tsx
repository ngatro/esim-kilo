"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is an eSIM?",
    a: "An eSIM (embedded SIM) is a digital SIM that lets you activate a mobile plan without needing a physical SIM card. It is built into your device and can be programmed with any compatible plan.",
  },
  {
    q: "Which devices support eSIM?",
    a: "Most modern smartphones support eSIM, including iPhone XS and later, Google Pixel 3 and later, Samsung Galaxy S20 and later, and many other Android devices. Check your device settings under 'Mobile Data' or 'SIM & Network' to confirm.",
  },
  {
    q: "How fast is activation?",
    a: "Instant! After checkout you receive a QR code by email. Scan it to install the eSIM profile — this takes under 2 minutes. The plan activates automatically when you arrive at your destination.",
  },
  {
    q: "Can I keep my existing number?",
    a: "Yes. Your primary physical SIM (and number) stays active for calls and texts. The eSIM is used only for data, so you keep your number while using affordable local data rates.",
  },
  {
    q: "What happens when I run out of data?",
    a: "You will receive a notification when your data is running low. Many plans support top-ups, which you can purchase directly from our app or website.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. The price you see is the price you pay. There are no activation fees, subscription charges, or roaming surcharges.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-900/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-lg">Everything you need to know before your next trip.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-white font-medium">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-sky-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-45" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
