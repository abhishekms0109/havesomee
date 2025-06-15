"use server"

import { createClient } from "@supabase/supabase-js"

// Initial sweets data
const sweetsData = [
  {
    name: "Gulab Jamun",
    image: "/gulab-jamun.png",
    description: "Deep-fried milk solids soaked in sugar syrup",
    featured: true,
    sizes: [
      { size: "250g", price: 150 },
      { size: "500g", price: 280 },
      { size: "1kg", price: 550 },
    ],
    tags: ["Popular", "Classic"],
  },
  {
    name: "Rasgulla",
    image: "/rasgulla.png",
    description: "Soft, spongy cheese balls soaked in sugar syrup",
    featured: false,
    sizes: [
      { size: "250g", price: 120 },
      { size: "500g", price: 230 },
      { size: "1kg", price: 450 },
    ],
    tags: ["Bestseller"],
  },
  {
    name: "Jalebi",
    image: "/jalebi.png",
    description: "Crispy, pretzel-shaped sweets soaked in sugar syrup",
    featured: true,
    sizes: [
      { size: "250g", price: 100 },
      { size: "500g", price: 190 },
      { size: "1kg", price: 370 },
    ],
    tags: ["Crispy"],
  },
  {
    name: "Kaju Katli",
    image: "/kaju-katli.png",
    description: "Diamond-shaped cashew fudge with silver foil topping",
    featured: false,
    sizes: [
      { size: "250g", price: 300 },
      { size: "500g", price: 580 },
      { size: "1kg", price: 1100 },
    ],
    tags: ["Premium", "Gift"],
  },
  {
    name: "Rasmalai",
    image: "/rasmalai.png",
    description: "Flattened cheese patties soaked in sweetened, thickened milk",
    featured: true,
    sizes: [
      { size: "250g", price: 220 },
      { size: "500g", price: 420 },
      { size: "1kg", price: 800 },
    ],
    tags: ["Creamy", "Festive"],
  },
  {
    name: "Barfi",
    image: "/barfi-sweets.png",
    description: "Dense milk-based sweet with various flavors",
    featured: false,
    sizes: [
      { size: "250g", price: 180 },
      { size: "500g", price: 350 },
      { size: "1kg", price: 680 },
    ],
    tags: ["Traditional"],
  },
]

// Initial offers data
const offersData = [
  {
    title: "Festival Special",
    description: "Get 15% off on all festive sweets!",
    discount: 15,
    code: "FESTIVAL15",
    startDate: new Date("2023-10-01"),
    endDate: new Date("2023-12-31"),
    isActive: true,
    appliesTo: [1, 3], // Will be replaced with actual IDs
    bannerColor: "#f97316", // Orange
    textColor: "#ffffff", // White
  },
]

export async function seedDatabase() {
  console.log("Starting database seeding...")

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Insert admin user if it doesn't exist
    const { error: adminError } = await supabase.from("admin_users").upsert(
      {
        username: "admin",
        password_hash: "admin123",
        email: "admin@example.com",
      },
      { onConflict: "username" },
    )

    if (adminError) throw adminError
    console.log("Admin user created or updated")

    // Clear existing data
    await supabase.from("offer_products").delete().neq("id", 0)
    await supabase.from("offers").delete().neq("id", 0)
    await supabase.from("sweet_tags").delete().neq("id", 0)
    await supabase.from("sweet_sizes").delete().neq("id", 0)
    await supabase.from("sweets").delete().neq("id", 0)

    // Insert sweets
    for (const sweet of sweetsData) {
      // Insert sweet
      const { data: newSweet, error: sweetError } = await supabase
        .from("sweets")
        .insert({
          name: sweet.name,
          description: sweet.description,
          image: sweet.image,
          featured: sweet.featured,
        })
        .select()
        .single()

      if (sweetError) throw sweetError
      console.log(`Sweet created: ${sweet.name}`)

      // Insert sizes
      for (const size of sweet.sizes) {
        const { error: sizeError } = await supabase.from("sweet_sizes").insert({
          sweet_id: newSweet.id,
          size: size.size,
          price: size.price,
        })

        if (sizeError) throw sizeError
      }
      console.log(`Sizes added for: ${sweet.name}`)

      // Insert tags
      for (const tag of sweet.tags) {
        const { error: tagError } = await supabase.from("sweet_tags").insert({
          sweet_id: newSweet.id,
          tag: tag,
        })

        if (tagError) throw tagError
      }
      console.log(`Tags added for: ${sweet.name}`)
    }

    // Get all sweets for offer association
    const { data: sweets, error: sweetsError } = await supabase.from("sweets").select("id, name")

    if (sweetsError) throw sweetsError

    // Insert offers
    for (const offer of offersData) {
      // Insert offer
      const { data: newOffer, error: offerError } = await supabase
        .from("offers")
        .insert({
          title: offer.title,
          description: offer.description,
          discount: offer.discount,
          code: offer.code,
          start_date: offer.startDate,
          end_date: offer.endDate,
          is_active: offer.isActive,
          banner_color: offer.bannerColor,
          text_color: offer.textColor,
        })
        .select()
        .single()

      if (offerError) throw offerError
      console.log(`Offer created: ${offer.title}`)

      // Insert offer-product associations
      // Use the first two sweets for this offer
      if (sweets && sweets.length > 0) {
        for (let i = 0; i < Math.min(2, sweets.length); i++) {
          const { error: assocError } = await supabase.from("offer_products").insert({
            offer_id: newOffer.id,
            sweet_id: sweets[i].id,
          })

          if (assocError) throw assocError
        }
        console.log(`Products associated with offer: ${offer.title}`)
      }
    }

    console.log("Database seeding completed successfully!")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}
