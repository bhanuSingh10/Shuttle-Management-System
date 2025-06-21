import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function WalletDetailsPage({ params }: { params: { userId: string } }) {
  // Fetch wallet and user info
  const wallet = await prisma.wallet.findUnique({
    where: { userId: params.userId },
    include: {
      user: { select: { email: true, role: true } },
    },
  })

  if (!wallet) return notFound()

  // Fetch transactions separately if not a relation
  const transactions = await prisma.transactions.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/admin/wallets" className="mr-4">
            <ArrowLeft className="h-5 w-5 inline-block mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-gray-600 text-sm">User Email</p>
                <p className="font-semibold">{wallet.user.email}</p>
                <p className="text-gray-600 text-sm mt-2">Role</p>
                <Badge>{wallet.user.role}</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Balance</p>
                <p className="text-3xl font-bold">{wallet.balance} points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-gray-500">No transactions found.</div>
            ) : (
              <ul className="divide-y">
                {transactions.map((tx) => (
                  <li key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-gray-500 text-sm">{tx.reason || "—"}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          tx.amount > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount} pts
                      </span>
                      <div className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}