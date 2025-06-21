import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setupProduction() {
  console.log("🚀 Setting up production environment...");

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@iiitl.ac.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN"
      }
    });

    console.log(`✅ Admin user created: ${admin.email}`);

    // Create default routes if none exist
    const routeCount = await prisma.route.count();

    if (routeCount === 0) {
      const defaultRoute = await prisma.route.create({
        data: {
          name: "Main Campus Route",
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

      // Create default stops
      const stops = [
        { name: "Main Gate", latitude: 12.9716, longitude: 77.5946 },
        { name: "Library", latitude: 12.9726, longitude: 77.5956 },
        { name: "Academic Block", latitude: 12.9736, longitude: 77.5966 }
      ];

      for (const stop of stops) {
        await prisma.stop.create({
          data: {
            ...stop,
            routeId: defaultRoute.id
          }
        });
      }

      console.log("✅ Default route and stops created");
    }

    console.log("🎉 Production setup completed successfully!");
  } catch (error) {
    console.error("❌ Production setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction();
