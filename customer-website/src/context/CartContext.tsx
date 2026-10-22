import React, { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, Product } from "../types"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  originalTotal: number
  savings: number
  deliveryFee: number
  finalTotal: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  lastAddedProduct: Product | null
  showToast: boolean
  dismissToast: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "freshsave_cart_v1"

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error("Failed to save cart to localStorage", err)
    }
  }, [items])

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id)
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { product, quantity }]
    })

    setLastAddedProduct(product)
    setShowToast(true)
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const dismissToast = () => setShowToast(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = Number(
    items
      .reduce((sum, item) => {
        const unitPrice =
          item.product.discount_price && item.product.discount_price > 0
            ? item.product.discount_price
            : item.product.base_price
        return sum + unitPrice * item.quantity
      }, 0)
      .toFixed(2)
  )

  const originalTotal = Number(
    items
      .reduce((sum, item) => sum + item.product.base_price * item.quantity, 0)
      .toFixed(2)
  )

  const savings = Math.max(0, Number((originalTotal - subtotal).toFixed(2)))
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 40
  const finalTotal = Number((subtotal + deliveryFee).toFixed(2))

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        originalTotal,
        savings,
        deliveryFee,
        finalTotal,
        isCartOpen,
        openCart,
        closeCart,
        lastAddedProduct,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
