"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: settings, mutate, isLoading } = useSWR("/api/admin/settings", fetcher)

  const [formData, setFormData] = useState({
    systemName: "",
    defaultFare: 0,
    maxWalletBalance: 0,
    lowBalanceThreshold: 0,
    maintenanceMode: false,
    allowRegistration: true,
    maxBookingsPerDay: 0,
  })

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        systemName: settings.systemName || "",
        defaultFare: settings.defaultFare || 0,
        maxWalletBalance: settings.maxWalletBalance || 0,
        lowBalanceThreshold: settings.lowBalanceThreshold || 0,
        maintenanceMode: settings.maintenanceMode || false,
        allowRegistration: settings.allowRegistration || true,
        maxBookingsPerDay: settings.maxBookingsPerDay || 0,
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={formData.systemName}
                  onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                  placeholder="Shuttle Management System"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultFare">Default Fare (Points)</Label>
                  <Input
                    id="defaultFare"
                    type="number"
                    value={formData.defaultFare}
                    onChange={(e) => setFormData({ ...formData, defaultFare: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxBookingsPerDay">Max Bookings Per Day</Label>
                  <Input
                    id="maxBookingsPerDay"
                    type="number"
                    value={formData.maxBookingsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxBookingsPerDay: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Settings</CardTitle>
              <CardDescription>Configure wallet limits and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxWalletBalance">Max Wallet Balance (Points)</Label>
                  <Input
                    id="maxWalletBalance"
                    type="number"
                    value={formData.maxWalletBalance}
                    onChange={(e) => setFormData({ ...formData, maxWalletBalance: Number.parseInt(e.target.value) })}
                    min="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowBalanceThreshold">Low Balance Threshold (Points)</Label>
                  <Input
                    id="lowBalanceThreshold"
                    type="number"
                    value={formData.lowBalanceThreshold}
                    onChange={(e) => setFormData({ ...formData, lowBalanceThreshold: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Controls */}
          <Card>
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
              <CardDescription>Control system availability and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">When enabled, the system will be unavailable to students</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">Allow Registration</Label>
                  <p className="text-sm text-gray-500">When disabled, new users cannot register</p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={formData.allowRegistration}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowRegistration: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Last Updated</Label>
                    <p>{new Date(settings.lastUpdated).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Updated By</Label>
                    <p>{settings.updatedBy || "System"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
