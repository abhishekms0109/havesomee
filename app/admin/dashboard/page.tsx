"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, LogOut, Home, Package, Settings, ChevronDown, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  type Sweet,
  type Offer,
  adminLogout,
  deleteSweet,
  addSweet,
  updateSweet,
  addOffer,
  updateOffer,
  deleteOffer,
} from "@/lib/sweets-service"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products")
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddOfferDialogOpen, setIsAddOfferDialogOpen] = useState(false)
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false)
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [sweetFormData, setSweetFormData] = useState<Partial<Sweet>>({
    name: "",
    description: "",
    image: "/placeholder.svg?height=200&width=200",
    sizes: [
      { size: "250g", price: 0 },
      { size: "500g", price: 0 },
      { size: "1kg", price: 0 },
    ],
    featured: false,
    tags: [],
  })
  const [offerFormData, setOfferFormData] = useState<Partial<Offer>>({
    title: "",
    description: "",
    discount: 0,
    code: "",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    appliesTo: [],
    bannerColor: "#f97316",
    textColor: "#ffffff",
  })
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSweets()
    fetchOffers()
  }, [])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sweets")
      if (!response.ok) {
        throw new Error("Failed to fetch sweets")
      }
      const data = await response.json()
      setSweets(data)
    } catch (error) {
      console.error("Error fetching sweets:", error)
      toast({
        title: "Error",
        description: "Failed to load sweets data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/offers")
      if (!response.ok) {
        throw new Error("Failed to fetch offers")
      }
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error("Error fetching offers:", error)
      toast({
        title: "Error",
        description: "Failed to load offers data",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await adminLogout()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Sweet management
  const handleAddSweet = async () => {
    try {
      if (!sweetFormData.name || !sweetFormData.description) {
        toast({
          title: "Error",
          description: "Name and description are required",
          variant: "destructive",
        })
        return
      }

      const newSweet = await addSweet(sweetFormData as Omit<Sweet, "id">)
      setSweets([...sweets, newSweet])
      setIsAddDialogOpen(false)
      resetSweetForm()

      toast({
        title: "Success",
        description: "Sweet added successfully",
      })
    } catch (error) {
      console.error("Error adding sweet:", error)
      toast({
        title: "Error",
        description: "Failed to add sweet",
        variant: "destructive",
      })
    }
  }

  const handleEditSweet = async () => {
    try {
      if (!selectedSweet || !sweetFormData.name || !sweetFormData.description) {
        toast({
          title: "Error",
          description: "Name and description are required",
          variant: "destructive",
        })
        return
      }

      const updatedSweet = await updateSweet(selectedSweet.id, sweetFormData)
      setSweets(sweets.map((sweet) => (sweet.id === selectedSweet.id ? updatedSweet! : sweet)))
      setIsEditDialogOpen(false)
      resetSweetForm()

      toast({
        title: "Success",
        description: "Sweet updated successfully",
      })
    } catch (error) {
      console.error("Error updating sweet:", error)
      toast({
        title: "Error",
        description: "Failed to update sweet",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSweet = async (id: string) => {
    try {
      await deleteSweet(id)
      setSweets(sweets.filter((sweet) => sweet.id !== id))

      toast({
        title: "Success",
        description: "Sweet deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting sweet:", error)
      toast({
        title: "Error",
        description: "Failed to delete sweet",
        variant: "destructive",
      })
    }
  }

  const resetSweetForm = () => {
    setSweetFormData({
      name: "",
      description: "",
      image: "/placeholder.svg?height=200&width=200",
      sizes: [
        { size: "250g", price: 0 },
        { size: "500g", price: 0 },
        { size: "1kg", price: 0 },
      ],
      featured: false,
      tags: [],
    })
    setSelectedSweet(null)
    setTagInput("")
  }

  const handleEditSweetClick = (sweet: Sweet) => {
    setSelectedSweet(sweet)
    setSweetFormData({
      name: sweet.name,
      description: sweet.description,
      image: sweet.image,
      sizes: [...sweet.sizes],
      featured: sweet.featured,
      tags: [...sweet.tags],
    })
    setIsEditDialogOpen(true)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !sweetFormData.tags?.includes(tagInput.trim())) {
      setSweetFormData({
        ...sweetFormData,
        tags: [...(sweetFormData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSweetFormData({
      ...sweetFormData,
      tags: sweetFormData.tags?.filter((t) => t !== tag),
    })
  }

  const handleSizeChange = (index: number, field: "size" | "price", value: string | number) => {
    const newSizes = [...(sweetFormData.sizes || [])]
    newSizes[index] = {
      ...newSizes[index],
      [field]: field === "price" ? Number(value) : value,
    }
    setSweetFormData({ ...sweetFormData, sizes: newSizes })
  }

  // Offer management
  const handleAddOffer = async () => {
    try {
      if (!offerFormData.title || !offerFormData.description || !offerFormData.code) {
        toast({
          title: "Error",
          description: "Title, description, and code are required",
          variant: "destructive",
        })
        return
      }

      const newOffer = await addOffer(offerFormData as Omit<Offer, "id">)
      setOffers([...offers, newOffer])
      setIsAddOfferDialogOpen(false)
      resetOfferForm()

      toast({
        title: "Success",
        description: "Offer added successfully",
      })
    } catch (error) {
      console.error("Error adding offer:", error)
      toast({
        title: "Error",
        description: "Failed to add offer",
        variant: "destructive",
      })
    }
  }

  const handleEditOffer = async () => {
    try {
      if (!selectedOffer || !offerFormData.title || !offerFormData.description || !offerFormData.code) {
        toast({
          title: "Error",
          description: "Title, description, and code are required",
          variant: "destructive",
        })
        return
      }

      const updatedOffer = await updateOffer(selectedOffer.id, offerFormData)
      setOffers(offers.map((offer) => (offer.id === selectedOffer.id ? updatedOffer! : offer)))
      setIsEditOfferDialogOpen(false)
      resetOfferForm()

      toast({
        title: "Success",
        description: "Offer updated successfully",
      })
    } catch (error) {
      console.error("Error updating offer:", error)
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOffer = async (id: string) => {
    try {
      await deleteOffer(id)
      setOffers(offers.filter((offer) => offer.id !== id))

      toast({
        title: "Success",
        description: "Offer deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting offer:", error)
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      })
    }
  }

  const resetOfferForm = () => {
    setOfferFormData({
      title: "",
      description: "",
      discount: 0,
      code: "",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      appliesTo: [],
      bannerColor: "#f97316",
      textColor: "#ffffff",
    })
    setSelectedOffer(null)
  }

  const handleEditOfferClick = (offer: Offer) => {
    setSelectedOffer(offer)
    setOfferFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      code: offer.code,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: offer.isActive,
      appliesTo: [...offer.appliesTo],
      bannerColor: offer.bannerColor || "#f97316",
      textColor: offer.textColor || "#ffffff",
    })
    setIsEditOfferDialogOpen(true)
  }

  const handleToggleProductInOffer = (productId: string) => {
    if (offerFormData.appliesTo?.includes(productId)) {
      setOfferFormData({
        ...offerFormData,
        appliesTo: offerFormData.appliesTo.filter((id) => id !== productId),
      })
    } else {
      setOfferFormData({
        ...offerFormData,
        appliesTo: [...(offerFormData.appliesTo || []), productId],
      })
    }
  }

  const filteredSweets = sweets.filter(
    (sweet) =>
      sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweet.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg shadow-sm border-b border-orange-100/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold text-orange-800">Sweet Delights Admin</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-orange-600"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="products" className="text-base">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="offers" className="text-base">
              <Tag className="h-4 w-4 mr-2" />
              Special Offers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-orange-800">Products Management</h2>
                <p className="text-gray-500">Manage your sweet products inventory</p>
              </div>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm w-full sm:w-64"
                  />
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Sweet</DialogTitle>
                      <DialogDescription>Fill in the details to add a new sweet to your inventory.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={sweetFormData.name}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={sweetFormData.description}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Image URL
                        </Label>
                        <Input
                          id="image"
                          value={sweetFormData.image}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, image: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Featured</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={sweetFormData.featured}
                            onCheckedChange={(checked) => setSweetFormData({ ...sweetFormData, featured: checked })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Sizes & Prices</Label>
                        <div className="col-span-3 space-y-2">
                          {sweetFormData.sizes?.map((size, index) => (
                            <div key={index} className="flex space-x-2">
                              <Input
                                value={size.size}
                                onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                                placeholder="Size"
                                className="w-1/2"
                              />
                              <Input
                                type="number"
                                value={size.price}
                                onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                                placeholder="Price"
                                className="w-1/2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Tags</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add tag"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddTag()
                                }
                              }}
                            />
                            <Button type="button" onClick={handleAddTag}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {sweetFormData.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddSweet}>
                        Add Sweet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Sweet</DialogTitle>
                      <DialogDescription>Update the details of this sweet.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={sweetFormData.name}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="edit-description"
                          value={sweetFormData.description}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-image" className="text-right">
                          Image URL
                        </Label>
                        <Input
                          id="edit-image"
                          value={sweetFormData.image}
                          onChange={(e) => setSweetFormData({ ...sweetFormData, image: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Featured</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={sweetFormData.featured}
                            onCheckedChange={(checked) => setSweetFormData({ ...sweetFormData, featured: checked })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Sizes & Prices</Label>
                        <div className="col-span-3 space-y-2">
                          {sweetFormData.sizes?.map((size, index) => (
                            <div key={index} className="flex space-x-2">
                              <Input
                                value={size.size}
                                onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                                placeholder="Size"
                                className="w-1/2"
                              />
                              <Input
                                type="number"
                                value={size.price}
                                onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                                placeholder="Price"
                                className="w-1/2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Tags</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add tag"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddTag()
                                }
                              }}
                            />
                            <Button type="button" onClick={handleAddTag}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {sweetFormData.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleEditSweet}>
                        Update Sweet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center space-x-2">
                  <svg className="h-6 w-6 animate-spin text-orange-500" viewBox="0 0 24 24">
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
                  <span className="text-lg font-medium text-gray-500">Loading products...</span>
                </div>
              </div>
            ) : (
              <>
                {filteredSweets.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/50 backdrop-blur-sm p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? "Try a different search term" : "Get started by adding a new product"}
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSweets.map((sweet) => (
                      <motion.div
                        key={sweet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="overflow-hidden border-orange-100/50 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                          <div className="relative h-48 w-full overflow-hidden">
                            <Image
                              src={sweet.image || "/placeholder.svg"}
                              alt={sweet.name}
                              fill
                              className="object-cover"
                            />
                            {sweet.featured && (
                              <div className="absolute left-0 top-3 bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 text-xs font-medium text-white shadow-md">
                                Featured
                              </div>
                            )}
                          </div>
                          <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-lg font-bold text-orange-800">{sweet.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="mb-4 text-sm text-gray-500 line-clamp-2">{sweet.description}</p>

                            <div className="mb-4 flex flex-wrap gap-1">
                              {sweet.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="mb-4 space-y-1">
                              {sweet.sizes.map((size) => (
                                <div key={size.size} className="flex justify-between text-sm">
                                  <span>{size.size}</span>
                                  <span className="font-medium">₹{size.price}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-orange-200"
                                onClick={() => handleEditSweetClick(sweet)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteSweet(sweet.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="offers">
            <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-orange-800">Special Offers</h2>
                <p className="text-gray-500">Create and manage special offers and promotions</p>
              </div>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search offers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-orange-200 focus-visible:ring-orange-500 bg-white/70 backdrop-blur-sm w-full sm:w-64"
                  />
                </div>

                <Dialog open={isAddOfferDialogOpen} onOpenChange={setIsAddOfferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Offer</DialogTitle>
                      <DialogDescription>Create a special offer or promotion for your customers.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={offerFormData.title}
                          onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="offer-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="offer-description"
                          value={offerFormData.description}
                          onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discount" className="text-right">
                          Discount %
                        </Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={offerFormData.discount}
                          onChange={(e) => setOfferFormData({ ...offerFormData, discount: Number(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">
                          Offer Code
                        </Label>
                        <Input
                          id="code"
                          value={offerFormData.code}
                          onChange={(e) => setOfferFormData({ ...offerFormData, code: e.target.value.toUpperCase() })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                          Start Date
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={
                            offerFormData.startDate ? new Date(offerFormData.startDate).toISOString().split("T")[0] : ""
                          }
                          onChange={(e) =>
                            setOfferFormData({ ...offerFormData, startDate: new Date(e.target.value).toISOString() })
                          }
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                          End Date
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={
                            offerFormData.endDate ? new Date(offerFormData.endDate).toISOString().split("T")[0] : ""
                          }
                          onChange={(e) =>
                            setOfferFormData({ ...offerFormData, endDate: new Date(e.target.value).toISOString() })
                          }
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={offerFormData.isActive}
                            onCheckedChange={(checked) => setOfferFormData({ ...offerFormData, isActive: checked })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bannerColor" className="text-right">
                          Banner Color
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Input
                            id="bannerColor"
                            type="color"
                            value={offerFormData.bannerColor || "#f97316"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, bannerColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={offerFormData.bannerColor || "#f97316"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, bannerColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="textColor" className="text-right">
                          Text Color
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Input
                            id="textColor"
                            type="color"
                            value={offerFormData.textColor || "#ffffff"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, textColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={offerFormData.textColor || "#ffffff"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Applies To</Label>
                        <div className="col-span-3 space-y-2">
                          <p className="text-sm text-gray-500 mb-2">Select products this offer applies to:</p>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                            {sweets.map((sweet) => (
                              <div key={sweet.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`product-${sweet.id}`}
                                  checked={offerFormData.appliesTo?.includes(sweet.id)}
                                  onChange={() => handleToggleProductInOffer(sweet.id)}
                                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <label htmlFor={`product-${sweet.id}`} className="text-sm">
                                  {sweet.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddOfferDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddOffer}>
                        Add Offer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditOfferDialogOpen} onOpenChange={setIsEditOfferDialogOpen}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Offer</DialogTitle>
                      <DialogDescription>Update the details of this special offer.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="edit-title"
                          value={offerFormData.title}
                          onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-offer-description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="edit-offer-description"
                          value={offerFormData.description}
                          onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-discount" className="text-right">
                          Discount %
                        </Label>
                        <Input
                          id="edit-discount"
                          type="number"
                          min="0"
                          max="100"
                          value={offerFormData.discount}
                          onChange={(e) => setOfferFormData({ ...offerFormData, discount: Number(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-code" className="text-right">
                          Offer Code
                        </Label>
                        <Input
                          id="edit-code"
                          value={offerFormData.code}
                          onChange={(e) => setOfferFormData({ ...offerFormData, code: e.target.value.toUpperCase() })}
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-startDate" className="text-right">
                          Start Date
                        </Label>
                        <Input
                          id="edit-startDate"
                          type="date"
                          value={
                            offerFormData.startDate ? new Date(offerFormData.startDate).toISOString().split("T")[0] : ""
                          }
                          onChange={(e) =>
                            setOfferFormData({ ...offerFormData, startDate: new Date(e.target.value).toISOString() })
                          }
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-endDate" className="text-right">
                          End Date
                        </Label>
                        <Input
                          id="edit-endDate"
                          type="date"
                          value={
                            offerFormData.endDate ? new Date(offerFormData.endDate).toISOString().split("T")[0] : ""
                          }
                          onChange={(e) =>
                            setOfferFormData({ ...offerFormData, endDate: new Date(e.target.value).toISOString() })
                          }
                          className="col-span-3"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={offerFormData.isActive}
                            onCheckedChange={(checked) => setOfferFormData({ ...offerFormData, isActive: checked })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-bannerColor" className="text-right">
                          Banner Color
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Input
                            id="edit-bannerColor"
                            type="color"
                            value={offerFormData.bannerColor || "#f97316"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, bannerColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={offerFormData.bannerColor || "#f97316"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, bannerColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-textColor" className="text-right">
                          Text Color
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Input
                            id="edit-textColor"
                            type="color"
                            value={offerFormData.textColor || "#ffffff"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, textColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={offerFormData.textColor || "#ffffff"}
                            onChange={(e) => setOfferFormData({ ...offerFormData, textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">Applies To</Label>
                        <div className="col-span-3 space-y-2">
                          <p className="text-sm text-gray-500 mb-2">Select products this offer applies to:</p>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                            {sweets.map((sweet) => (
                              <div key={sweet.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`edit-product-${sweet.id}`}
                                  checked={offerFormData.appliesTo?.includes(sweet.id)}
                                  onChange={() => handleToggleProductInOffer(sweet.id)}
                                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <label htmlFor={`edit-product-${sweet.id}`} className="text-sm">
                                  {sweet.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditOfferDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleEditOffer}>
                        Update Offer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center space-x-2">
                  <svg className="h-6 w-6 animate-spin text-orange-500" viewBox="0 0 24 24">
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
                  <span className="text-lg font-medium text-gray-500">Loading offers...</span>
                </div>
              </div>
            ) : (
              <>
                {filteredOffers.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/50 backdrop-blur-sm p-8 text-center">
                    <Tag className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No offers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? "Try a different search term" : "Get started by adding a new offer"}
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600"
                      onClick={() => setIsAddOfferDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Offer
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOffers.map((offer) => (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="overflow-hidden border-orange-100/50 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                          <div
                            className="p-4"
                            style={{
                              backgroundColor: offer.bannerColor || "#f97316",
                              color: offer.textColor || "#ffffff",
                            }}
                          >
                            <h3 className="text-xl font-bold">{offer.title}</h3>
                            <div className="mt-2 inline-block rounded-full bg-white/20 px-2 py-1 text-sm">
                              {offer.code}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="mb-4 text-sm text-gray-500">{offer.description}</p>

                            <div className="mb-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Discount:</span>
                                <span className="font-medium text-orange-800">{offer.discount}%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status:</span>
                                <Badge
                                  variant={offer.isActive ? "default" : "outline"}
                                  className={offer.isActive ? "bg-green-500" : ""}
                                >
                                  {offer.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Period:</span>
                                <span className="text-xs text-gray-600">
                                  {new Date(offer.startDate).toLocaleDateString()} -{" "}
                                  {new Date(offer.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="mb-1 text-sm font-medium text-gray-500">Applies to:</h4>
                              <div className="flex flex-wrap gap-1">
                                {offer.appliesTo.length === 0 ? (
                                  <span className="text-xs text-gray-400">All products</span>
                                ) : (
                                  offer.appliesTo.map((id) => {
                                    const sweet = sweets.find((s) => s.id === id)
                                    return (
                                      <Badge key={id} variant="outline" className="text-xs">
                                        {sweet ? sweet.name : id}
                                      </Badge>
                                    )
                                  })
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-orange-200"
                                onClick={() => handleEditOfferClick(offer)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteOffer(offer.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
