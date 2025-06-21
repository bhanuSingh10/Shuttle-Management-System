import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@iiitl.ac.in" },
    update: {},
    create: {
      email: "admin@iiitl.ac.in",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  // Create student user
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@iiitl.ac.in" },
    update: {},
    create: {
      email: "student@iiitl.ac.in",
      passwordHash: studentPassword,
      role: "STUDENT"
    }
  });

  // Create wallet for student
  await prisma.wallet.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      balance: 1000 // 1000 points
    }
  });

  // Create sample routes
  const route1 = await prisma.route.create({
    data: {
      name: "Campus to City Center",
      peakHours: [
        { start: 7, end: 9 },
        { start: 17, end: 19 }
      ],
      dynamicFare: {
        peak: 1.5,
        offPeak: 1.0
      }
    }
  });

  const route2 = await prisma.route.create({
    data: {
      name: "Hostel to Academic Block",
      peakHours: [
        { start: 8, end: 10 },
        { start: 16, end: 18 }
      ],
      dynamicFare: {
        peak: 1.3,
        offPeak: 1.0
      }
    }
  });

  // Create sample stops
  const stops = [
    {
      name: "Main Gate",
      latitude: 12.9716,
      longitude: 77.5946,
      routeId: route1.id
    },
    {
      name: "Library",
      latitude: 12.9726,
      longitude: 77.5956,
      routeId: route1.id
    },
    {
      name: "City Center Mall",
      latitude: 12.9736,
      longitude: 77.5966,
      routeId: route1.id
    },
    {
      name: "Hostel Block A",
      latitude: 12.9706,
      longitude: 77.5936,
      routeId: route2.id
    },
    {
      name: "Academic Block 1",
      latitude: 12.9716,
      longitude: 77.5946,
      routeId: route2.id
    },
    {
      name: "Academic Block 2",
      latitude: 12.9726,
      longitude: 77.5956,
      routeId: route2.id
    }
  ];

  for (const stop of stops) {
    await prisma.stop.create({ data: stop });
  }

  // Create sample drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: "John Doe",
      licenseNo: "DL123456789"
    }
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Jane Smith",
      licenseNo: "DL987654321"
    }
  });

  // Create sample vehicles
  await prisma.vehicle.create({
    data: {
      plateNo: "KA01AB1234",
      capacity: 40,
      routeId: route1.id,
      driverId: driver1.id
    }
  });

  await prisma.vehicle.create({
    data: {
      plateNo: "KA01CD5678",
      capacity: 35,
      routeId: route2.id,
      driverId: driver2.id
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
