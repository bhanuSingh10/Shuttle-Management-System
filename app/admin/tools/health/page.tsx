"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Activity, Database, Server, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const { data: healthData, mutate } = useSWR("/api/health", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await mutate()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
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
              <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Status */}
        {healthData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(healthData.overall.status)}
                <span>System Status: {healthData.overall.status.toUpperCase()}</span>
              </CardTitle>
              <CardDescription>Last updated: {new Date(healthData.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{healthData.overall.uptime}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{healthData.overall.responseTime}ms</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{healthData.overall.activeUsers}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{healthData.overall.errorRate}%</div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Status */}
        {healthData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.services.map((service: any) => (
                    <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={service.status === "healthy" ? "default" : "destructive"}>
                          {service.status}
                        </Badge>
                        <div className="text-sm text-gray-600">{service.responseTime}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge variant={healthData.database.connected ? "default" : "destructive"}>
                      {healthData.database.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Query Time</span>
                    <span className="font-medium">{healthData.database.queryTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Connections</span>
                    <span className="font-medium">{healthData.database.activeConnections}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Storage Used</span>
                      <span>{healthData.database.storageUsed}%</span>
                    </div>
                    <Progress value={healthData.database.storageUsed} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Resources */}
        {healthData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>Current system resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span>{healthData.resources.cpu}%</span>
                  </div>
                  <Progress value={healthData.resources.cpu} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span>{healthData.resources.memory}%</span>
                  </div>
                  <Progress value={healthData.resources.memory} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Disk Usage</span>
                    <span>{healthData.resources.disk}%</span>
                  </div>
                  <Progress value={healthData.resources.disk} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Issues */}
        {healthData?.issues && healthData.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Recent Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData.issues.map((issue: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${getStatusColor(issue.severity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{issue.title}</span>
                        <Badge variant={issue.severity === "critical" ? "destructive" : "secondary"}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(issue.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Issues */}
        {healthData && (!healthData.issues || healthData.issues.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
              <p className="text-gray-600">No issues detected in the last 24 hours</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
