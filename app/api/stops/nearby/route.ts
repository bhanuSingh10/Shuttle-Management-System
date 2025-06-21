import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDistance } from "@/lib/utils"
import { nearbyStopsCache } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const cacheKey = `nearby_${lat}_${lng}`
    const cached = nearbyStopsCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const stops = await prisma.stop.findMany({
      include: {
        route: true,
      },
    })

    // Calculate distances and sort by proximity
    const stopsWithDistance = stops.map((stop) => ({
      ...stop,
      distance: calculateDistance(lat, lng, stop.latitude, stop.longitude),
    }))

    const nearbyStops = stopsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 5)

    nearbyStopsCache.set(cacheKey, nearbyStops)
    return NextResponse.json(nearbyStops)
  } catch (error) {
    console.error("Error fetching nearby stops:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
