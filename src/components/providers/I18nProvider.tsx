"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "vi" | "de" | "fr";

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
  en: {
    common: {
      home: "Home",
      plans: "Plans",
      cart: "Cart",
      login: "Login",
      register: "Register",
      logout: "Logout",
      checkout: "Checkout",
      orders: "My Orders",
      admin: "Admin",
      blog: "Blog",
      total: "Total",
      price: "Price",
      quantity: "Quantity",
      remove: "Remove",
      search: "Search",
      searchPlaceholder: "Search by destination...",
      readMore: "Read More",
      back: "Back",
    },
    hero: {
      title: "Stay Connected Anywhere",
      subtitle: "Affordable eSIM data plans for international travel",
      cta: "Get Started",
      countries: "Countries",
      operators: "Operators",
      plans: "Plans",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Simple 4-step process to get connected",
      step1: "Choose Plan",
      step1Desc: "Select the perfect eSIM plan for your destination",
      step2: "Receive QR Code",
      step2Desc: "Get your QR code instantly via email",
      step3: "Install eSIM",
      step3Desc: "Install the eSIM on your device",
      step4: "Stay Connected",
      step4Desc: "Enjoy seamless internet connection abroad",
    },
    plans: {
      title: "Available Plans",
      subtitle: "Browse our extensive collection of eSIM data plans",
      filterByRegion: "Filter by Region",
      allRegions: "All Regions",
      viewDetails: "View Details",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      days: "days",
      gb: "GB",
      unlimited: "Unlimited",
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      continueShopping: "Continue Shopping",
      proceedCheckout: "Proceed to Checkout",
      clearCart: "Clear Cart",
    },
    auth: {
      signIn: "Sign in to your account",
      signUp: "Create your account",
      email: "Email address",
      password: "Password",
      name: "Full name",
      confirmPassword: "Confirm Password",
      submitLogin: "Sign in",
      submitRegister: "Create account",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
    },
    admin: {
      dashboard: "Admin Dashboard",
      managePlans: "Manage Plans",
      manageOrders: "Manage Orders",
      manageUsers: "Manage Users",
      manageBlog: "Manage Blog",
    },
    blog: {
      title: "Blog",
      subtitle: "Travel tips, eSIM guides, and latest news",
      featured: "Featured",
      latest: "Latest Articles",
      readTime: "min read",
      searchPlaceholder: "Search articles...",
      categories: {
        all: "All Posts",
        travel: "Travel Tips",
        esim: "eSIM Guide",
        tech: "Technology",
        deals: "Deals & Offers",
        news: "News",
      },
    },
    footer: {
      description: "Stay connected anywhere in the world with affordable eSIM data plans for 190+ countries.",
      copyright: "All rights reserved.",
      madeFor: "Made for travelers. Powered by global networks.",
    },
  },
  vi: {
    common: {
      home: "Trang chủ",
      plans: "Gói dữ liệu",
      cart: "Giỏ hàng",
      login: "Đăng nhập",
      register: "Đăng ký",
      logout: "Đăng xuất",
      checkout: "Thanh toán",
      orders: "Đơn hàng",
      admin: "Quản trị",
      blog: "Blog",
      total: "Tổng cộng",
      price: "Giá",
      quantity: "Số lượng",
      remove: "Xóa",
      search: "Tìm kiếm",
      searchPlaceholder: "Tìm theo điểm đến...",
      readMore: "Xem thêm",
      back: "Quay lại",
    },
    hero: {
      title: "Luôn kết nối mọi nơi",
      subtitle: "Gói dữ liệu eSIM giá rẻ cho du lịch quốc tế",
      cta: "Bắt đầu",
      countries: "Quốc gia",
      operators: "Nhà mạng",
      plans: "Gói dữ liệu",
    },
    howItWorks: {
      title: "Cách hoạt động",
      subtitle: "Quy trình 4 bước đơn giản để kết nối",
      step1: "Chọn gói",
      step1Desc: "Chọn gói eSIM hoàn hảo cho điểm đến của bạn",
      step2: "Nhận mã QR",
      step2Desc: "Nhận mã QR ngay lập tức qua email",
      step3: "Cài đặt eSIM",
      step3Desc: "Cài đặt eSIM trên thiết bị của bạn",
      step4: "Luôn kết nối",
      step4Desc: "Tận hưởng kết nối internet liên tục khi ở nước ngoài",
    },
    plans: {
      title: "Các gói dữ liệu có sẵn",
      subtitle: "Duyệt bộ sưu tập rộng lớn các gói dữ liệu eSIM",
      filterByRegion: "Lọc theo khu vực",
      allRegions: "Tất cả khu vực",
      viewDetails: "Xem chi tiết",
      addToCart: "Thêm vào giỏ",
      buyNow: "Mua ngay",
      days: "ngày",
      gb: "GB",
      unlimited: "Không giới hạn",
    },
    cart: {
      title: "Giỏ hàng",
      empty: "Giỏ hàng trống",
      continueShopping: "Tiếp tục mua sắm",
      proceedCheckout: "Tiến hành thanh toán",
      clearCart: "Xóa Giỏ",
    },
    auth: {
      signIn: "Đăng nhập vào tài khoản",
      signUp: "Tạo tài khoản",
      email: "Địa chỉ email",
      password: "Mật khẩu",
      name: "Họ và tên",
      confirmPassword: "Xác nhận mật khẩu",
      submitLogin: "Đăng nhập",
      submitRegister: "Tạo tài khoản",
      noAccount: "Bạn chưa có tài khoản?",
      hasAccount: "Bạn đã có tài khoản?",
    },
    admin: {
      dashboard: "Bảng điều khiển",
      managePlans: "Quản lý gói",
      manageOrders: "Quản lý đơn hàng",
      manageUsers: "Quản lý người dùng",
      manageBlog: "Quản lý blog",
    },
    blog: {
      title: "Blog",
      subtitle: "Mẹo du lịch, hướng dẫn eSIM và tin tức mới nhất",
      featured: "Nổi bật",
      latest: "Bài viết mới nhất",
      readTime: "phút đọc",
      searchPlaceholder: "Tìm bài viết...",
      categories: {
        all: "Tất cả",
        travel: "Mẹo du lịch",
        esim: "Hướng dẫn eSIM",
        tech: "Công nghệ",
        deals: "Khuyến mãi",
        news: "Tin tức",
      },
    },
    footer: {
      description: "Luôn kết nối ở bất kỳ đâu trên thế giới với các gói dữ liệu eSIM giá rẻ cho hơn 190 quốc gia.",
      copyright: "Tất cả các quyền.",
      madeFor: "Dành cho du khách. Được cung cấp bởi các mạng toàn cầu.",
    },
  },
  de: {
    common: {
      home: "Startseite",
      plans: "Tarife",
      cart: "Warenkorb",
      login: "Anmelden",
      register: "Registrieren",
      logout: "Abmelden",
      checkout: "Zur Kasse",
      orders: "Meine Bestellungen",
      admin: "Admin",
      blog: "Blog",
      total: "Gesamt",
      price: "Preis",
      quantity: "Menge",
      remove: "Entfernen",
      search: "Suchen",
      searchPlaceholder: "Nach Reiseziel suchen...",
      readMore: "Mehr lesen",
      back: "Zurück",
    },
    hero: {
      title: "Bleiben Sie überall verbunden",
      subtitle: "Erschwingliche eSIM-Datentarife für internationale Reisen",
      cta: "Loslegen",
      countries: "Länder",
      operators: "Anbieter",
      plans: "Tarife",
    },
    howItWorks: {
      title: "So funktioniert es",
      subtitle: "Einfacher 4-Schritt-Prozess zur Verbindung",
      step1: "Tarif wählen",
      step1Desc: "Wählen Sie den perfekten eSIM-Tarif für Ihr Reiseziel",
      step2: "QR-Code erhalten",
      step2Desc: "Erhalten Sie Ihren QR-Code sofort per E-Mail",
      step3: "eSIM installieren",
      step3Desc: "Installieren Sie die eSIM auf Ihrem Gerät",
      step4: "Verbunden bleiben",
      step4Desc: "Genießen Sie nahtlose Internetverbindung im Ausland",
    },
    plans: {
      title: "Verfügbare Tarife",
      subtitle: "Durchsuchen Sie unsere umfangreiche Sammlung von eSIM-Datentarifen",
      filterByRegion: "Nach Region filtern",
      allRegions: "Alle Regionen",
      viewDetails: "Details anzeigen",
      addToCart: "In den Warenkorb",
      buyNow: "Jetzt kaufen",
      days: "Tage",
      gb: "GB",
      unlimited: "Unbegrenzt",
    },
    cart: {
      title: "Warenkorb",
      empty: "Ihr Warenkorb ist leer",
      continueShopping: "Weiter einkaufen",
      proceedCheckout: "Zur Kasse gehen",
      clearCart: "Warenkorb leeren",
    },
    auth: {
      signIn: "In Ihr Konto einloggen",
      signUp: "Konto erstellen",
      email: "E-Mail-Adresse",
      password: "Passwort",
      name: "Vollständiger Name",
      confirmPassword: "Passwort bestätigen",
      submitLogin: "Anmelden",
      submitRegister: "Konto erstellen",
      noAccount: "Noch kein Konto?",
      hasAccount: "Bereits ein Konto?",
    },
    admin: {
      dashboard: "Admin-Dashboard",
      managePlans: "Tarife verwalten",
      manageOrders: "Bestellungen verwalten",
      manageUsers: "Benutzer verwalten",
      manageBlog: "Blog verwalten",
    },
    blog: {
      title: "Blog",
      subtitle: "Reisetipps, eSIM-Anleitungen und aktuelle Nachrichten",
      featured: "Empfohlen",
      latest: "Neueste Artikel",
      readTime: "Min. Lesezeit",
      searchPlaceholder: "Artikel suchen...",
      categories: {
        all: "Alle Beiträge",
        travel: "Reisetipps",
        esim: "eSIM Anleitung",
        tech: "Technologie",
        deals: "Angebote",
        news: "Nachrichten",
      },
    },
    footer: {
      description: "Bleiben Sie überall auf der Welt verbunden mit erschwinglichen eSIM-Datentarifen für über 190 Länder.",
      copyright: "Alle Rechte vorbehalten.",
      madeFor: "Gemacht für Reisende. Angetrieben von globalen Netzwerken.",
    },
  },
  fr: {
    common: {
      home: "Accueil",
      plans: "Forfaits",
      cart: "Panier",
      login: "Connexion",
      register: "S'inscrire",
      logout: "Déconnexion",
      checkout: "Paiement",
      orders: "Mes commandes",
      admin: "Admin",
      blog: "Blog",
      total: "Total",
      price: "Prix",
      quantity: "Quantité",
      remove: "Supprimer",
      search: "Rechercher",
      searchPlaceholder: "Rechercher par destination...",
      readMore: "Lire la suite",
      back: "Retour",
    },
    hero: {
      title: "Restez connecté partout",
      subtitle: "Forfaits de données eSIM abordables pour les voyages internationaux",
      cta: "Commencer",
      countries: "Pays",
      operators: "Opérateurs",
      plans: "Forfaits",
    },
    howItWorks: {
      title: "Comment ça marche",
      subtitle: "Processus simple en 4 étapes pour se connecter",
      step1: "Choisir un forfait",
      step1Desc: "Sélectionnez le forfait eSIM parfait pour votre destination",
      step2: "Recevoir le code QR",
      step2Desc: "Recevez votre code QR instantanément par e-mail",
      step3: "Installer l'eSIM",
      step3Desc: "Installez l'eSIM sur votre appareil",
      step4: "Rester connecté",
      step4Desc: "Profitez d'une connexion Internet fluide à l'étranger",
    },
    plans: {
      title: "Forfaits disponibles",
      subtitle: "Parcourez notre vaste collection de forfaits de données eSIM",
      filterByRegion: "Filtrer par région",
      allRegions: "Toutes les régions",
      viewDetails: "Voir les détails",
      addToCart: "Ajouter au panier",
      buyNow: "Acheter maintenant",
      days: "jours",
      gb: "Go",
      unlimited: "Illimité",
    },
    cart: {
      title: "Panier",
      empty: "Votre panier est vide",
      continueShopping: "Continuer les achats",
      proceedCheckout: "Passer à la caisse",
      clearCart: "Vider le panier",
    },
    auth: {
      signIn: "Connectez-vous à votre compte",
      signUp: "Créer un compte",
      email: "Adresse e-mail",
      password: "Mot de passe",
      name: "Nom complet",
      confirmPassword: "Confirmer le mot de passe",
      submitLogin: "Se connecter",
      submitRegister: "Créer un compte",
      noAccount: "Pas encore de compte?",
      hasAccount: "Déjà un compte?",
    },
    admin: {
      dashboard: "Tableau de bord Admin",
      managePlans: "Gérer les forfaits",
      manageOrders: "Gérer les commandes",
      manageUsers: "Gérer les utilisateurs",
      manageBlog: "Gérer le blog",
    },
    blog: {
      title: "Blog",
      subtitle: "Conseils de voyage, guides eSIM et dernières nouvelles",
      featured: "À la une",
      latest: "Derniers articles",
      readTime: "min de lecture",
      searchPlaceholder: "Rechercher des articles...",
      categories: {
        all: "Tous les articles",
        travel: "Conseils voyage",
        esim: "Guide eSIM",
        tech: "Technologie",
        deals: "Offres",
        news: "Actualités",
      },
    },
    footer: {
      description: "Restez connecté n'importe où dans le monde avec des forfaits de données eSIM abordables pour plus de 190 pays.",
      copyright: "Tous droits réservés.",
      madeFor: "Fait pour les voyageurs. Propulsé par les réseaux mondiaux.",
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const SUPPORTED_LOCALES: Locale[] = ["en", "vi", "de", "fr"];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
        setLocaleState(saved as Locale);
      }
    } catch {
      // ignore
    }
    setIsReady(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem("locale", newLocale);
      } catch {
        // ignore
      }
    }
  };

  function t(key: string): string {
    const currentLocale = isReady ? locale : "en";
    const keys = key.split(".");
    let result: unknown = translations[currentLocale];
    for (const k of keys) {
      if (result && typeof result === "object") {
        result = (result as Record<string, unknown>)[k];
      }
    }
    return typeof result === "string" ? result : key;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isReady }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en" as Locale, label: "English", flag: "🇺🇸" },
  { code: "vi" as Locale, label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "de" as Locale, label: "Deutsch", flag: "🇩🇪" },
  { code: "fr" as Locale, label: "Français", flag: "🇫🇷" },
];
