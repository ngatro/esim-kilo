import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RATES, type ExchangeRates } from "@/lib/currency";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { UIProvider } from "@/components/providers/UIProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/ui/LoginModal";
import RegisterModal from "@/components/ui/RegisterModal";
import ResetPasswordModal from "@/components/ui/ResetPasswordModal";
import CartModal from "@/components/ui/CartModal";
import SupportWidget from "@/components/ui/SupportWidget";
import PromotionPopup from "@/components/promotions/PromotionPopup";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OW SIM — OpenWorld eSIM | Stay Connected Anywhere",
  description: "Affordable eSIM data plans for international travel. Instant activation in 190+ countries. No roaming fees, no contracts.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

async function getRates(): Promise<ExchangeRates> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "currency_rates" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (error) {
    console.error("[Layout] Failed to fetch rates:", error);
  }
  return DEFAULT_RATES;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rates = await getRates();
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider initialRates={rates}>
          <AuthProvider session={session}>
            <CartProvider>
              <UIProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <LoginModal />
                <RegisterModal />
                <ResetPasswordModal />
                <CartModal />
                <SupportWidget />
                <PromotionPopup />
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
