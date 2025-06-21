"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Edit, Trash2, Car } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function VehiclesManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    plateNo: "",
    capacity: "",
    routeId: "",
    driverId: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: vehicles, mutate, isLoading } = useSWR("/api/vehicles", fetcher)
  const { data: routes } = useSWR("/api/routes", fetcher)
  const { data: drivers } = useSWR("/api/drivers", fetcher)

  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: Number.parseInt(formData.capacity),
          driverId: formData.driverId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create vehicle")
      }

      toast({
        title: "Success",
        description: "Vehicle created successfully",
      })

      setFormData({ plateNo: "", capacity: "", routeId: "", driverId: "" })
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

  const handleDelete = async (vehicleId: string, plateNo: string) => {
    if (!confirm(`Are you sure you want to delete vehicle ${plateNo}?`)) return

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete vehicle")
      }

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
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
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Vehicle Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>Register a new vehicle in the fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plateNo">Plate Number</Label>
                    <Input
                      id="plateNo"
                      value={formData.plateNo}
                      onChange={(e) => setFormData({ ...formData, plateNo: e.target.value })}
                      placeholder="e.g., KA01AB1234"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g., 40"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routeId">Route</Label>
                    <Select
                      value={formData.routeId}
                      onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
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

                  <div className="space-y-2">
                    <Label htmlFor="driverId">Driver (Optional)</Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, driverId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No driver assigned</SelectItem>
                        {drivers?.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.licenseNo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Vehicle"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Vehicles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Fleet Overview</span>
            </CardTitle>
            <CardDescription>{vehicles ? `${vehicles.length} vehicles in fleet` : "Loading..."}</CardDescription>
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
            ) : vehicles?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plateNo}</TableCell>
                      <TableCell>{vehicle.capacity} seats</TableCell>
                      <TableCell>{vehicle.route.name}</TableCell>
                      <TableCell>
                        {vehicle.driver ? (
                          <div>
                            <div className="font-medium">{vehicle.driver.name}</div>
                            <div className="text-sm text-gray-500">{vehicle.driver.licenseNo}</div>
                          </div>
                        ) : (
                          <Badge variant="outline">No driver</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vehicle.driver ? "default" : "secondary"}>
                          {vehicle.driver ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button> */}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(vehicle.id, vehicle.plateNo)}>
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
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vehicles found</p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  Add Your First Vehicle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
