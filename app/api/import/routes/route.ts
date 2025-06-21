import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim())

    if (!headers.includes("name")) {
      return NextResponse.json({ error: "Invalid CSV format. Required columns: name" }, { status: 400 })
    }

    const routes = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const routeData: any = {
        peakHours: [
          { start: 7, end: 9 },
          { start: 17, end: 19 },
        ],
        dynamicFare: { peak: 1.5, offPeak: 1.0 },
      }

      headers.forEach((header, index) => {
        if (header === "peakHours" || header === "dynamicFare") {
          try {
            routeData[header] = JSON.parse(values[index])
          } catch {
            // Use default values if parsing fails
          }
        } else {
          routeData[header] = values[index]
        }
      })

      routes.push(routeData)
    }

    const createdRoutes = await prisma.$transaction(
      routes.map((route) =>
        prisma.route.create({
          data: route,
        }),
      ),
    )

    return NextResponse.json({
      message: `Successfully imported ${createdRoutes.length} routes`,
      routes: createdRoutes,
    })
  } catch (error) {
    console.error("Error importing routes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
