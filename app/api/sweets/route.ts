import { getSweets } from "@/lib/sweets-service"
import { NextResponse } from "next/server"

export async function GET() {
  const sweets = await getSweets()
  return NextResponse.json(sweets)
}
