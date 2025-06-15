"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface SweetItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  size: string
}

interface CartContextType {
  items: SweetItem[]
  addItem: (item: SweetItem) => void
  updateItem: (id: string, quantity: number, size: string) => void
  removeItem: (id: string, size: string) => void
  clearCart: () => void
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SweetItem[]>([])

  const addItem = (item: SweetItem) => {
    // Check if the item with the same id and size already exists
    const existingItemIndex = items.findIndex((i) => i.id === item.id && i.size === item.size)

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedItems = [...items]
      updatedItems[existingItemIndex].quantity += item.quantity
      setItems(updatedItems)
    } else {
      // Add new item
      setItems([...items, item])
    }
  }

  const updateItem = (id: string, quantity: number, size: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id && item.size === size) {
        return { ...item, quantity }
      }
      return item
    })
    setItems(updatedItems)
  }

  const removeItem = (id: string, size: string) => {
    setItems(items.filter((item) => !(item.id === id && item.size === size)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        getTotal,
      }}
    >
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
