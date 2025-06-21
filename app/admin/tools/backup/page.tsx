"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BackupExportPage() {
  const [backupProgress, setBackupProgress] = useState(0)
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: backupHistory } = useSWR("/api/admin/system/backup/history", fetcher)
  const { data: stats } = useSWR("/api/admin/system/stats", fetcher)

  const handleBackup = async (type: string) => {
    setBackingUp(true)
    setBackupProgress(0)

    try {
      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch("/api/admin/system/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      clearInterval(progressInterval)
      setBackupProgress(100)

      if (!response.ok) {
        throw new Error("Backup failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `shuttle-system-backup-${type}-${new Date().toISOString().split("T")[0]}.sql`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Backup Complete",
        description: `${type} backup downloaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setBackingUp(false)
      setTimeout(() => setBackupProgress(0), 2000)
    }
  }

  const handleRestore = async (file: File) => {
    setRestoring(true)

    try {
      const formData = new FormData()
      formData.append("backup", file)

      const response = await fetch("/api/admin/system/restore", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Restore failed")
      }

      toast({
        title: "Restore Complete",
        description: "System restored successfully",
      })
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore system",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              Back
            </Button>
            <h1 className="text-lg font-semibold">Backup and Restore</h1>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Backup</h2>
            <div className="flex space-x-4 mb-4">
              <Button
                onClick={() => handleBackup("full")}
                disabled={backingUp}
                className="flex-1"
              >
                {backingUp ? "Backing Up..." : "Full Backup"}
              </Button>
              <Button
                onClick={() => handleBackup("partial")}
                disabled={backingUp}
                className="flex-1"
              >
                {backingUp ? "Backing Up..." : "Partial Backup"}
              </Button>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${backupProgress}%` }}
              />
            </div>
            {backupProgress > 0 && (
              <div className="text-sm text-gray-500 mb-4">
                Backup in progress... {backupProgress}%
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4">Restore</h2>
            <input
              type="file"
              accept=".sql"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleRestore(file)
                }
              }}
              className="mb-4"
            />
            {Array.isArray(stats?.recentActivity) && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{activity.type}</Badge>
                      <span>{activity.description}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString()
                        : "Unknown time"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>No recent activity.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
