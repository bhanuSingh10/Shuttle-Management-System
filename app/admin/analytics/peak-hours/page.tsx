"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PeakHoursAnalysisPage() {
  const [timeRange, setTimeRange] = useState("30")
  const router = useRouter()

  const { data: peakData } = useSWR(`/api/admin/analytics/peak-hours?days=${timeRange}`, fetcher)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Peak Hours Analysis</h1>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {peakData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                    <p className="text-3xl font-bold">{peakData.summary.peakHour}:00</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold">{peakData.summary.totalBookings}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{peakData.summary.totalRevenue}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Analysis Period</p>
                    <p className="text-3xl font-bold">{peakData.summary.analysisPeriod}d</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Booking Distribution</CardTitle>
              <CardDescription>Number of bookings by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              {peakData?.hourlyData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={peakData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-gray-500">Loading hourly data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Booking Pattern</CardTitle>
              <CardDescription>Booking distribution by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              {peakData?.weeklyData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={peakData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-gray-500">Loading weekly data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours List */}
        {peakData?.peakHours && (
          <Card>
            <CardHeader>
              <CardTitle>Top Peak Hours</CardTitle>
              <CardDescription>Hours with highest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {peakData.peakHours.map((hour: any, index: number) => (
                  <div key={hour.hour} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">#{index + 1}</span>
                      <span className="text-2xl font-bold text-blue-600">{hour.hour}:00</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Bookings: {hour.bookings}</p>
                      <p>Revenue: ₹{hour.revenue.toFixed(2)}</p>
                      <p>Avg Fare: ₹{hour.averageFare.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue by Hour */}
        {peakData?.hourlyData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Revenue by Hour</CardTitle>
              <CardDescription>Revenue distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakData.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                  <Line type="monotone" dataKey="averageFare" stroke="#82ca9d" name="Avg Fare (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
