"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function BulkImportPage() {
  const [importType, setImportType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const importTypes = [
    { value: "routes", label: "Routes", description: "Import shuttle routes" },
    { value: "stops", label: "Stops", description: "Import bus stops" },
    { value: "vehicles", label: "Vehicles", description: "Import vehicle fleet" },
    { value: "drivers", label: "Drivers", description: "Import driver information" },
    { value: "users", label: "Users", description: "Import user accounts" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file || !importType) {
      toast({
        title: "Missing Information",
        description: "Please select both import type and file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", importType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/import/${importType}`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Import failed")
      }

      setResults(data)
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.successful} ${importType}`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = async (type: string) => {
    try {
      const response = await fetch(`/api/import/template?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-template.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
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
            <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Import Configuration</CardTitle>
              <CardDescription>Select what you want to import and upload your CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importType">Import Type</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select import type" />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {importType && (
                <div className="space-y-2">
                  <Label>Download Template</Label>
                  <Button variant="outline" onClick={() => downloadTemplate(importType)} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download {importType} Template
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file">CSV File</Label>
                <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
                {file && (
                  <p className="text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Label>Import Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">{progress}% complete</p>
                </div>
              )}

              <Button onClick={handleImport} disabled={!file || !importType || uploading} className="w-full">
                {uploading ? (
                  "Importing..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Import Guidelines</CardTitle>
              <CardDescription>Important information about bulk imports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">File Format</h4>
                    <p className="text-sm text-gray-600">
                      Only CSV files are supported. Use the template for correct format.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Validation</h4>
                    <p className="text-sm text-gray-600">
                      All data will be validated before import. Invalid rows will be skipped.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Duplicate Handling</h4>
                    <p className="text-sm text-gray-600">Existing records with same identifiers will be updated.</p>
                  </div>
                </div>
              </div>

              {importType && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {importTypes.find((t) => t.value === importType)?.label} Import Notes
                  </h4>
                  <div className="text-sm text-blue-800">
                    {importType === "routes" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Route names must be unique</li>
                        <li>Peak hours should be in HH:MM format</li>
                        <li>Dynamic fare multipliers should be decimal values</li>
                      </ul>
                    )}
                    {importType === "stops" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Coordinates must be valid latitude/longitude</li>
                        <li>Route ID must exist in the system</li>
                        <li>Stop names should be unique per route</li>
                      </ul>
                    )}
                    {importType === "vehicles" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Plate numbers must be unique</li>
                        <li>Capacity must be a positive integer</li>
                        <li>Route ID must exist in the system</li>
                      </ul>
                    )}
                    {importType === "drivers" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>License numbers must be unique</li>
                        <li>Names are required fields</li>
                        <li>Contact information should be valid</li>
                      </ul>
                    )}
                    {importType === "users" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Email addresses must be unique and valid</li>
                        <li>Default role will be STUDENT</li>
                        <li>Wallets will be created automatically</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Import Results */}
        {results && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>Summary of the import operation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                  <div className="text-sm text-blue-800">Total Processed</div>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {results.errors.map((error: string, index: number) => (
                      <p key={index} className="text-sm text-red-800">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
