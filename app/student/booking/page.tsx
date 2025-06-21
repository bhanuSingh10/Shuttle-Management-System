"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingPage() {
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedFromStop, setSelectedFromStop] = useState("")
  const [selectedToStop, setSelectedToStop] = useState("")
  const [selectedSchedule, setSelectedSchedule] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: routes } = useSWR("/api/routes", fetcher)
  const { data: stops } = useSWR(selectedRoute ? `/api/stops?routeId=${selectedRoute}` : null, fetcher)
  const { data: schedules } = useSWR(
    selectedRoute ? `/api/schedules?routeId=${selectedRoute}&date=${new Date().toISOString().split("T")[0]}` : null,
    fetcher,
  )
  const { data: balance } = useSWR("/api/wallets/balance", fetcher)

  const handleBooking = async () => {
    if (!selectedFromStop || !selectedToStop || !selectedRoute) {
      toast({
        title: "Error",
        description: "Please select all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromStopId: selectedFromStop,
          toStopId: selectedToStop,
          routeId: selectedRoute,
          scheduleId: selectedSchedule || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Booking failed")
      }

      toast({
        title: "Success",
        description: "Booking created successfully!",
      })

      router.push("/student")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Book a Ride</h1>
            <div className="ml-auto flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{balance ? `${balance.balance} points` : "Loading..."}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Booking</CardTitle>
            <CardDescription>Select your route and stops to book a ride</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Selection */}
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {routes?.map((route: any) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Stop */}
            <div className="space-y-2">
              <Label htmlFor="fromStop">From Stop</Label>
              <Select value={selectedFromStop} onValueChange={setSelectedFromStop} disabled={!selectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select departure stop" />
                </SelectTrigger>
                <SelectContent>
                  {stops?.map((stop: any) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{stop.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Stop */}
            <div className="space-y-2">
              <Label htmlFor="toStop">To Stop</Label>
              <Select value={selectedToStop} onValueChange={setSelectedToStop} disabled={!selectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination stop" />
                </SelectTrigger>
                <SelectContent>
                  {stops
                    ?.filter((stop: any) => stop.id !== selectedFromStop)
                    .map((stop: any) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{stop.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Selection */}
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Optional)</Label>
              <Select value={selectedSchedule} onValueChange={setSelectedSchedule} disabled={!selectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a schedule or leave empty for next available" />
                </SelectTrigger>
                <SelectContent>
                  {schedules?.map((schedule: any) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(schedule.departure).toLocaleTimeString()}</span>
                        </div>
                        <Badge variant="secondary">{schedule.vehicle.plateNo}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fare Estimate */}
            {selectedFromStop && selectedToStop && (
              <Alert>
                <AlertDescription>Estimated fare: 10-15 points (varies based on peak hours)</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleBooking}
              disabled={loading || !selectedFromStop || !selectedToStop}
              className="w-full"
            >
              {loading ? "Booking..." : "Book Ride"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
