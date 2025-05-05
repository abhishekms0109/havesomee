const mysql = require("mysql2/promise")
require("dotenv").config()

async function migrate() {
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  })

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`)
    console.log(`Database ${process.env.MYSQL_DATABASE} created or already exists`)

    // Use the database
    await connection.query(`USE ${process.env.MYSQL_DATABASE}`)

    // Create sweets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sweets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Sweets table created or already exists")

    // Create sweet_sizes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sweet_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sweet_id INT NOT NULL,
        size VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sweet_id) REFERENCES sweets(id) ON DELETE CASCADE
      )
    `)
    console.log("Sweet sizes table created or already exists")

    // Create sweet_tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sweet_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sweet_id INT NOT NULL,
        tag VARCHAR(50) NOT NULL,
        FOREIGN KEY (sweet_id) REFERENCES sweets(id) ON DELETE CASCADE
      )
    `)
    console.log("Sweet tags table created or already exists")

    // Create offers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount INT NOT NULL,
        code VARCHAR(50) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        banner_color VARCHAR(20) DEFAULT '#f97316',
        text_color VARCHAR(20) DEFAULT '#ffffff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Offers table created or already exists")

    // Create offer_products table (for many-to-many relationship)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offer_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        offer_id INT NOT NULL,
        sweet_id INT NOT NULL,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (sweet_id) REFERENCES sweets(id) ON DELETE CASCADE
      )
    `)
    console.log("Offer products table created or already exists")

    // Create admin_users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("Admin users table created or already exists")

    // Insert default admin user if not exists
    const [adminExists] = await connection.query("SELECT COUNT(*) as count FROM admin_users WHERE username = ?", [
      "admin",
    ])

    if (adminExists[0].count === 0) {
      // In a real app, you would hash the password
      // This is just for demonstration purposes
      await connection.query("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", ["admin", "admin123"])
      console.log("Default admin user created")
    }

    // Insert sample data if sweets table is empty
    const [sweetsCount] = await connection.query("SELECT COUNT(*) as count FROM sweets")

    if (sweetsCount[0].count === 0) {
      console.log("Inserting sample data...")

      // Insert sample sweets
      const sampleSweets = [
        {
          name: "Gulab Jamun",
          description: "Deep-fried milk solids soaked in sugar syrup",
          image: "/placeholder.svg?height=200&width=200",
          featured: true,
        },
        {
          name: "Rasgulla",
          description: "Soft, spongy cheese balls soaked in sugar syrup",
          image: "/placeholder.svg?height=200&width=200",
          featured: false,
        },
        {
          name: "Jalebi",
          description: "Crispy, pretzel-shaped sweets soaked in sugar syrup",
          image: "/placeholder.svg?height=200&width=200",
          featured: true,
        },
        {
          name: "Kaju Katli",
          description: "Diamond-shaped cashew fudge with silver foil topping",
          image: "/placeholder.svg?height=200&width=200",
          featured: false,
        },
        {
          name: "Rasmalai",
          description: "Flattened cheese patties soaked in sweetened, thickened milk",
          image: "/placeholder.svg?height=200&width=200",
          featured: true,
        },
        {
          name: "Barfi",
          description: "Dense milk-based sweet with various flavors",
          image: "/placeholder.svg?height=200&width=200",
          featured: false,
        },
      ]

      for (const sweet of sampleSweets) {
        const [result] = await connection.query(
          "INSERT INTO sweets (name, description, image, featured) VALUES (?, ?, ?, ?)",
          [sweet.name, sweet.description, sweet.image, sweet.featured],
        )

        const sweetId = result.insertId

        // Insert sizes
        const sizes = [
          { size: "250g", price: Math.floor(Math.random() * 200) + 100 },
          { size: "500g", price: Math.floor(Math.random() * 300) + 200 },
          { size: "1kg", price: Math.floor(Math.random() * 500) + 400 },
        ]

        for (const size of sizes) {
          await connection.query("INSERT INTO sweet_sizes (sweet_id, size, price) VALUES (?, ?, ?)", [
            sweetId,
            size.size,
            size.price,
          ])
        }

        // Insert tags
        const allTags = [
          "Popular",
          "Classic",
          "Bestseller",
          "Crispy",
          "Premium",
          "Gift",
          "Creamy",
          "Festive",
          "Traditional",
        ]
        const sweetTags = allTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)

        for (const tag of sweetTags) {
          await connection.query("INSERT INTO sweet_tags (sweet_id, tag) VALUES (?, ?)", [sweetId, tag])
        }
      }

      // Insert sample offer
      const [offerResult] = await connection.query(
        `INSERT INTO offers 
         (title, description, discount, code, start_date, end_date, is_active, banner_color, text_color) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Festival Special",
          "Get 15% off on all festive sweets!",
          15,
          "FESTIVAL15",
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          true,
          "#f97316",
          "#ffffff",
        ],
      )

      const offerId = offerResult.insertId

      // Apply offer to some sweets
      const [sweetIds] = await connection.query("SELECT id FROM sweets LIMIT 2")
      for (const sweet of sweetIds) {
        await connection.query("INSERT INTO offer_products (offer_id, sweet_id) VALUES (?, ?)", [offerId, sweet.id])
      }

      console.log("Sample data inserted successfully")
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await connection.end()
  }
}

migrate()
