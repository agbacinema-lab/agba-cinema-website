"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ShopProduct } from "@/lib/types"

export interface CartItem {
  id: string
  title: string
  price: number
  image?: string
  quantity: number
  variantSelected?: { [key: string]: string }
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Persistence protocol
  useEffect(() => {
    const savedCart = localStorage.getItem("agba_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Cart corruption detected")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("agba_cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p => 
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId)
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      subtotal, 
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
