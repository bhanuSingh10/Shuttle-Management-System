// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Users, Route, Car, Calendar, TrendingUp, MapPin } from "lucide-react"
// import useSWR from "swr"
// import { NotificationsDropdown } from "@/components/notifications-dropdown"

// const fetcher = (url: string) => fetch(url).then((res) => res.json())

// export default function AdminDashboard() {
//   const { data: analytics } = useSWR("/api/admin/analytics/usage", fetcher)

//   const stats = [
//     {
//       title: "Total Routes",
//       value: analytics?.totalRoutes || "0",
//       icon: Route,
//       color: "text-blue-600",
//     },
//     {
//       title: "Active Vehicles",
//       value: analytics?.activeVehicles || "0",
//       icon: Car,
//       color: "text-green-600",
//     },
//     {
//       title: "Today's Bookings",
//       value: analytics?.todayBookings || "0",
//       icon: Calendar,
//       color: "text-purple-600",
//     },
//     {
//       title: "Total Users",
//       value: analytics?.totalUsers || "0",
//       icon: Users,
//       color: "text-orange-600",
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//             <div className="flex items-center space-x-4">
//               <NotificationsDropdown />
//               <Button variant="outline" size="sm">
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {stats.map((stat) => (
//             <Card key={stat.title}>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                     <p className="text-3xl font-bold">{stat.value}</p>
//                   </div>
//                   <stat.icon className={`h-8 w-8 ${stat.color}`} />
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Management Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Route className="h-5 w-5" />
//                 <span>Routes & Stops</span>
//               </CardTitle>
//               <CardDescription>Manage shuttle routes and stops</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Manage Routes</Button>
//               <Button variant="outline" className="w-full">
//                 Manage Stops
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Bulk Import
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Car className="h-5 w-5" />
//                 <span>Fleet Management</span>
//               </CardTitle>
//               <CardDescription>Manage vehicles and drivers</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Manage Vehicles</Button>
//               <Button variant="outline" className="w-full">
//                 Manage Drivers
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Vehicle Assignments
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Calendar className="h-5 w-5" />
//                 <span>Schedules</span>
//               </CardTitle>
//               <CardDescription>Manage shuttle schedules</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Create Schedule</Button>
//               <Button variant="outline" className="w-full">
//                 View Schedules
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Schedule Reports
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Users className="h-5 w-5" />
//                 <span>User Management</span>
//               </CardTitle>
//               <CardDescription>Manage users and wallets</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Allocate Points</Button>
//               <Button variant="outline" className="w-full">
//                 User Reports
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Wallet Management
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <TrendingUp className="h-5 w-5" />
//                 <span>Analytics</span>
//               </CardTitle>
//               <CardDescription>View system analytics</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Usage Analytics</Button>
//               <Button variant="outline" className="w-full">
//                 Revenue Reports
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Peak Hour Analysis
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <MapPin className="h-5 w-5" />
//                 <span>System Tools</span>
//               </CardTitle>
//               <CardDescription>System utilities and tools</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full">Route Optimizer</Button>
//               <Button variant="outline" className="w-full">
//                 System Health
//               </Button>
//               <Button variant="outline" className="w-full">
//                 Backup & Export
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   )
// }

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  MapPin,
  Car,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Upload,
  UserPlus,
  Download,
  Activity,
  Wrench,
  TrendingUp,
  Clock,
  Database,
  Shield
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const { data: stats } = useSWR("/api/admin/system/stats", fetcher);

  const adminSections = [
    {
      title: "Routes & Stops",
      description: "Manage shuttle routes and stops",
      icon: Route,
      color: "bg-blue-500",
      actions: [
        { label: "Manage Routes", href: "/admin/routes", icon: Route },
        { label: "Manage Stops", href: "/admin/stops", icon: MapPin },
        { label: "Bulk Import", href: "/admin/import", icon: Upload }
      ]
    },
    {
      title: "Fleet Management",
      description: "Manage vehicles and drivers",
      icon: Car,
      color: "bg-green-500",
      actions: [
        { label: "Manage Vehicles", href: "/admin/vehicles", icon: Car },
        { label: "Manage Drivers", href: "/admin/drivers", icon: Users },
        {
          label: "Vehicle Assignments",
          href: "/admin/assignments",
          icon: UserPlus
        }
      ]
    },
    {
      title: "Schedules",
      description: "Manage shuttle schedules",
      icon: Calendar,
      color: "bg-purple-500",
      actions: [
        {
          label: "Create Schedule",
          href: "/admin/schedules/create",
          icon: Calendar
        },
        { label: "View Schedules", href: "/admin/schedules", icon: Calendar },
        {
          label: "Schedule Reports",
          href: "/admin/schedules/reports",
          icon: BarChart3
        }
      ]
    },
    {
      title: "User Management",
      description: "Manage users and wallets",
      icon: Users,
      color: "bg-orange-500",
      actions: [
        { label: "Manage Users", href: "/admin/users", icon: Users },
        {
          label: "Allocate Points",
          href: "/admin/wallets/allocate",
          icon: TrendingUp
        },
        { label: "Wallet Management", href: "/admin/wallets", icon: Database }
      ]
    },
    {
      title: "Analytics",
      description: "View system analytics",
      icon: BarChart3,
      color: "bg-indigo-500",
      actions: [
        { label: "Usage Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Revenue Reports", href: "/admin/reports", icon: TrendingUp },
        {
          label: "Peak Hour Analysis",
          href: "/admin/analytics/peak-hours",
          icon: Clock
        }
      ]
    },
    {
      title: "System Tools",
      description: "System utilities and tools",
      icon: Settings,
      color: "bg-red-500",
      actions: [
        {
          label: "Route Optimizer",
          href: "/admin/tools/optimizer",
          icon: Wrench
        },
        { label: "System Health", href: "/admin/tools/health", icon: Activity },
        {
          label: "Backup & Export",
          href: "/admin/tools/backup",
          icon: Download
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your shuttle system</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/tools/health")}
              >
                <Shield className="h-4 w-4 mr-2" />
                System Status
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.userStats?.totalUsers ?? 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Routes
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.systemStats?.totalRoutes ?? 0}
                    </p>
                  </div>
                  <Route className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Fleet Size
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.systemStats?.totalVehicles ?? 0}
                    </p>
                  </div>
                  <Car className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Today's Bookings
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.userStats?.todayBookings ?? 0}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-2">
                    {section.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Button
                          key={action.label}
                          variant="ghost"
                          className="justify-start h-auto p-3"
                          onClick={() => router.push(action.href)}
                        >
                          <ActionIcon className="h-4 w-4 mr-3" />
                          <span className="text-left">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(stats?.recentActivity) &&
            stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
