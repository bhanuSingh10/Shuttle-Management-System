import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RouteOptimizer, Stop } from "@/lib/route-optimizer";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const { fromStopId, toStopId } = body;
    if (!fromStopId || !toStopId) {
      return NextResponse.json(
        { error: "Missing fromStopId or toStopId" },
        { status: 400 }
      );
    }

    const [fromStop, toStop] = await Promise.all([
      prisma.stop.findUnique({
        where: { id: fromStopId },
        include: { route: true }
      }),
      prisma.stop.findUnique({
        where: { id: toStopId },
        include: { route: true }
      })
    ]);

    if (!fromStop || !toStop) {
      return NextResponse.json({ error: "Invalid stops" }, { status: 400 });
    }

    const allStops = await prisma.stop.findMany({ include: { route: true } });
    const optimizer = new RouteOptimizer(allStops as Stop[]);

    // Try direct route first
    const direct = optimizer.findDirectRoute(fromStop as Stop, toStop as Stop);
    if (direct) {
      return NextResponse.json(direct);
    }

    // Otherwise, find transfer options
    const transfer = optimizer.findTransferOptions(
      fromStop as Stop,
      toStop as Stop
    );
    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Error optimizing route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
