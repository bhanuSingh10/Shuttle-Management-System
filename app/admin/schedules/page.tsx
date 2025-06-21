"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ArrowLeft, Plus, Edit, Trash2, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SchedulesManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState({
    routeId: "",
    vehicleId: "",
    departure: "",
    arrival: ""
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: schedules,
    mutate,
    isLoading
  } = useSWR(`/api/schedules?date=${selectedDate}`, fetcher);
  const { data: routes } = useSWR("/api/routes", fetcher);
  const { data: vehicles } = useSWR("/api/vehicles", fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create schedule");
      }

      toast({
        title: "Success",
        description: "Schedule created successfully"
      });

      setFormData({ routeId: "", vehicleId: "", departure: "", arrival: "" });
      setShowAddForm(false);
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });

      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const filteredVehicles = (Array.isArray(vehicles) ? vehicles : []).filter(
    (vehicle: any) => !formData.routeId || vehicle.routeId === formData.routeId
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Schedule Management
              </h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label htmlFor="date">Select Date:</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Schedule Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Schedule</CardTitle>
              <CardDescription>Create a new shuttle schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routeId">Route</Label>
                    <Select
                      value={formData.routeId}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          routeId: value,
                          vehicleId: ""
                        })
                      }
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
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicleId: value })
                      }
                      disabled={!formData.routeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles?.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNo} - {vehicle.capacity} seats
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure">Departure Time</Label>
                    <Input
                      id="departure"
                      type="datetime-local"
                      value={formData.departure}
                      onChange={(e) =>
                        setFormData({ ...formData, departure: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival">Arrival Time</Label>
                    <Input
                      id="arrival"
                      type="datetime-local"
                      value={formData.arrival}
                      onChange={(e) =>
                        setFormData({ ...formData, arrival: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Schedule"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>
                Schedules for{" "}
                {mounted ? new Date(selectedDate).toLocaleDateString() : ""}
              </span>
            </CardTitle>
            <CardDescription>
              {schedules ? `${schedules.length} schedules found` : "Loading..."}
            </CardDescription>
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
            ) : schedules?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.route.name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {schedule.vehicle.plateNo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.vehicle.capacity} seats
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.vehicle.driver ? (
                          <div>
                            <div className="font-medium">
                              {schedule.vehicle.driver.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {schedule.vehicle.driver.licenseNo}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">No driver</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {mounted && schedule.departure
                          ? new Date(schedule.departure).toLocaleTimeString()
                          : ""}
                      </TableCell>
                      <TableCell>
                        {mounted && schedule.arrival
                          ? new Date(schedule.arrival).toLocaleTimeString()
                          : ""}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            new Date(schedule.departure) > new Date()
                              ? "default"
                              : "secondary"
                          }
                        >
                          {new Date(schedule.departure) > new Date()
                            ? "Scheduled"
                            : "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* <Button size="sm" variant="outline"> */}
                          {/* <Edit className="h-4 w-4" /> */}
                          {/* </Button> */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(schedule.id)}
                          >
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
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No schedules found for this date</p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  Create First Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
