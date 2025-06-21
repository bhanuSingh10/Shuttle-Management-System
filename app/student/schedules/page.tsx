"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MapPin, User, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SchedulesPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedRoute, setSelectedRoute] = useState("")
  const router = useRouter()

  const { data: routes } = useSWR("/api/routes", fetcher)
  const { data: schedules, isLoading } = useSWR(
    `/api/schedules?date=${selectedDate}${selectedRoute ? `&routeId=${selectedRoute}` : ""}`,
    fetcher,
  )

  const groupedSchedules =
    schedules?.reduce((acc: any, schedule: any) => {
      const routeName = schedule.route.name
      if (!acc[routeName]) {
        acc[routeName] = []
      }
      acc[routeName].push(schedule)
      return acc
    }, {}) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Shuttle Schedules</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filter Schedules</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">Route (Optional)</Label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="All routes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All routes</SelectItem>
                    {routes?.map((route: any) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedules */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedSchedules).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([routeName, routeSchedules]: [string, any]) => (
              <Card key={routeName}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>{routeName}</span>
                  </CardTitle>
                  <CardDescription>
                    {routeSchedules.length} schedule{routeSchedules.length !== 1 ? "s" : ""} for{" "}
                    {new Date(selectedDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routeSchedules.map((schedule: any) => (
                      <div key={schedule.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {new Date(schedule.departure).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="font-medium">
                              {new Date(schedule.arrival).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <Badge variant={new Date(schedule.departure) > new Date() ? "default" : "secondary"}>
                            {new Date(schedule.departure) > new Date() ? "Upcoming" : "Completed"}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Vehicle:</span>
                            <span>{schedule.vehicle.plateNo}</span>
                            <Badge variant="outline" className="text-xs">
                              {schedule.vehicle.capacity} seats
                            </Badge>
                          </div>

                          {schedule.vehicle.driver && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{schedule.vehicle.driver.name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs">{schedule.vehicle.driver.licenseNo}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Duration:</span>
                            <span>
                              {Math.round(
                                (new Date(schedule.arrival).getTime() - new Date(schedule.departure).getTime()) /
                                  (1000 * 60),
                              )}{" "}
                              minutes
                            </span>
                          </div>
                        </div>

                        {new Date(schedule.departure) > new Date() && (
                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={() =>
                              router.push(`/student/booking?scheduleId=${schedule.id}&routeId=${schedule.routeId}`)
                            }
                          >
                            Book This Schedule
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No schedules found</p>
                <p>No shuttle schedules are available for the selected date and route.</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split("T")[0])
                    setSelectedRoute("")
                  }}
                >
                  View Today's Schedules
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
