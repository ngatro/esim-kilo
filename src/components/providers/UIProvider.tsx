"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface UIContextType {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isCartOpen: boolean;
  isResetPasswordOpen: boolean;
  resetPasswordToken: string | null;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  openCart: () => void;
  closeCart: () => void;
  openLoginModal: () => void;
  openResetPassword: (token?: string) => void;
  closeResetPassword: () => void;
  closeAll: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);

  const openLogin = useCallback(() => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsCartOpen(false);
    setIsResetPasswordOpen(false);
  }, []);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  
  const openRegister = useCallback(() => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsCartOpen(false);
    setIsResetPasswordOpen(false);
  }, []);

  const closeRegister = useCallback(() => setIsRegisterOpen(false), []);
  
  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsResetPasswordOpen(false);
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  
  const openLoginModal = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const openResetPassword = useCallback((token?: string) => {
    setResetPasswordToken(token || null);
    setIsResetPasswordOpen(true);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsCartOpen(false);
  }, []);

  const closeResetPassword = useCallback(() => {
    setIsResetPasswordOpen(false);
    setResetPasswordToken(null);
  }, []);

  const closeAll = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsCartOpen(false);
    setIsResetPasswordOpen(false);
    setResetPasswordToken(null);
  }, []);

  return (
    <UIContext.Provider value={{
      isLoginOpen,
      isRegisterOpen,
      isCartOpen,
      isResetPasswordOpen,
      resetPasswordToken,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
      openCart,
      closeCart,
      openLoginModal,
      openResetPassword,
      closeResetPassword,
      closeAll,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
