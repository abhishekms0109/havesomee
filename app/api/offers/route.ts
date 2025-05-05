import { getOffers, getActiveOffers } from "@/lib/sweets-service"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get("active") === "true"

  const offers = activeOnly ? await getActiveOffers() : await getOffers()
  return NextResponse.json(offers)
}
