import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STUDENT"]),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  peakHours: z.array(
    z.object({
      start: z.number().min(0).max(23),
      end: z.number().min(0).max(23),
    }),
  ),
  dynamicFare: z.object({
    peak: z.number().positive(),
    offPeak: z.number().positive(),
  }),
})

export const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  routeId: z.string().uuid(),
})

export const vehicleSchema = z.object({
  plateNo: z.string().min(1, "Plate number is required"),
  capacity: z.number().positive(),
  routeId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
})

export const driverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  licenseNo: z.string().min(1, "License number is required"),
})

export const scheduleSchema = z.object({
  routeId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  departure: z.string().datetime(),
  arrival: z.string().datetime(),
})

export const bookingSchema = z.object({
  fromStopId: z.string().uuid(),
  toStopId: z.string().uuid(),
  routeId: z.string().uuid(),
  scheduleId: z.string().uuid().optional(),
})

export const walletTopUpSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.object({
    type: z.enum(["UPI", "CARD", "KIOSK"]),
    details: z.any(),
  }),
})
