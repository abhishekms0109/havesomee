"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import crypto from "crypto"

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
    // Get all sweets
    const sweets = (await query(`
      SELECT id, name, description, image, featured
      FROM sweets
    `)) as any[]

    // For each sweet, get its sizes and tags
    const sweetsWithDetails = await Promise.all(
      sweets.map(async (sweet) => {
        // Get sizes
        const sizes = (await query(
          `
          SELECT size, price
          FROM sweet_sizes
          WHERE sweet_id = ?
        `,
          [sweet.id],
        )) as any[]

        // Get tags
        const tags = (await query(
          `
          SELECT tag
          FROM sweet_tags
          WHERE sweet_id = ?
        `,
          [sweet.id],
        )) as any[]

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
    // Get the sweet
    const [sweet] = (await query(
      `
      SELECT id, name, description, image, featured
      FROM sweets
      WHERE id = ?
    `,
      [id],
    )) as any[]

    if (!sweet) return undefined

    // Get sizes
    const sizes = (await query(
      `
      SELECT size, price
      FROM sweet_sizes
      WHERE sweet_id = ?
    `,
      [id],
    )) as any[]

    // Get tags
    const tags = (await query(
      `
      SELECT tag
      FROM sweet_tags
      WHERE sweet_id = ?
    `,
      [id],
    )) as any[]

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
    // Insert the sweet
    const [result] = (await query(
      `
      INSERT INTO sweets (name, description, image, featured)
      VALUES (?, ?, ?, ?)
    `,
      [sweet.name, sweet.description, sweet.image, sweet.featured],
    )) as any

    const sweetId = result.insertId

    // Insert sizes
    for (const size of sweet.sizes) {
      await query(
        `
        INSERT INTO sweet_sizes (sweet_id, size, price)
        VALUES (?, ?, ?)
      `,
        [sweetId, size.size, size.price],
      )
    }

    // Insert tags
    for (const tag of sweet.tags) {
      await query(
        `
        INSERT INTO sweet_tags (sweet_id, tag)
        VALUES (?, ?)
      `,
        [sweetId, tag],
      )
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/sweets")

    return { ...sweet, id: sweetId.toString() }
  } catch (error) {
    console.error("Error adding sweet:", error)
    throw new Error("Failed to add sweet")
  }
}

export async function updateSweet(id: string, updatedSweet: Partial<Omit<Sweet, "id">>) {
  try {
    // Update the sweet
    if (
      updatedSweet.name ||
      updatedSweet.description ||
      updatedSweet.image !== undefined ||
      updatedSweet.featured !== undefined
    ) {
      const fields = []
      const values = []

      if (updatedSweet.name) {
        fields.push("name = ?")
        values.push(updatedSweet.name)
      }

      if (updatedSweet.description) {
        fields.push("description = ?")
        values.push(updatedSweet.description)
      }

      if (updatedSweet.image !== undefined) {
        fields.push("image = ?")
        values.push(updatedSweet.image)
      }

      if (updatedSweet.featured !== undefined) {
        fields.push("featured = ?")
        values.push(updatedSweet.featured)
      }

      if (fields.length > 0) {
        await query(
          `
          UPDATE sweets
          SET ${fields.join(", ")}
          WHERE id = ?
        `,
          [...values, id],
        )
      }
    }

    // Update sizes if provided
    if (updatedSweet.sizes) {
      // Delete existing sizes
      await query("DELETE FROM sweet_sizes WHERE sweet_id = ?", [id])

      // Insert new sizes
      for (const size of updatedSweet.sizes) {
        await query(
          `
          INSERT INTO sweet_sizes (sweet_id, size, price)
          VALUES (?, ?, ?)
        `,
          [id, size.size, size.price],
        )
      }
    }

    // Update tags if provided
    if (updatedSweet.tags) {
      // Delete existing tags
      await query("DELETE FROM sweet_tags WHERE sweet_id = ?", [id])

      // Insert new tags
      for (const tag of updatedSweet.tags) {
        await query(
          `
          INSERT INTO sweet_tags (sweet_id, tag)
          VALUES (?, ?)
        `,
          [id, tag],
        )
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
    // The foreign key constraints will automatically delete related sizes and tags
    await query("DELETE FROM sweets WHERE id = ?", [id])

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
    // Get all offers
    const offers = (await query(`
      SELECT id, title, description, discount, code, 
             start_date as startDate, end_date as endDate, 
             is_active as isActive, banner_color as bannerColor, 
             text_color as textColor
      FROM offers
    `)) as any[]

    // For each offer, get the products it applies to
    const offersWithProducts = await Promise.all(
      offers.map(async (offer) => {
        const products = (await query(
          `
          SELECT sweet_id
          FROM offer_products
          WHERE offer_id = ?
        `,
          [offer.id],
        )) as any[]

        return {
          ...offer,
          id: offer.id.toString(),
          startDate: offer.startDate.toISOString(),
          endDate: offer.endDate.toISOString(),
          isActive: Boolean(offer.isActive),
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
    const now = new Date().toISOString().slice(0, 19).replace("T", " ")

    // Get active offers
    const offers = (await query(
      `
      SELECT id, title, description, discount, code, 
             start_date as startDate, end_date as endDate, 
             is_active as isActive, banner_color as bannerColor, 
             text_color as textColor
      FROM offers
      WHERE is_active = 1
      AND start_date <= ?
      AND end_date >= ?
    `,
      [now, now],
    )) as any[]

    // For each offer, get the products it applies to
    const offersWithProducts = await Promise.all(
      offers.map(async (offer) => {
        const products = (await query(
          `
          SELECT sweet_id
          FROM offer_products
          WHERE offer_id = ?
        `,
          [offer.id],
        )) as any[]

        return {
          ...offer,
          id: offer.id.toString(),
          startDate: offer.startDate.toISOString(),
          endDate: offer.endDate.toISOString(),
          isActive: Boolean(offer.isActive),
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
    // Insert the offer
    const [result] = (await query(
      `
      INSERT INTO offers (
        title, description, discount, code, 
        start_date, end_date, is_active,
        banner_color, text_color
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        offer.title,
        offer.description,
        offer.discount,
        offer.code,
        new Date(offer.startDate),
        new Date(offer.endDate),
        offer.isActive,
        offer.bannerColor,
        offer.textColor,
      ],
    )) as any

    const offerId = result.insertId

    // Insert product associations
    for (const sweetId of offer.appliesTo) {
      await query(
        `
        INSERT INTO offer_products (offer_id, sweet_id)
        VALUES (?, ?)
      `,
        [offerId, sweetId],
      )
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard")
    revalidatePath("/api/offers")

    return { ...offer, id: offerId.toString() }
  } catch (error) {
    console.error("Error adding offer:", error)
    throw new Error("Failed to add offer")
  }
}

export async function updateOffer(id: string, updatedOffer: Partial<Omit<Offer, "id">>) {
  try {
    const fields = []
    const values = []

    if (updatedOffer.title) {
      fields.push("title = ?")
      values.push(updatedOffer.title)
    }

    if (updatedOffer.description) {
      fields.push("description = ?")
      values.push(updatedOffer.description)
    }

    if (updatedOffer.discount !== undefined) {
      fields.push("discount = ?")
      values.push(updatedOffer.discount)
    }

    if (updatedOffer.code) {
      fields.push("code = ?")
      values.push(updatedOffer.code)
    }

    if (updatedOffer.startDate) {
      fields.push("start_date = ?")
      values.push(new Date(updatedOffer.startDate))
    }

    if (updatedOffer.endDate) {
      fields.push("end_date = ?")
      values.push(new Date(updatedOffer.endDate))
    }

    if (updatedOffer.isActive !== undefined) {
      fields.push("is_active = ?")
      values.push(updatedOffer.isActive)
    }

    if (updatedOffer.bannerColor) {
      fields.push("banner_color = ?")
      values.push(updatedOffer.bannerColor)
    }

    if (updatedOffer.textColor) {
      fields.push("text_color = ?")
      values.push(updatedOffer.textColor)
    }

    if (fields.length > 0) {
      await query(
        `
        UPDATE offers
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
        [...values, id],
      )
    }

    // Update product associations if provided
    if (updatedOffer.appliesTo) {
      // Delete existing associations
      await query("DELETE FROM offer_products WHERE offer_id = ?", [id])

      // Insert new associations
      for (const sweetId of updatedOffer.appliesTo) {
        await query(
          `
          INSERT INTO offer_products (offer_id, sweet_id)
          VALUES (?, ?)
        `,
          [id, sweetId],
        )
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
    // The foreign key constraints will automatically delete related product associations
    await query("DELETE FROM offers WHERE id = ?", [id])

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
    // In a real app, you would hash the password and compare with the stored hash
    const [user] = (await query("SELECT id, username FROM admin_users WHERE username = ? AND password_hash = ?", [
      credentials.username,
      credentials.password,
    ])) as any[]

    if (user) {
      // Generate a session token
      const sessionToken = crypto.randomBytes(32).toString("hex")

      // Set a secure HTTP-only cookie
      cookies().set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return { success: true }
    }

    return { success: false, error: "Invalid credentials" }
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
  return session?.value ? true : false
}
