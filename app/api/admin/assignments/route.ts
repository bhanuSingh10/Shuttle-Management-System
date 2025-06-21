import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DriverAssignment } from "@/lib/driver-assignment";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    // Return all vehicles with their assigned driver (if any)
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
        route: true
      },
      orderBy: { plateNo: "asc" }
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const { vehicleId, driverId } = await request.json();

    // OOP usage
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    if (!vehicle)
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const assignment = new DriverAssignment(
      driverId,
      vehicleId,
      vehicle.routeId
    );
    assignment.reassignVehicle(vehicleId);
    assignment.reassignRoute(vehicle.routeId);

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { driverId }
    });

    return NextResponse.json({
      message: "Vehicle assigned successfully",
      vehicle
    });
  } catch (error) {
    console.error("Error assigning vehicle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
