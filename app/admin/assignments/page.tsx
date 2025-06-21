"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, UserPlus, Car, Users, Route } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function VehicleAssignmentsPage() {
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedDriver, setSelectedDriver] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: vehicles, mutate: mutateVehicles } = useSWR("/api/vehicles", fetcher)
  const { data: drivers } = useSWR("/api/drivers", fetcher)
  const { data: assignments, mutate: mutateAssignments } = useSWR("/api/admin/assignments", fetcher)

  const unassignedVehicles = vehicles?.filter((vehicle: any) => !vehicle.driverId)
  const availableDrivers = drivers?.filter((driver: any) => driver.vehicles.length === 0)

  const handleAssignment = async () => {
    if (!selectedVehicle || !selectedDriver) {
      toast({
        title: "Missing Selection",
        description: "Please select both vehicle and driver",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          driverId: selectedDriver,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create assignment")
      }

      toast({
        title: "Success",
        description: "Vehicle assigned successfully",
      })

      setSelectedVehicle("")
      setSelectedDriver("")
      mutateVehicles()
      mutateAssignments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign vehicle",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/admin/assignments/${vehicleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to unassign vehicle")
      }

      toast({
        title: "Success",
        description: "Vehicle unassigned successfully",
      })

      mutateVehicles()
      mutateAssignments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign vehicle",
        variant: "destructive",
      })
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
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Assignments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Create New Assignment</span>
            </CardTitle>
            <CardDescription>Assign drivers to vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedVehicles?.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNo} - {vehicle.route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Driver</label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers?.map((driver: any) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.licenseNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAssignment} disabled={loading} className="w-full">
                  {loading ? "Assigning..." : "Assign Vehicle"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>Active vehicle-driver assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {vehicles?.filter((v: any) => v.driver).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles
                    ?.filter((vehicle: any) => vehicle.driver)
                    .map((vehicle: any) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{vehicle.plateNo}</div>
                              <div className="text-sm text-gray-500">{vehicle.capacity} seats</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{vehicle.driver.name}</div>
                              <div className="text-sm text-gray-500">{vehicle.driver.licenseNo}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Route className="h-4 w-4 text-gray-500" />
                            <Badge variant="outline">{vehicle.route.name}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleUnassign(vehicle.id)}>
                            Unassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vehicle assignments found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Vehicles</p>
                  <p className="text-3xl font-bold">{vehicles?.filter((v: any) => v.driver).length || 0}</p>
                </div>
                <Car className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unassigned Vehicles</p>
                  <p className="text-3xl font-bold">{unassignedVehicles?.length || 0}</p>
                </div>
                <Car className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Drivers</p>
                  <p className="text-3xl font-bold">{availableDrivers?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
