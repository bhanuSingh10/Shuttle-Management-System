"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WalletManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { data: wallets, mutate } = useSWR("/api/admin/wallets", fetcher);
  const { data: stats } = useSWR("/api/admin/wallets/stats", fetcher);

  const filteredWallets = wallets?.filter((wallet: any) =>
    wallet.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAllocatePoints = async () => {
    if (!selectedUser || !allocationAmount) {
      toast({
        title: "Missing Information",
        description: "Please select user and enter amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wallets/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          amount: Number.parseInt(allocationAmount),
          reason: "Admin allocation"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to allocate points");
      }

      toast({
        title: "Success",
        description: "Points allocated successfully"
      });

      setSelectedUser("");
      setAllocationAmount("");
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to allocate points",
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
                Wallet Management
              </h1>
            </div>
            <Button onClick={() => router.push("/admin/wallets/allocate")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Allocate Points
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Wallets
                    </p>
                    <p className="text-3xl font-bold">{stats.totalWallets}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Balance
                    </p>
                    <p className="text-3xl font-bold">{stats.totalBalance}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Low Balance
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.lowBalanceCount}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Balance
                    </p>
                    <p className="text-3xl font-bold">{stats.averageBalance}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallets Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Wallets</CardTitle>
            <CardDescription>
              {filteredWallets
                ? `${filteredWallets.length} wallets found`
                : "Loading..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredWallets ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet: any) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">
                        {wallet.user.email}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {wallet.balance} points
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            wallet.balance < 50
                              ? "destructive"
                              : wallet.balance < 200
                              ? "secondary"
                              : "default"
                          }
                        >
                          {wallet.balance < 50
                            ? "Low"
                            : wallet.balance < 200
                            ? "Medium"
                            : "Good"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {wallet.lastTransaction
                          ? new Date(
                              wallet.lastTransaction
                            ).toLocaleDateString()
                          : "No transactions"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/wallets/allocate?userId=${wallet.userId}`)}
                          >
                            Allocate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading wallets...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
