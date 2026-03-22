"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "en" | "vi";

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
      total: "Total",
      price: "Price",
      quantity: "Quantity",
      remove: "Remove",
      search: "Search",
      searchPlaceholder: "Search by destination...",
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
      total: "Tổng cộng",
      price: "Giá",
      quantity: "Số lượng",
      remove: "Xóa",
      search: "Tìm kiếm",
      searchPlaceholder: "Tìm theo điểm đến...",
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
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved === "vi" || saved === "en") {
        setLocale(saved);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("locale", locale);
    }
  }, [locale, mounted]);

  function t(key: string): string {
    const currentLocale = mounted ? locale : "en";
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
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
