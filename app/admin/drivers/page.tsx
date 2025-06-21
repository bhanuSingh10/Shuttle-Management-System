"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Edit, Trash2, User, Car } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DriversManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    licenseNo: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: drivers, mutate, isLoading } = useSWR("/api/admin/drivers", fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create driver")
      }

      toast({
        title: "Success",
        description: "Driver created successfully",
      })

      setFormData({ name: "", licenseNo: "" })
      setShowAddForm(false)
      mutate()
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

  const handleDelete = async (driverId: string, driverName: string) => {
    if (!confirm(`Are you sure you want to delete driver ${driverName}?`)) return

    try {
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete driver")
      }

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete driver",
        variant: "destructive",
      })
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
              <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Driver Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Driver</CardTitle>
              <CardDescription>Register a new driver in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Driver Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNo">License Number</Label>
                    <Input
                      id="licenseNo"
                      value={formData.licenseNo}
                      onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                      placeholder="e.g., DL123456789"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Driver"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Drivers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Drivers Overview</span>
            </CardTitle>
            <CardDescription>{drivers ? `${drivers.length} drivers registered` : "Loading..."}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : drivers?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Assigned Vehicles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver: any) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.licenseNo}</TableCell>
                      <TableCell>
                        {driver.vehicles.length > 0 ? (
                          <div className="space-y-1">
                            {driver.vehicles.map((vehicle: any) => (
                              <div key={vehicle.id} className="flex items-center space-x-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{vehicle.plateNo}</span>
                                <Badge variant="outline" className="text-xs">
                                  {vehicle.route.name}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline">No vehicles assigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={driver.vehicles.length > 0 ? "default" : "secondary"}>
                          {driver.vehicles.length > 0 ? "Active" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button> */}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(driver.id, driver.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No drivers found</p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  Add Your First Driver
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
