"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Calendar, FileText, DollarSign, Users, Route } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("bookings")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const reportTypes = [
    { value: "bookings", label: "Bookings Report", icon: FileText, description: "All booking transactions" },
    { value: "revenue", label: "Revenue Report", icon: DollarSign, description: "Financial performance data" },
    { value: "users", label: "Users Report", icon: Users, description: "User activity and engagement" },
    { value: "routes", label: "Routes Report", icon: Route, description: "Route performance metrics" },
  ]

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(`/api/admin/reports/export?${params}`)

      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Report exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>Configure your report parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <Button onClick={handleExport} disabled={loading} className="w-full">
                  {loading ? (
                    "Exporting..."
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Types Overview */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      reportType === type.value ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setReportType(type.value)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon className="h-5 w-5 mr-2" />
                        {type.label}
                      </CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        {type.value === "bookings" && "Includes booking details, user info, routes, and timestamps"}
                        {type.value === "revenue" && "Revenue breakdown by routes, payment methods, and time periods"}
                        {type.value === "users" && "User registration, activity levels, and wallet balances"}
                        {type.value === "routes" && "Route performance, popularity, and utilization metrics"}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Quick Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date()
                      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                      setStartDate(lastWeek.toISOString().split("T")[0])
                      setEndDate(today.toISOString().split("T")[0])
                    }}
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                      setStartDate(lastMonth.toISOString().split("T")[0])
                      setEndDate(today.toISOString().split("T")[0])
                    }}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date()
                      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                      setStartDate(startOfMonth.toISOString().split("T")[0])
                      setEndDate(today.toISOString().split("T")[0])
                    }}
                  >
                    This Month
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
