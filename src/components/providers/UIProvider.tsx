"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface UIContextType {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isCartOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  openCart: () => void;
  closeCart: () => void;
  openLoginModal: () => void;
  closeAll: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openLogin = useCallback(() => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsCartOpen(false);
  }, []);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  
  const openRegister = useCallback(() => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsCartOpen(false);
  }, []);

  const closeRegister = useCallback(() => setIsRegisterOpen(false), []);
  
  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  
  const openLoginModal = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsCartOpen(false);
  }, []);

  return (
    <UIContext.Provider value={{
      isLoginOpen,
      isRegisterOpen,
      isCartOpen,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
      openCart,
      closeCart,
      openLoginModal,
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
