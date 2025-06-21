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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, Users, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AllocatePointsPage() {
  const [formDataIndividual, setFormDataIndividual] = useState({
    userId: "",
    amount: "",
    reason: ""
  });
  const [formDataBulk, setFormDataBulk] = useState({
    amount: "",
    reason: ""
  });
  const [loadingIndividual, setLoadingIndividual] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { data: users } = useSWR("/api/admin/users?role=STUDENT", fetcher);

  const handleSubmitIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIndividual(true);
    try {
      const response = await fetch("/api/wallets/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formDataIndividual.userId,
          amount: Number.parseInt(formDataIndividual.amount),
          reason: formDataIndividual.reason
        })
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to allocate points");
      toast({
        title: "Success",
        description: `Successfully allocated ${formDataIndividual.amount} points`
      });
      setFormDataIndividual({ userId: "", amount: "", reason: "" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoadingIndividual(false);
    }
  };

  const handleBulkAllocation = async () => {
    if (!formDataBulk.amount || !formDataBulk.reason) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and reason",
        variant: "destructive"
      });
      return;
    }
    setLoadingBulk(true);
    try {
      const response = await fetch("/api/wallets/bulk-allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseInt(formDataBulk.amount),
          reason: formDataBulk.reason
        })
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to allocate points");
      toast({
        title: "Success",
        description: `Successfully allocated ${formDataBulk.amount} points to ${data.usersUpdated} users`
      });
      setFormDataBulk({ amount: "", reason: "" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoadingBulk(false);
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
              Allocate Points
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Individual Allocation</span>
              </CardTitle>
              <CardDescription>
                Allocate points to a specific user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIndividual} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Select User</Label>
                  <Select
                    value={formDataIndividual.userId}
                    onValueChange={(value) =>
                      setFormDataIndividual({
                        ...formDataIndividual,
                        userId: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-gray-500">
                              Balance: {user.wallet?.balance || 0} points
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Points)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formDataIndividual.amount}
                    onChange={(e) =>
                      setFormDataIndividual({
                        ...formDataIndividual,
                        amount: e.target.value
                      })
                    }
                    placeholder="Enter points to allocate"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formDataIndividual.reason}
                    onChange={(e) =>
                      setFormDataIndividual({
                        ...formDataIndividual,
                        reason: e.target.value
                      })
                    }
                    placeholder="Enter reason for allocation"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loadingIndividual}
                  className="w-full"
                >
                  {loadingIndividual ? "Allocating..." : "Allocate Points"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bulk Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Bulk Allocation</span>
              </CardTitle>
              <CardDescription>Allocate points to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkAmount">Amount per User (Points)</Label>
                  <Input
                    id="bulkAmount"
                    type="number"
                    value={formDataBulk.amount}
                    onChange={(e) =>
                      setFormDataBulk({
                        ...formDataBulk,
                        amount: e.target.value
                      })
                    }
                    placeholder="Points per user"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulkReason">Reason</Label>
                  <Textarea
                    id="bulkReason"
                    value={formDataBulk.reason}
                    onChange={(e) =>
                      setFormDataBulk({
                        ...formDataBulk,
                        reason: e.target.value
                      })
                    }
                    placeholder="Enter reason for bulk allocation"
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will allocate{" "}
                    {formDataBulk.amount || "X"} points to ALL users in the
                    system. This action cannot be undone.
                  </p>
                </div>

                <Button
                  onClick={handleBulkAllocation}
                  disabled={loadingBulk}
                  variant="outline"
                  className="w-full"
                >
                  {loadingBulk ? "Allocating..." : "Bulk Allocate Points"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common point allocation scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setFormDataIndividual({
                    ...formDataIndividual,
                    amount: "100",
                    reason: "Welcome bonus"
                  })
                }
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Welcome Bonus (100)
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFormDataIndividual({
                    ...formDataIndividual,
                    amount: "50",
                    reason: "Monthly allowance"
                  })
                }
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Monthly Allowance (50)
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFormDataIndividual({
                    ...formDataIndividual,
                    amount: "25",
                    reason: "Compensation"
                  })
                }
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Compensation (25)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
