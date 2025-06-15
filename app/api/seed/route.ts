import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  console.log("Seed API route called")

  try {
    // Create Supabase client directly in the API route for better error handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing Supabase environment variables",
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test the connection - fixed the count query
    const { data: testData, error: testError } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })

    if (testError) {
      console.error("Supabase connection test failed:", testError)
      return NextResponse.json(
        {
          error: "Database connection error",
          details: testError.message,
        },
        { status: 500 },
      )
    }

    console.log("Supabase connection successful, proceeding with seeding")

    // Seed admin user
    const { error: adminError } = await supabase.from("admin_users").upsert(
      {
        username: "admin",
        password_hash: "admin123",
        email: "admin@example.com",
      },
      { onConflict: "username" },
    )

    if (adminError) {
      console.error("Error creating admin user:", adminError)
      return NextResponse.json(
        {
          error: "Failed to create admin user",
          details: adminError.message,
        },
        { status: 500 },
      )
    }

    console.log("Admin user created successfully")

    // Seed sweets data
    const sweetsData = [
      {
        name: "Gulab Jamun",
        image: "/gulab-jamun.png",
        description: "Deep-fried milk solids soaked in sugar syrup",
        featured: true,
      },
      {
        name: "Rasgulla",
        image: "/rasgulla.png",
        description: "Soft, spongy cheese balls soaked in sugar syrup",
        featured: false,
      },
      {
        name: "Jalebi",
        image: "/jalebi.png",
        description: "Crispy, pretzel-shaped sweets soaked in sugar syrup",
        featured: true,
      },
    ]

    // Insert sweets
    for (const sweet of sweetsData) {
      const { data: newSweet, error: sweetError } = await supabase
        .from("sweets")
        .upsert(
          {
            name: sweet.name,
            description: sweet.description,
            image: sweet.image,
            featured: sweet.featured,
          },
          { onConflict: "name" },
        )
        .select()
        .single()

      if (sweetError) {
        console.error(`Error creating sweet ${sweet.name}:`, sweetError)
        continue
      }

      console.log(`Sweet created: ${sweet.name}`)

      // Add sizes for this sweet
      const sizes = [
        { size: "250g", price: 150 },
        { size: "500g", price: 280 },
      ]

      for (const size of sizes) {
        const { error: sizeError } = await supabase.from("sweet_sizes").upsert(
          {
            sweet_id: newSweet.id,
            size: size.size,
            price: size.price,
          },
          { onConflict: ["sweet_id", "size"] },
        )

        if (sizeError) {
          console.error(`Error adding size for ${sweet.name}:`, sizeError)
        }
      }

      // Add tags for this sweet
      const tags = ["Popular", "Classic"]

      for (const tag of tags) {
        const { error: tagError } = await supabase.from("sweet_tags").upsert(
          {
            sweet_id: newSweet.id,
            tag: tag,
          },
          { onConflict: ["sweet_id", "tag"] },
        )

        if (tagError) {
          console.error(`Error adding tag for ${sweet.name}:`, tagError)
        }
      }
    }

    console.log("Database seeding completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    })
  } catch (error: any) {
    console.error("Unexpected error in seed API route:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
