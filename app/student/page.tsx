"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Wallet, History, Route, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function StudentDashboard() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const { data: balance } = useSWR("/api/wallets/balance", fetcher)
  const { data: nearbyStops } = useSWR(
    location ? `/api/stops/nearby?lat=${location.lat}&lng=${location.lng}` : null,
    fetcher,
  )
  const { data: frequentRoutes } = useSWR("/api/bookings/frequent-routes", fetcher)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Unable to get your location. Some features may be limited.",
            variant: "destructive",
          })
        },
      )
    }
  }, [toast])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const quickBook = async (routeId: string) => {
    // For quick booking, we'll redirect to the booking page with pre-selected route
    router.push(`/student/booking?routeId=${routeId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="font-semibold">{balance ? `${balance.balance} points` : "Loading..."}</span>
              </div>
              <NotificationsDropdown />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Wallet</span>
              </CardTitle>
              <CardDescription>Manage your wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{balance ? `${balance.balance}` : "---"} points</div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push("/student/wallet")}>
                  Top Up Wallet
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/student/wallet")}>
                  Download Statement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Stops */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Nearby Stops</span>
              </CardTitle>
              <CardDescription>Stops within your vicinity</CardDescription>
            </CardHeader>
            <CardContent>
              {nearbyStops ? (
                <div className="space-y-3">
                  {nearbyStops.slice(0, 3).map((stop: any) => (
                    <div key={stop.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{stop.name}</div>
                        <div className="text-sm text-gray-500">{stop.distance.toFixed(1)} km away</div>
                      </div>
                      <Badge variant="secondary">{stop.route.name}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  {location ? "Loading nearby stops..." : "Getting your location..."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/student/booking")}
              >
                <Route className="mr-2 h-4 w-4" />
                Book a Ride
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/student/schedules")}
              >
                <Clock className="mr-2 h-4 w-4" />
                View Schedules
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/student/history")}
              >
                <History className="mr-2 h-4 w-4" />
                Booking History
              </Button>
            </CardContent>
          </Card>

          {/* Frequent Routes */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Frequent Routes</CardTitle>
              <CardDescription>Your most used routes for quick booking</CardDescription>
            </CardHeader>
            <CardContent>
              {frequentRoutes && frequentRoutes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {frequentRoutes.map((route: any) => (
                    <div key={route.id} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{route.name}</div>
                      <div className="text-sm text-gray-500 mb-3">Used {route.bookingCount} times</div>
                      <Button size="sm" className="w-full" onClick={() => quickBook(route.id)}>
                        Quick Book
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No frequent routes found. Start booking to see your patterns!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
