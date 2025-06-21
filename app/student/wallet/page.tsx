"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Wallet, CreditCard, Smartphone, QrCode, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function WalletPage() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const { data: balance, mutate } = useSWR("/api/wallets/balance", fetcher)

  const handleTopUp = async () => {
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please enter amount and select payment method",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/wallets/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          paymentMethod: {
            type: paymentMethod,
            details: {},
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Top-up failed")
      }

      toast({
        title: "Success",
        description: `Wallet topped up successfully! Transaction ID: ${data.transactionId}`,
      })

      setAmount("")
      setPaymentMethod("")
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

  const downloadStatement = async (period: string) => {
    try {
      const response = await fetch(`/api/wallets/statement?period=${period}`)
      if (!response.ok) throw new Error("Failed to download statement")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wallet-statement-${period}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Statement downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download statement",
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
            <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Current Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-4">
                {balance ? `${balance.balance} points` : "Loading..."}
              </div>
              <p className="text-gray-600">1 point = ₹0.10</p>
            </CardContent>
          </Card>

          {/* Top Up Card */}
          <Card>
            <CardHeader>
              <CardTitle>Top Up Wallet</CardTitle>
              <CardDescription>Add money to your wallet using various payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>UPI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CARD">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="KIOSK">
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-4 w-4" />
                        <span>Kiosk QR Code</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleTopUp} disabled={loading || !amount || !paymentMethod} className="w-full">
                {loading ? "Processing..." : "Top Up Wallet"}
              </Button>
            </CardContent>
          </Card>

          {/* Statements Card */}
          <Card>
            <CardHeader>
              <CardTitle>Download Statements</CardTitle>
              <CardDescription>Download your wallet transaction history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={() => downloadStatement("weekly")} className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Weekly Statement
              </Button>
              <Button variant="outline" onClick={() => downloadStatement("monthly")} className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Monthly Statement
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
