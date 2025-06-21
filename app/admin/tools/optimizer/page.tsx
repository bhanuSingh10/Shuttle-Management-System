"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Wrench, Route, TrendingUp, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function RouteOptimizerPage() {
  const [selectedRoute, setSelectedRoute] = useState("")
  const [optimizing, setOptimizing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [fromStop, setFromStop] = useState("")
  const [toStop, setToStop] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const { data: routes } = useSWR("/api/routes", fetcher)
  const { data: stops } = useSWR("/api/stops", fetcher)

  const handleOptimize = async () => {
    if (!selectedRoute) {
      toast({
        title: "No Route Selected",
        description: "Please select a route to optimize",
        variant: "destructive",
      })
      return
    }

    setOptimizing(true)
    setProgress(0)
    setResults(null)

    try {
      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromStopId: fromStop, toStopId: toStop }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Optimization failed")
      }

      setResults(data)
      toast({
        title: "Optimization Complete",
        description: "Route optimization completed successfully",
      })
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setOptimizing(false)
    }
  }

  const applyOptimization = async () => {
    if (!results) return

    try {
      const response = await fetch("/api/optimize-route/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: selectedRoute,
          optimizations: results.optimizations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to apply optimizations")
      }

      toast({
        title: "Success",
        description: "Optimizations applied successfully",
      })

      setResults(null)
      setSelectedRoute("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply optimizations",
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
            <h1 className="text-2xl font-bold text-gray-900">Route Optimizer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Optimization Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Route Optimization</span>
              </CardTitle>
              <CardDescription>Optimize routes for better efficiency and cost savings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Route</label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose route to optimize" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes?.map((route: any) => (
                      <SelectItem key={route.id} value={route.id}>
                        <div>
                          <div className="font-medium">{route.name}</div>
                          <div className="text-sm text-gray-500">
                            {route._count.stops} stops • {route._count.vehicles} vehicles
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">From Stop</label>
                <Select value={fromStop} onValueChange={setFromStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select starting stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {stops?.map((stop: any) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Stop</label>
                <Select value={toStop} onValueChange={setToStop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ending stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {stops?.map((stop: any) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {optimizing && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optimization Progress</label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">
                    {progress < 30 && "Analyzing current route..."}
                    {progress >= 30 && progress < 60 && "Calculating optimal paths..."}
                    {progress >= 60 && progress < 90 && "Evaluating efficiency gains..."}
                    {progress >= 90 && "Finalizing recommendations..."}
                  </p>
                </div>
              )}

              <Button onClick={handleOptimize} disabled={!selectedRoute || optimizing} className="w-full">
                {optimizing ? "Optimizing..." : "Start Optimization"}
              </Button>

              {results && (
                <Button onClick={applyOptimization} variant="outline" className="w-full">
                  Apply Optimizations
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Optimization Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Factors</CardTitle>
              <CardDescription>What the optimizer considers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Route className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Route Efficiency</h4>
                    <p className="text-sm text-gray-600">Minimize total distance and travel time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Stop Optimization</h4>
                    <p className="text-sm text-gray-600">Optimal stop placement and sequencing</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Schedule Efficiency</h4>
                    <p className="text-sm text-gray-600">Reduce waiting times and improve frequency</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Demand Patterns</h4>
                    <p className="text-sm text-gray-600">Adjust based on historical usage data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Results */}
        {results && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Recommended improvements for the selected route</CardDescription>
            </CardHeader>
            <CardContent>
              {results.improvements ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.improvements.distanceReduction}%</div>
                    <div className="text-sm text-green-800">Distance Reduction</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.improvements.timeReduction}%</div>
                    <div className="text-sm text-blue-800">Time Reduction</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₹{results.improvements.costSavings}</div>
                    <div className="text-sm text-purple-800">Monthly Savings</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 mb-6">No improvement data available.</div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Recommended Changes:</h4>
                {Array.isArray(results.recommendations) && results.recommendations.length > 0 ? (
                  results.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline">{rec.type}</Badge>
                      <div>
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                        <p className="text-sm text-green-600 font-medium">Impact: {rec.impact}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No recommendations available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
