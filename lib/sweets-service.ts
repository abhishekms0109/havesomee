"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase"

export type Sweet = {
  id: string
  name: string
  image: string
  description: string
  sizes: { size: string; price: number }[]
  featured: boolean
  tags: string[]
}

export type Offer = {
  id: string
  title: string
  description: string
  discount: number
  code: string
  startDate: string
  endDate: string
  isActive: boolean
  appliesTo: string[]
  bannerColor: string
  textColor: string
}

export async function getSweets(): Promise<Sweet[]> {
  try {
    const supabase = createServerComponentClient()

    // Get all sweets
    const { data: sweets, error } = await supabase.from("sweets").select("id, name, description, image, featured")

    if (error) throw error

    // For each sweet, get its sizes and tags
    const sweetsWithDetails = await Promise.all(
      sweets.map(async (sweet) => {
        // Get sizes
        const { data: sizes, error: sizesError } = await supabase
          .from("sweet_sizes")
          .select("size, price")
          .eq("sweet_id", sweet.id)

        if (sizesError) throw sizesError

        // Get tags
        const { data: tags, error: tagsError } = await supabase
          .from("sweet_tags")
          .select("tag")
          .eq("sweet_id", sweet.id)

        if (tagsError) throw tagsError

        return {
          id: sweet.id.toString(),
          name: sweet.name,
          description: sweet.description,
          image: sweet.image,
          featured: Boolean(sweet.featured),
          sizes: sizes.map((s) => ({ size: s.size, price: Number(s.price) })),
          tags: tags.map((t) => t.tag),
        }
      }),
    )

    return sweetsWithDetails
  } catch (error) {
    console.error("Error fetching sweets:", error)
    return []
  }
}

export async function getSweetById(id: string): Promise<Sweet | undefined> {
  try {
    const supabase = createServerComponentClient()

    // Get the sweet
    const { data: sweet, error } = await supabase
      .from("sweets")
      .select("id, name, description, image, featured")
      .eq("id", id)
      .single()

    if (error) throw error
    if (!sweet) return undefined

    // Get sizes
    const { data: sizes, error: sizesError } = await supabase
      .from("sweet_sizes")
      .select("size, price")
      .eq("sweet_id", id)

    if (sizesError) throw sizesError

    // Get tags
    const { data: tags, error: tagsError } = await supabase.from("sweet_tags").select("tag").eq("sweet_id", id)

    if (tagsError) throw tagsError

    return {
      id: sweet.id.toString(),
      name: sweet.name,
      description: sweet.description,
      image: sweet.image,
      featured: Boolean(sweet.featured),
      sizes: sizes.map((s) => ({ size: s.size, price: Number(s.price) })),
      tags: tags.map((t) => t.tag),
    }
  } catch (error) {
    console.error(`Error fetching sweet with id ${id}:`, error)
    return undefined
  }
}

