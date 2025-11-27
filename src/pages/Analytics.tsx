import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Analytics = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [dateRange, setDateRange] = useState("7");

  const patientFlowData = [
    { date: "2025-11-20", total: 45, completed: 38, cancelled: 5 },
    { date: "2025-11-21", total: 52, completed: 47, cancelled: 3 },
    { date: "2025-11-22", total: 48, completed: 42, cancelled: 4 },
    { date: "2025-11-23", total: 55, completed: 50, cancelled: 2 },
    { date: "2025-11-24", total: 41, completed: 35, cancelled: 6 },
    { date: "2025-11-25", total: 58, completed: 53, cancelled: 3 },
    { date: "2025-11-26", total: 62, completed: 57, cancelled: 4 },
  ];

  const doctorPerformance = [
    { name: "Dr. Smith", consultations: 45, completed: 42, avgTime: 18 },
    { name: "Dr. Johnson", consultations: 38, completed: 35, avgTime: 22 },
    { name: "Dr. Williams", consultations: 52, completed: 48, avgTime: 15 },
    { name: "Dr. Brown", consultations: 41, completed: 39, avgTime: 20 },
    { name: "Dr. Davis", consultations: 36, completed: 33, avgTime: 17 },
  ];

  const appointmentTrends = {
    byType: [
      { name: "New Patient", value: 120 },
      { name: "Follow-up", value: 185 },
      { name: "Surgery", value: 45 },
      { name: "Emergency", value: 32 },
    ],
    byStatus: [
      { name: "Completed", value: 312 },
      { name: "Scheduled", value: 48 },
      { name: "Cancelled", value: 22 },
    ],
  };

  const revenueData = {
    byDate: [
      { date: "2025-11-20", paid: 45000, pending: 12000 },
      { date: "2025-11-21", paid: 52000, pending: 8000 },
      { date: "2025-11-22", paid: 48000, pending: 15000 },
      { date: "2025-11-23", paid: 55000, pending: 10000 },
      { date: "2025-11-24", paid: 41000, pending: 18000 },
      { date: "2025-11-25", paid: 58000, pending: 9000 },
      { date: "2025-11-26", paid: 62000, pending: 11000 },
    ],
    summary: {
      total: 459000,
      paid: 361000,
      pending: 98000,
      transactions: 382,
    },
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into hospital operations</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenueData.summary.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {revenueData.summary.transactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointmentTrends.byType.reduce((sum, t) => sum + t.value, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Appointments booked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Consultations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {doctorPerformance.reduce((sum, d) => sum + d.completed, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">From last period</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flow" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flow">Patient Flow</TabsTrigger>
            <TabsTrigger value="doctors">Doctor Performance</TabsTrigger>
            <TabsTrigger value="appointments">Appointment Trends</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="flow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Flow Over Time</CardTitle>
                <CardDescription>
                  Track daily appointment volume and completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={patientFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
                    <Line type="monotone" dataKey="cancelled" stroke="#ff8042" name="Cancelled" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Performance Metrics</CardTitle>
                <CardDescription>
                  Consultation volume and average consultation time by doctor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consultations" fill="#8884d8" name="Total Consultations" />
                    <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Consultation Time</CardTitle>
                <CardDescription>Time spent per consultation in minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={doctorPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#0088FE" name="Avg Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Type</CardTitle>
                  <CardDescription>Distribution of appointment types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={appointmentTrends.byType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {appointmentTrends.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Status</CardTitle>
                  <CardDescription>Current status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={appointmentTrends.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {appointmentTrends.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Daily revenue breakdown showing paid and pending amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.byDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="paid" stackId="a" fill="#82ca9d" name="Paid" />
                    <Bar dataKey="pending" stackId="a" fill="#ffbb28" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ₹{revenueData.summary.total.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{revenueData.summary.paid.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    ₹{revenueData.summary.pending.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
