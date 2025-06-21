import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim())

    if (
      !headers.includes("name") ||
      !headers.includes("latitude") ||
      !headers.includes("longitude") ||
      !headers.includes("routeId")
    ) {
      return NextResponse.json(
        { error: "Invalid CSV format. Required columns: name, latitude, longitude, routeId" },
        { status: 400 },
      )
    }

    const stops = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const stopData: any = {}

      headers.forEach((header, index) => {
        if (header === "latitude" || header === "longitude") {
          stopData[header] = Number.parseFloat(values[index])
        } else {
          stopData[header] = values[index]
        }
      })

      stops.push(stopData)
    }

    const createdStops = await prisma.$transaction(
      stops.map((stop) =>
        prisma.stop.create({
          data: stop,
        }),
      ),
    )

    return NextResponse.json({
      message: `Successfully imported ${createdStops.length} stops`,
      stops: createdStops,
    })
  } catch (error) {
    console.error("Error importing stops:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