export async function addSweet(sweet: Omit<Sweet, "id">) {
  try {
    const supabase = createServerComponentClient()

    // Insert the sweet
    const { data: newSweet, error } = await supabase
      .from("sweets")
      .insert({
        name: sweet.name,
        description: sweet.description,
        image: sweet.image,
        featured: sweet.featured,
      })
      .select()
      .single()

    if (error) throw error

    // Insert sizes
    for (const size of sweet.sizes) {
      const { error: sizeError } = await supabase.from("sweet_sizes").insert({
        sweet_id: newSweet.id,
        size: size.size,
        price: size.price,
      })

      if (sizeError) throw sizeError
    }

    // Insert tags
    for (const tag of sweet.tags) {
      const { error: tagError } = await supabase.from("sweet_tags").insert({
        sweet_id: newSweet.id,
        tag: tag,
      })

      if (tagError) throw tagError
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/sweets")

    return { ...sweet, id: newSweet.id.toString() }
  } catch (error) {
    console.error("Error adding sweet:", error)
    throw new Error("Failed to add sweet")
  }
}

export async function updateSweet(id: string, updatedSweet: Partial<Omit<Sweet, "id">>) {
  try {
    const supabase = createServerComponentClient()

    // Update the sweet
    if (
      updatedSweet.name ||
      updatedSweet.description ||
      updatedSweet.image !== undefined ||
      updatedSweet.featured !== undefined
    ) {
      const updateData: any = {}

      if (updatedSweet.name) updateData.name = updatedSweet.name
      if (updatedSweet.description) updateData.description = updatedSweet.description
      if (updatedSweet.image !== undefined) updateData.image = updatedSweet.image
      if (updatedSweet.featured !== undefined) updateData.featured = updatedSweet.featured

      const { error } = await supabase.from("sweets").update(updateData).eq("id", id)

      if (error) throw error
    }

    // Update sizes if provided
    if (updatedSweet.sizes) {
      // Delete existing sizes
      const { error: deleteError } = await supabase.from("sweet_sizes").delete().eq("sweet_id", id)

      if (deleteError) throw deleteError

      // Insert new sizes
      for (const size of updatedSweet.sizes) {
        const { error } = await supabase.from("sweet_sizes").insert({
          sweet_id: id,
          size: size.size,
          price: size.price,
        })

        if (error) throw error
      }
    }

    // Update tags if provided
    if (updatedSweet.tags) {
      // Delete existing tags
      const { error: deleteError } = await supabase.from("sweet_tags").delete().eq("sweet_id", id)

      if (deleteError) throw deleteError

      // Insert new tags
      for (const tag of updatedSweet.tags) {
        const { error } = await supabase.from("sweet_tags").insert({
          sweet_id: id,
          tag: tag,
        })

        if (error) throw error
      }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/sweets")

    return await getSweetById(id)
  } catch (error) {
    console.error(`Error updating sweet with id ${id}:`, error)
    throw new Error("Failed to update sweet")
  }
}

export async function deleteSweet(id: string) {
  try {
    const supabase = createServerComponentClient()

    // The foreign key constraints will automatically delete related sizes and tags
    const { error } = await supabase.from("sweets").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/sweets")

    return true
  } catch (error) {
    console.error(`Error deleting sweet with id ${id}:`, error)
    throw new Error("Failed to delete sweet")
  }
}

// Offers management
export async function getOffers(): Promise<Offer[]> {
  try {
    const supabase = createServerComponentClient()

    // Get all offers
    const { data: offers, error } = await supabase.from("offers").select(`
        id, 
        title, 
        description, 
        discount, 
        code, 
        start_date, 
        end_date, 
        is_active,
        banner_color,
        text_color
      `)

    if (error) throw error

    // For each offer, get the products it applies to
    const offersWithProducts = await Promise.all(
      offers.map(async (offer) => {
        const { data: products, error: productsError } = await supabase
          .from("offer_products")
          .select("sweet_id")
          .eq("offer_id", offer.id)

        if (productsError) throw productsError

        return {
          id: offer.id.toString(),
          title: offer.title,
          description: offer.description,
          discount: offer.discount,
          code: offer.code,
          startDate: new Date(offer.start_date).toISOString(),
          endDate: new Date(offer.end_date).toISOString(),
          isActive: Boolean(offer.is_active),
          bannerColor: offer.banner_color || "#f97316",
          textColor: offer.text_color || "#ffffff",
          appliesTo: products.map((p) => p.sweet_id.toString()),
        }
      }),
    )

    return offersWithProducts
  } catch (error) {
    console.error("Error fetching offers:", error)
    return []
  }
}

export async function getActiveOffers(): Promise<Offer[]> {
  try {
    const supabase = createServerComponentClient()
    const now = new Date().toISOString()

    // Get active offers
    const { data: offers, error } = await supabase
      .from("offers")
      .select(`
        id, 
        title, 
        description, 
        discount, 
        code, 
        start_date, 
        end_date, 
        is_active,
        banner_color,
        text_color
      `)
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)

    if (error) throw error

    // For each offer, get the products it applies to
    const offersWithProducts = await Promise.all(
      offers.map(async (offer) => {
        const { data: products, error: productsError } = await supabase
          .from("offer_products")
          .select("sweet_id")
          .eq("offer_id", offer.id)

        if (productsError) throw productsError

        return {
          id: offer.id.toString(),
          title: offer.title,
          description: offer.description,
          discount: offer.discount,
          code: offer.code,
          startDate: new Date(offer.start_date).toISOString(),
          endDate: new Date(offer.end_date).toISOString(),
          isActive: Boolean(offer.is_active),
          bannerColor: offer.banner_color || "#f97316",
          textColor: offer.text_color || "#ffffff",
          appliesTo: products.map((p) => p.sweet_id.toString()),
        }
      }),
    )

    return offersWithProducts
  } catch (error) {
    console.error("Error fetching active offers:", error)
    return []
  }
}

export async function addOffer(offer: Omit<Offer, "id">) {
  try {
    const supabase = createServerComponentClient()

    // Insert the offer
    const { data: newOffer, error } = await supabase
      .from("offers")
      .insert({
        title: offer.title,
        description: offer.description,
        discount: offer.discount,
        code: offer.code,
        start_date: new Date(offer.startDate),
        end_date: new Date(offer.endDate),
        is_active: offer.isActive,
        banner_color: offer.bannerColor,
        text_color: offer.textColor,
      })
      .select()
      .single()

    if (error) throw error

    // Insert product associations
    for (const sweetId of offer.appliesTo) {
      const { error: productError } = await supabase.from("offer_products").insert({
        offer_id: newOffer.id,
        sweet_id: sweetId,
      })

      if (productError) throw productError
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/offers")

    return {
      ...offer,
      id: newOffer.id.toString(),
    }
  } catch (error) {
    console.error("Error adding offer:", error)
    throw new Error("Failed to add offer")
  }
}

export async function updateOffer(id: string, updatedOffer: Partial<Omit<Offer, "id">>) {
  try {
    const supabase = createServerComponentClient()

    const updateData: any = {}

    if (updatedOffer.title) updateData.title = updatedOffer.title
    if (updatedOffer.description) updateData.description = updatedOffer.description
    if (updatedOffer.discount !== undefined) updateData.discount = updatedOffer.discount
    if (updatedOffer.code) updateData.code = updatedOffer.code
    if (updatedOffer.startDate) updateData.start_date = new Date(updatedOffer.startDate)
    if (updatedOffer.endDate) updateData.end_date = new Date(updatedOffer.endDate)
    if (updatedOffer.isActive !== undefined) updateData.is_active = updatedOffer.isActive
    if (updatedOffer.bannerColor) updateData.banner_color = updatedOffer.bannerColor
    if (updatedOffer.textColor) updateData.text_color = updatedOffer.textColor

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("offers").update(updateData).eq("id", id)

      if (error) throw error
    }

    // Update product associations if provided
    if (updatedOffer.appliesTo) {
      // Delete existing associations
      const { error: deleteError } = await supabase.from("offer_products").delete().eq("offer_id", id)

      if (deleteError) throw deleteError

      // Insert new associations
      for (const sweetId of updatedOffer.appliesTo) {
        const { error } = await supabase.from("offer_products").insert({
          offer_id: id,
          sweet_id: sweetId,
        })

        if (error) throw error
      }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/offers")

    // Get the updated offer
    const offers = await getOffers()
    return offers.find((o) => o.id === id)
  } catch (error) {
    console.error(`Error updating offer with id ${id}:`, error)
    throw new Error("Failed to update offer")
  }
}

export async function deleteOffer(id: string) {
  try {
    const supabase = createServerComponentClient()

    // The foreign key constraints will automatically delete related product associations
    const { error } = await supabase.from("offers").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/offers")

    return true
  } catch (error) {
    console.error(`Error deleting offer with id ${id}:`, error)
    throw new Error("Failed to delete offer")
  }
}

// Admin authentication
export async function adminLogin(credentials: { username: string; password: string }) {
  try {
    console.log("Attempting login with:", credentials.username)
    const supabase = createServerComponentClient()

    // For debugging purposes, let's check if the admin user exists
    const { data: allUsers, error: usersError } = await supabase.from("admin_users").select("*")

    console.log("All admin users:", allUsers)

    if (usersError) {
      console.error("Error fetching admin users:", usersError)
      return { success: false, error: "Database error" }
    }

    // Check if the admin user exists
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username")
      .eq("username", credentials.username)
      .eq("password_hash", credentials.password)
      .single()

    console.log("Login result:", user, error)

    if (error || !user) {
      // If the admin doesn't exist, let's create one for testing
      if (credentials.username === "admin" && credentials.password === "admin123") {
        const { data: newUser, error: insertError } = await supabase
          .from("admin_users")
          .insert({
            username: "admin",
            password_hash: "admin123",
            email: "admin@example.com",
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating admin user:", insertError)
          return { success: false, error: "Failed to create admin user" }
        }

        // Set the admin session cookie
        cookies().set("admin_session", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        })

        return { success: true }
      }

      return { success: false, error: "Invalid credentials" }
    }

    // Set the admin session cookie
    cookies().set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function adminLogout() {
  cookies().delete("admin_session")
  redirect("/admin/login")
}

export async function checkAdminSession() {
  const session = cookies().get("admin_session")
  return session?.value === "authenticated"
}
