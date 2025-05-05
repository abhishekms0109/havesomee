"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, Heart, Search, Filter, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/components/cart-context"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import type { Sweet } from "@/lib/sweets-service"

interface SweetsSelectionProps {
  onComplete: () => void
  sweets: Sweet[]
}

export function SweetsSelection({ onComplete, sweets }: SweetsSelectionProps) {
  const { items, addItem, removeItem, getTotal } = useCart()
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const scrollPositionRef = useRef(0)

  // Initialize selected sizes
  useEffect(() => {
    const initialSizes: Record<string, string> = {}
    sweets.forEach((sweet) => {
      initialSizes[sweet.id] = sweet.sizes[0].size
    })
    setSelectedSizes(initialSizes)
  }, [sweets])

  // Handle body scroll lock when cart is open
  useEffect(() => {
    if (isCartOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      // Add styles to prevent body scrolling
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = "100%"
    } else {
      // Restore scrolling
      document.body.style.removeProperty("overflow")
      document.body.style.removeProperty("position")
      document.body.style.removeProperty("top")
      document.body.style.removeProperty("width")
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current)
    }

    // Cleanup function
    return () => {
      document.body.style.removeProperty("overflow")
      document.body.style.removeProperty("position")
      document.body.style.removeProperty("top")
      document.body.style.removeProperty("width")
    }
  }, [isCartOpen])

  const handleOpenCart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCartOpen(true)
  }

  const handleCloseCart = () => {
    setIsCartOpen(false)
  }

  const handleSizeChange = (sweetId: string, size: string) => {
    setSelectedSizes({ ...selectedSizes, [sweetId]: size })
  }

  const incrementQuantity = (sweetId: string) => {
    setQuantities({
      ...quantities,
      [sweetId]: (quantities[sweetId] || 0) + 1,
    })
  }

  const decrementQuantity = (sweetId: string) => {
    if ((quantities[sweetId] || 0) > 0) {
      setQuantities({
        ...quantities,
        [sweetId]: quantities[sweetId] - 1,
      })
    }
  }

  const toggleFavorite = (sweetId: string) => {
    if (favorites.includes(sweetId)) {
      setFavorites(favorites.filter((id) => id !== sweetId))
    } else {
      setFavorites([...favorites, sweetId])
      toast({
        title: "Added to favorites",
        description: "This item has been added to your favorites",
        duration: 2000,
      })
    }
  }

  const handleAddToCart = (sweet: Sweet) => {
    const selectedSize = selectedSizes[sweet.id] || sweet.sizes[0].size
    const quantity = quantities[sweet.id] || 0

    if (quantity > 0) {
      const sizeInfo = sweet.sizes.find((s) => s.size === selectedSize)

      if (sizeInfo) {
        addItem({
          id: sweet.id,
          name: sweet.name,
          image: sweet.image,
          price: sizeInfo.price,
          quantity: quantity,
          size: selectedSize,
        })

        // Reset quantity after adding to cart
        setQuantities({
          ...quantities,
          [sweet.id]: 0,
        })

        toast({
          title: "Added to cart",
          description: `${quantity} × ${sweet.name} (${selectedSize}) added to your cart`,
          duration: 2000,
        })
      }
    }
  }

  const handleRemoveFromCart = (id: string, size: string) => {
    removeItem(id, size)
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
      duration: 2000,
    })
  }

  // Filter sweets based on search query and active filter
  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch =
      sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweet.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === null) return true
    if (activeFilter === "featured") return sweet.featured
    if (activeFilter === "favorites") return favorites.includes(sweet.id)
    return sweet.tags?.includes(activeFilter)
  })

  const allTags = Array.from(new Set(sweets.flatMap((sweet) => sweet.tags || [])))

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-orange-800">Select Your Sweets</h2>
          <p className="text-sm md:text-base text-gray-500">
            Choose from our delicious collection of traditional Indian sweets
          </p>
        </div>
        <Button
          variant="outline"
          className="relative border-orange-200 hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm transition-all"
          onClick={handleOpenCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4 text-orange-500" />
          <span>Cart</span>
          {totalItems > 0 && (
            <Badge className="absolute -right-2 -top-2 bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
            />
          </div>
          <Select value={activeFilter || ""} onValueChange={(value) => setActiveFilter(value === "" ? null : value)}>
            <SelectTrigger className="w-full md:w-[180px] border-orange-200 focus:ring-orange-500 bg-white/70 backdrop-blur-sm">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 whitespace-nowrap">
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(null)}
              className={
                activeFilter === null
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm"
                  : "border-orange-200 hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm"
              }
            >
              All
            </Button>
            <Button
              variant={activeFilter === "featured" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("featured")}
              className={
                activeFilter === "featured"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm"
                  : "border-orange-200 hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm"
              }
            >
              Featured
            </Button>
            <Button
              variant={activeFilter === "favorites" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("favorites")}
              className={
                activeFilter === "favorites"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm"
                  : "border-orange-200 hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm"
              }
            >
              Favorites
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={activeFilter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(tag)}
                className={
                  activeFilter === tag
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm"
                    : "border-orange-200 hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm"
                }
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <AnimatePresence>
          {filteredSweets.map((sweet) => (
            <motion.div
              key={sweet.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="group overflow-hidden border-orange-100/50 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 h-full flex flex-col">
                <div className="relative h-36 md:h-48 w-full overflow-hidden">
                  <Image
                    src={sweet.image || "/placeholder.svg"}
                    alt={sweet.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 p-1 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
                    onClick={() => toggleFavorite(sweet.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(sweet.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                      }`}
                    />
                  </Button>
                  {sweet.featured && (
                    <div className="absolute left-0 top-3 bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 text-xs font-medium text-white shadow-md">
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 flex w-full flex-wrap gap-1 p-2">
                    {sweet.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-orange-800 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="mb-1 text-base md:text-lg font-bold text-orange-800">{sweet.name}</h3>
                  <p className="mb-3 md:mb-4 text-xs md:text-sm text-gray-500 flex-grow line-clamp-2 md:line-clamp-none">
                    {sweet.description}
                  </p>

                  <div className="mb-4">
                    <Select
                      value={selectedSizes[sweet.id] || sweet.sizes[0].size}
                      onValueChange={(value) => handleSizeChange(sweet.id, value)}
                    >
                      <SelectTrigger className="w-full border-orange-200 focus:ring-orange-500 bg-white/70">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sweet.sizes.map((size) => (
                          <SelectItem key={size.size} value={size.size}>
                            {size.size} - ₹{size.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-orange-200 hover:bg-orange-50/50 bg-white/70"
                        onClick={() => decrementQuantity(sweet.id)}
                        disabled={(quantities[sweet.id] || 0) <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantities[sweet.id] || 0}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-orange-200 hover:bg-orange-50/50 bg-white/70"
                        onClick={() => incrementQuantity(sweet.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <span className="font-bold text-orange-800">
                      ₹
                      {sweet.sizes.find((s) => s.size === (selectedSizes[sweet.id] || sweet.sizes[0].size))?.price || 0}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30"
                    onClick={() => handleAddToCart(sweet)}
                    disabled={(quantities[sweet.id] || 0) <= 0}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Popup (floating at top) */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCart}
            />

            <motion.div
              className="relative w-[95%] max-w-2xl max-h-[80vh] bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-orange-100/50 flex flex-col"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-3 md:p-4 border-b border-orange-100/50 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-orange-800">Your Cart</h3>
                <Button variant="ghost" size="icon" onClick={handleCloseCart}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                {items.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-gray-500">Your cart is empty</div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${item.size}-${index}`}
                          className="flex items-center space-x-4 bg-white/50 p-3 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-orange-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.size} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <p className="font-medium text-orange-800">₹{item.price * item.quantity}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleRemoveFromCart(item.id, item.size)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-orange-100/50">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold text-orange-800">₹{getTotal()}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 border-orange-200" onClick={handleCloseCart}>
                    Continue Shopping
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20"
                    onClick={() => {
                      handleCloseCart()
                      onComplete()
                    }}
                    disabled={items.length === 0}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        <Button
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30"
          onClick={onComplete}
          disabled={items.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </motion.div>
  )
}
