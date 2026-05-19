import React, { createContext, useContext, useState, useEffect } from "react";
import { Bag } from "../types.ts";

interface CartItem {
  bagId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (bag: Bag) => void;
  updateQuantity: (bagId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const addToCart = (bag: Bag) => {
    const bagId = bag._id || (bag as any).id;
    const existing = cart.find((item) => item.bagId === bagId);

    if (existing) {
      updateQuantity(bagId, 1);
    } else {
      const newItem: CartItem = {
        bagId: bagId,
        name: bag.name,
        price: bag.price,
        quantity: 1,
        imageUrl: Array.isArray(bag.image) ? bag.image[0] : bag.image,
      };
      saveCart([...cart, newItem]);
    }
  };

  const updateQuantity = (bagId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.bagId === bagId) {
          const updatedQty = item.quantity + delta;
          return { ...item, quantity: updatedQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};