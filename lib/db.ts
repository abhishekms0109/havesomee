import mysql from "serverless-mysql"

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
})

export async function query(q: string, values: (string | number)[] | Record<string, any> = []) {
  try {
    const results = await db.query(q, values)
    await db.end()
    return results
  } catch (e) {
    console.error("Database query error:", e)
    throw Error(e instanceof Error ? e.message : "Database query failed")
  }
}

export default db
