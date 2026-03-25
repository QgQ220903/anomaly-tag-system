// src/pages/supervisor/SupervisorDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockTags } from "@/lib/mockData";

// Define types for trend data
interface Trend7DData {
  day: string;
  reported: number;
  resolved: number;
}

interface Trend6MData {
  month: string;
  reported: number;
  resolved: number;
}

// type TrendData = Trend7DData[] | Trend6MData[];

// Current user
// const currentUser = {
//     name: 'Ana Silva',
//     initials: 'AS',
//     role: 'SUPERVISOR',
//     roleBadgeColor: 'bg-purple-100 text-purple-700'
// };

export const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trendPeriod, setTrendPeriod] = useState<"7D" | "6M">("7D");

  // All tags
  const allTags = mockTags;

  // Stats calculations
  const openTags = allTags.filter((t) => t.status === "Open");
  const inProgressTags = allTags.filter(
    (t) => t.status === "In Progress" || t.status === "Pending Parts",
  );
  const resolvedThisWeek = allTags.filter((t) => {
    if (!t.closedAt) return false;
    const closedDate = new Date(t.closedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return closedDate >= weekAgo;
  });
  const criticalActive = allTags.filter(
    (t) =>
      t.priority === "Critical" &&
      t.status !== "Closed" &&
      t.status !== "Completed",
  );

  // Get critical tags for alert banner
  const criticalTags = criticalActive.slice(0, 2);
  const hasCriticalTags = criticalActive.length > 0;

  // Priority breakdown data
  const priorityData = [
    {
      name: "Critical",
      count: allTags.filter((t) => t.priority === "Critical").length,
      color: "#EF4444",
    },
    {
      name: "High",
      count: allTags.filter((t) => t.priority === "High").length,
      color: "#F97316",
    },
    {
      name: "Medium",
      count: allTags.filter((t) => t.priority === "Medium").length,
      color: "#F59E0B",
    },
    {
      name: "Low",
      count: allTags.filter((t) => t.priority === "Low").length,
      color: "#3B82F6",
    },
  ];
  const totalWithPriority = priorityData.reduce((sum, d) => sum + d.count, 0);

  // Category breakdown for pie chart
  const categoryData = [
    {
      name: "Safety",
      count: allTags.filter((t) => t.pillar === "Safety").length,
      color: "#EF4444",
    },
    {
      name: "Quality",
      count: allTags.filter((t) => t.pillar === "Quality").length,
      color: "#8B5CF6",
    },
    {
      name: "Equipment",
      count: allTags.filter(
        (t) =>
          t.categoryName?.includes("Mechanical") ||
          t.categoryName?.includes("Electrical"),
      ).length,
      color: "#3B82F6",
    },
    {
      name: "Process",
      count: allTags.filter(
        (t) => t.pillar === "Delivery" || t.pillar === "Cost",
      ).length,
      color: "#F97316",
    },
    {
      name: "Environment",
      count: allTags.filter((t) => t.pillar === "Environment").length,
      color: "#22C55E",
    },
  ];

  // Trend data (mock)
  const trend7DData: Trend7DData[] = [
    { day: "Mon", reported: 4, resolved: 2 },
    { day: "Tue", reported: 3, resolved: 1 },
    { day: "Wed", reported: 5, resolved: 3 },
    { day: "Thu", reported: 2, resolved: 4 },
    { day: "Fri", reported: 4, resolved: 2 },
    { day: "Sat", reported: 1, resolved: 1 },
    { day: "Sun", reported: 0, resolved: 0 },
  ];

  const trend6MData: Trend6MData[] = [
    { month: "Oct", reported: 12, resolved: 8 },
    { month: "Nov", reported: 15, resolved: 10 },
    { month: "Dec", reported: 10, resolved: 12 },
    { month: "Jan", reported: 18, resolved: 14 },
    { month: "Feb", reported: 14, resolved: 12 },
    { month: "Mar", reported: 16, resolved: 13 },
  ];

  // Get current trend data based on period
  const currentTrendData = trendPeriod === "7D" ? trend7DData : trend6MData;
  const xAxisKey = trendPeriod === "7D" ? "day" : "month";

  // Pending assignment tags (for quick view)
  const pendingTags = allTags
    .filter((t) => !t.priority || !t.assignedTo)
    .slice(0, 5);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {hasCriticalTags && (
        <div className="bg-red-600 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">
              {criticalActive.length} Critical Anomal
              {criticalActive.length === 1 ? "y" : "ies"} Active —
              {criticalTags.map((t) => t.tagId).join(", ")} — Immediate action
              required
            </span>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-red-600 hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-medium"
            onClick={() => navigate("/supervisor/tags?filter=critical")}
          >
            View →
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="bg-red-50 p-3 rounded-xl">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-right">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-4xl font-bold">{openTags.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Open</p>
              <p className="text-xs text-gray-400">Require attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-right">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +1
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-4xl font-bold">{inProgressTags.length}</p>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
              <p className="text-xs text-gray-400">Being worked on</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-right">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +3
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-4xl font-bold">{resolvedThisWeek.length}</p>
              <p className="text-sm text-gray-600 mt-1">Resolved</p>
              <p className="text-xs text-gray-400">This week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="bg-red-50 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Minus className="w-3 h-3" /> Same
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-4xl font-bold">{criticalActive.length}</p>
              <p className="text-sm text-gray-600 mt-1">Critical</p>
              <p className="text-xs text-gray-400">Immediate action</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {priorityData.map((item) => {
                const percentage =
                  totalWithPriority > 0
                    ? (item.count / totalWithPriority) * 100
                    : 0;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Anomalies:</span>
                <span className="font-bold text-gray-900">
                  {totalWithPriority}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By Category - Pie Chart */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold mb-4">By Category</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.name} ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Trend</h3>
              <ToggleGroup
                type="single"
                value={trendPeriod}
                onValueChange={(v) => v && setTrendPeriod(v as "7D" | "6M")}
              >
                <ToggleGroupItem value="7D" className="text-xs px-3">
                  7D
                </ToggleGroupItem>
                <ToggleGroupItem value="6M" className="text-xs px-3">
                  6M
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={currentTrendData as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="reported" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-xs text-gray-600">Reported</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-xs text-gray-600">Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignment Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Pending Assignment</h3>
              <Badge className="bg-red-100 text-red-700 rounded-full px-3">
                {pendingTags.length}
              </Badge>
            </div>
            <Button
              variant="link"
              className="text-orange-600"
              onClick={() => navigate("/supervisor/pending")}
            >
              View all pending →
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm font-medium text-gray-600">
                  <th className="px-4 py-3">Tag ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Machine</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingTags.map((tag) => (
                  <tr key={tag.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-orange-600">
                        {tag.tagId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tag.categoryName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {tag.machineName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {getRelativeTime(tag.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {tag.createdByUserName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() =>
                          navigate(`/supervisor/tags/${tag.id}/assign`)
                        }
                      >
                        Assign →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
