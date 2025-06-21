"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, Users, Route, DollarSign, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
  const [revenuePeriod, setRevenuePeriod] = useState("monthly")
  const [peakHoursDays, setPeakHoursDays] = useState("30")
  const router = useRouter()

  const { data: usage } = useSWR("/api/admin/analytics/usage", fetcher)
  const { data: revenue } = useSWR(`/api/admin/analytics/revenue?period=${revenuePeriod}`, fetcher)
  const { data: peakHours } = useSWR(`/api/admin/analytics/peak-hours?days=${peakHoursDays}`, fetcher)

  const downloadReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${type}-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download report:", error)
    }
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => downloadReport("usage")}>
                <Download className="h-4 w-4 mr-2" />
                Export Usage
              </Button>
              <Button variant="outline" onClick={() => downloadReport("revenue")}>
                <Download className="h-4 w-4 mr-2" />
                Export Revenue
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Routes</p>
                  <p className="text-3xl font-bold">{usage?.totalRoutes || 0}</p>
                </div>
                <Route className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold">{usage?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-3xl font-bold">{usage?.todayBookings || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{revenue?.summary?.totalRevenue?.toFixed(2) || "0.00"}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue and booking trends over time</CardDescription>
              </div>
              <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {revenue?.chartData ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenue.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Loading revenue data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Peak Hours Analysis</CardTitle>
                  <CardDescription>Booking patterns by hour of day</CardDescription>
                </div>
                <Select value={peakHoursDays} onValueChange={setPeakHoursDays}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7d</SelectItem>
                    <SelectItem value="30">30d</SelectItem>
                    <SelectItem value="90">90d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {peakHours?.hourlyData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHours.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-gray-500">Loading peak hours data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Routes</CardTitle>
              <CardDescription>Routes by revenue generation</CardDescription>
            </CardHeader>
            <CardContent>
              {revenue?.topRoutes ? (
                <div className="space-y-4">
                  {revenue.topRoutes.slice(0, 8).map((route: any, index: number) => (
                    <div key={route.route} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{route.route}</span>
                      </div>
                      <span className="text-green-600 font-semibold">₹{route.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <p className="text-gray-500">Loading route data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Pattern */}
        {peakHours?.weeklyData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Weekly Booking Pattern</CardTitle>
              <CardDescription>Booking distribution across days of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
