"use client";

import type React from "react";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Plus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CreateSchedulePage() {
  const [formData, setFormData] = useState({
    routeId: "",
    vehicleId: "",
    departure: "",
    arrival: "",
    recurring: false,
    days: [] as string[],
    endDate: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { data: routes } = useSWR("/api/routes", fetcher);
  const { data: vehicles } = useSWR("/api/vehicles", fetcher);

  const filteredVehicles = vehicles?.filter(
    (vehicle: any) => !formData.routeId || vehicle.routeId === formData.routeId
  );

  const weekDays = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" }
  ];

  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, days: [...formData.days, day] });
    } else {
      setFormData({
        ...formData,
        days: formData.days.filter((d) => d !== day)
      });
    }
  };

  const toISOString = (local: string) => {
    if (!local) return "";
    // Pad with ":00" if seconds are missing
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) {
      local = local + ":00";
    }
    // Convert to ISO string (local time to UTC)
    const date = new Date(local);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.departure || !formData.arrival) {
      toast({
        title: "Error",
        description: "Please select both departure and arrival times.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Convert to ISO and validate
    const departureISO = toISOString(formData.departure);
    const arrivalISO = toISOString(formData.arrival);

    if (!departureISO || !arrivalISO) {
      toast({
        title: "Error",
        description: "Invalid date format.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        departure: departureISO,
        arrival: arrivalISO
      };

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create schedule");
      }

      toast({
        title: "Success",
        description: formData.recurring
          ? "Recurring schedules created successfully"
          : "Schedule created successfully"
      });

      router.push("/admin/schedules");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Schedule
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>New Schedule</span>
            </CardTitle>
            <CardDescription>Create a new shuttle schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
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
                          {vehicle.driver && ` (${vehicle.driver.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Recurring Schedule */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={formData.recurring}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, recurring: !!checked })
                    }
                  />
                  <Label htmlFor="recurring">Create recurring schedule</Label>
                </div>

                {formData.recurring && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <Label>Select Days</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {weekDays.map((day) => (
                          <div
                            key={day.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={day.id}
                              checked={formData.days.includes(day.id)}
                              onCheckedChange={(checked) =>
                                handleDayChange(day.id, !!checked)
                              }
                            />
                            <Label htmlFor={day.id} className="text-sm">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        required={formData.recurring}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Schedule
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Schedule Preview */}
        {formData.departure && formData.arrival && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Schedule Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Route:</strong>{" "}
                  {routes?.find((r: any) => r.id === formData.routeId)?.name ||
                    "Not selected"}
                </p>
                <p>
                  <strong>Vehicle:</strong>{" "}
                  {filteredVehicles?.find(
                    (v: any) => v.id === formData.vehicleId
                  )?.plateNo || "Not selected"}
                </p>
                <p>
                  <strong>Departure:</strong>{" "}
                  {new Date(formData.departure).toLocaleString()}
                </p>
                <p>
                  <strong>Arrival:</strong>{" "}
                  {new Date(formData.arrival).toLocaleString()}
                </p>
                {formData.recurring && (
                  <>
                    <p>
                      <strong>Recurring:</strong> Yes
                    </p>
                    <p>
                      <strong>Days:</strong> {formData.days.join(", ")}
                    </p>
                    <p>
                      <strong>Until:</strong> {formData.endDate}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
