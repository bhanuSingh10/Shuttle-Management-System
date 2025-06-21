"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingHistoryPage() {
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data, error, isLoading } = useSWR(`/api/bookings/history?page=${page}&limit=10`, fetcher)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading booking history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.bookings?.length > 0 ? (
          <div className="space-y-4">
            {data.bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.route.name}</h3>
                      <div className="flex items-center space-x-2 text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(booking.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-medium">{booking.fromStop.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-medium">{booking.toStop.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Fare</p>
                        <p className="font-medium">{booking.pointsDeducted} points</p>
                      </div>
                    </div>
                  </div>

                  {booking.schedule && (
                    <div className="text-sm text-gray-600">
                      <p>Scheduled departure: {new Date(booking.schedule.departure).toLocaleString()}</p>
                      <p>Vehicle: {booking.schedule.vehicle.plateNo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>
                <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === data.pagination.pages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p>No bookings found</p>
                <Button className="mt-4" onClick={() => router.push("/student/booking")}>
                  Book Your First Ride
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
