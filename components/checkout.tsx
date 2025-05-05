"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, CreditCard, Smartphone, Truck, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useOffers } from "@/hooks/use-offers"

interface CheckoutProps {
  onComplete: () => void
  onBack: () => void
}

export function Checkout({ onComplete, onBack }: CheckoutProps) {
  const { items, removeItem, getTotal } = useCart()
  const { offers } = useOffers()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    instructions: "",
    paymentMethod: "card",
    promoCode: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value,
    })
  }

  const handleRemoveItem = (id: string, size: string) => {
    removeItem(id, size)
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
      duration: 2000,
    })
  }

  const handleApplyPromo = () => {
    if (!formData.promoCode) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      })
      return
    }

    const offer = offers.find(
      (o) =>
        o.code === formData.promoCode &&
        o.isActive &&
        new Date(o.startDate) <= new Date() &&
        new Date(o.endDate) >= new Date(),
    )

    if (!offer) {
      toast({
        title: "Invalid promo code",
        description: "This promo code is invalid or expired",
        variant: "destructive",
      })
      return
    }

    // Check if the offer applies to any items in the cart
    const hasApplicableItems =
      offer.appliesTo.length === 0 || // Applies to all products
      items.some((item) => offer.appliesTo.includes(item.id))

    if (!hasApplicableItems) {
      toast({
        title: "Promo code not applicable",
        description: "This promo code doesn't apply to items in your cart",
        variant: "destructive",
      })
      return
    }

    setAppliedPromo(offer.code)
    setDiscount(offer.discount)
    toast({
      title: "Promo code applied",
      description: `${offer.discount}% discount applied to your order`,
    })
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setDiscount(0)
    setFormData({
      ...formData,
      promoCode: "",
    })
    toast({
      title: "Promo code removed",
      description: "Discount has been removed from your order",
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = "Name is required"
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits"
    }

    if (!formData.address) {
      newErrors.address = "Address is required"
    }

    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required"
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        onComplete()
      }, 1500)
    }
  }

  // Calculate subtotal, delivery fee, and total
  const subtotal = getTotal()
  const deliveryFee = subtotal > 0 ? 50 : 0
  const discountAmount = appliedPromo ? Math.round((subtotal * discount) / 100) : 0
  const total = subtotal + deliveryFee - discountAmount

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Button
        variant="ghost"
        className="mb-4 flex items-center text-orange-500 hover:bg-orange-50/50 hover:text-orange-600 transition-all"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Selection
      </Button>

      <div className="grid gap-6 md:gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-orange-800">Checkout</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="mb-4 text-lg font-semibold text-orange-700">Delivery Details</h3>

              <div className="space-y-4">
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm md:text-base">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm text-sm md:text-base"
                    />
                    {errors.name && (
                      <motion.p
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
                    />
                    {errors.phone && (
                      <motion.p
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
                  />
                  {errors.email && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
                  />
                  {errors.address && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      {errors.address}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
                  />
                  {errors.pincode && (
                    <motion.p
                      className="text-sm text-red-500"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      {errors.pincode}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                    className="border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>
            </motion.div>

            <Separator className="bg-orange-100/50" />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="mb-4 text-lg font-semibold text-orange-700">Payment Method</h3>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 rounded-md border border-orange-200 p-3 transition-colors hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex flex-1 items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-orange-500" />
                    Credit/Debit Card
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-orange-200 p-3 transition-colors hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex flex-1 items-center">
                    <Smartphone className="mr-2 h-5 w-5 text-orange-500" />
                    UPI Payment
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border border-orange-200 p-3 transition-colors hover:bg-orange-50/50 bg-white/70 backdrop-blur-sm">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex flex-1 items-center">
                    <Truck className="mr-2 h-5 w-5 text-orange-500" />
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </motion.div>

            <div className="md:hidden">
              <Separator className="mb-4 bg-orange-100/50" />
              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                discount={discountAmount}
                total={total}
                onRemoveItem={handleRemoveItem}
                promoCode={formData.promoCode}
                onPromoCodeChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                onApplyPromo={handleApplyPromo}
                appliedPromo={appliedPromo}
                onRemovePromo={handleRemovePromo}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30"
              disabled={items.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing Order...
                </div>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </div>

        <div className="hidden md:col-span-2 md:block">
          <motion.div
            className="sticky top-4 rounded-lg border border-orange-200/50 bg-white/70 backdrop-blur-sm p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-orange-700">Order Summary</h3>
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discount={discountAmount}
              total={total}
              onRemoveItem={handleRemoveItem}
              promoCode={formData.promoCode}
              onPromoCodeChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
              onApplyPromo={handleApplyPromo}
              appliedPromo={appliedPromo}
              onRemovePromo={handleRemovePromo}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

interface OrderSummaryProps {
  items: ReturnType<typeof useCart>["items"]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  onRemoveItem: (id: string, size: string) => void
  promoCode: string
  onPromoCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyPromo: () => void
  appliedPromo: string | null
  onRemovePromo: () => void
}

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  onRemoveItem,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  appliedPromo,
  onRemovePromo,
}: OrderSummaryProps) {
  return (
    <div>
      <Accordion type="single" collapsible defaultValue="items" className="mb-4">
        <AccordionItem value="items" className="border-orange-200/50">
          <AccordionTrigger className="text-sm font-medium text-orange-800 hover:text-orange-600">
            Items ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-orange-800">₹{item.price * item.quantity}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemoveItem(item.id, item.size)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mb-4">
        <div className="flex items-stretch space-x-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={onPromoCodeChange}
              className="pl-10 border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm h-9 md:h-10 text-sm md:text-base"
              disabled={!!appliedPromo}
            />
          </div>
          {appliedPromo ? (
            <Button
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 h-9 md:h-10 text-sm md:text-base"
              onClick={onRemovePromo}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-orange-200 hover:bg-orange-50/50 h-9 md:h-10 text-sm md:text-base"
              onClick={onApplyPromo}
            >
              Apply
            </Button>
          )}
        </div>
        {appliedPromo && <p className="mt-1 text-xs md:text-sm text-green-600">Promo code "{appliedPromo}" applied!</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">₹{deliveryFee}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">-₹{discount}</span>
          </div>
        )}
        <Separator className="my-2 bg-orange-100/50" />
        <div className="flex justify-between font-bold text-orange-800">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  )
}
