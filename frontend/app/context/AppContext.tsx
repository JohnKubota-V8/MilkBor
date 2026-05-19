"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Product } from "../data/mockData";

interface User {
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginAsGuest: (name: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const login = (email: string, password: string): boolean => {
    if (email === "admin@everyday-pairs.com" && password === "admin123") {
      setUser({ name: "Admin", email, role: "admin" });
      return true;
    }
    if (password.length >= 4) {
      setUser({ name: email.split("@")[0] || "ลูกค้า", email, role: "customer" });
      return true;
    }
    return false;
  };

  const loginAsGuest = (name: string) => {
    setUser({ name: name || "ลูกค้าทั่วไป", email: "", role: "customer" });
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, user, login, loginAsGuest, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
