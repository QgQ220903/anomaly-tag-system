// src/pages/supervisor/Reports.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockTags, mockUsers } from "@/lib/mockData";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  PILLAR_CONFIG,
  type Pillar,
} from "@/types";
import { format } from "date-fns";

type ReportType =
  | "summary"
  | "detailed"
  | "by-category"
  | "by-pillar"
  | "aging";

// Helper to get initials
// const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
// };

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>("summary");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(
      mockTags
        .map((t) => t.categoryName)
        .filter((name): name is string => !!name),
    );
    return Array.from(cats);
  }, []);

  // Get unique pillars
  const pillars: Pillar[] = [
    "Safety",
    "Quality",
    "Delivery",
    "Cost",
    "Morale",
    "Environment",
  ];

  // Maintenance users
  const maintenanceUsers = mockUsers.filter(
    (u) => u.role === "Maintenance Supervisor",
  );

  // Filter tags based on all filters
  const filteredTags = useMemo(() => {
    let filtered = mockTags;

    // Date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((tag) => {
        const createdDate = new Date(tag.createdAt);
        return createdDate >= dateRange.from && createdDate <= dateRange.to;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((tag) => tag.categoryName === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((tag) => tag.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tag) => tag.status === statusFilter);
    }

    // Pillar filter
    if (pillarFilter !== "all") {
      filtered = filtered.filter((tag) => tag.pillar === pillarFilter);
    }

    // Assigned filter
    if (assignedFilter !== "all") {
      if (assignedFilter === "unassigned") {
        filtered = filtered.filter((tag) => !tag.assignedTo);
      } else {
        filtered = filtered.filter((tag) => tag.assignedTo === assignedFilter);
      }
    }

    return filtered;
  }, [
    dateRange,
    categoryFilter,
    priorityFilter,
    statusFilter,
    pillarFilter,
    assignedFilter,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const open = filteredTags.filter((t) => t.status === "Open").length;
    const inProgress = filteredTags.filter(
      (t) => t.status === "In Progress" || t.status === "Pending Parts",
    ).length;
    const completed = filteredTags.filter(
      (t) => t.status === "Completed",
    ).length;
    const closed = filteredTags.filter((t) => t.status === "Closed").length;
    const total = filteredTags.length;

    const avgResolutionTime =
      filteredTags
        .filter((t) => t.completedAt)
        .reduce((acc, t) => {
          const created = new Date(t.createdAt);
          const completed = new Date(t.completedAt!);
          const hours =
            (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }, 0) / (filteredTags.filter((t) => t.completedAt).length || 1);

    return {
      open,
      inProgress,
      completed,
      closed,
      total,
      avgResolutionTime: Math.round(avgResolutionTime),
    };
  }, [filteredTags]);

  // Data for charts
  const statusChartData = useMemo(() => {
    return [
      { name: "Open", value: stats.open, color: "#3B82F6" },
      { name: "In Progress", value: stats.inProgress, color: "#8B5CF6" },
      { name: "Completed", value: stats.completed, color: "#22C55E" },
      { name: "Closed", value: stats.closed, color: "#6B7280" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const priorityChartData = useMemo(() => {
    return [
      {
        name: "Critical",
        value: filteredTags.filter((t) => t.priority === "Critical").length,
        color: "#EF4444",
      },
      {
        name: "High",
        value: filteredTags.filter((t) => t.priority === "High").length,
        color: "#F97316",
      },
      {
        name: "Medium",
        value: filteredTags.filter((t) => t.priority === "Medium").length,
        color: "#F59E0B",
      },
      {
        name: "Low",
        value: filteredTags.filter((t) => t.priority === "Low").length,
        color: "#3B82F6",
      },
    ].filter((d) => d.value > 0);
  }, [filteredTags]);

  const categoryChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredTags.forEach((tag) => {
      if (tag.categoryName) {
        categoryMap.set(
          tag.categoryName,
          (categoryMap.get(tag.categoryName) || 0) + 1,
        );
      }
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredTags]);

  const pillarChartData = useMemo(() => {
    return pillars
      .map((pillar) => ({
        name: pillar,
        value: filteredTags.filter((t) => t.pillar === pillar).length,
      }))
      .filter((d) => d.value > 0);
  }, [filteredTags]);

  // Trend data (group by date)
  const trendData = useMemo(() => {
    const dateMap = new Map<string, { created: number; resolved: number }>();

    filteredTags.forEach((tag) => {
      const date = new Date(tag.createdAt).toLocaleDateString();
      const existing = dateMap.get(date) || { created: 0, resolved: 0 };
      existing.created++;
      dateMap.set(date, existing);

      if (tag.completedAt) {
        const resolvedDate = new Date(tag.completedAt).toLocaleDateString();
        const resolvedExisting = dateMap.get(resolvedDate) || {
          created: 0,
          resolved: 0,
        };
        resolvedExisting.resolved++;
        dateMap.set(resolvedDate, resolvedExisting);
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [filteredTags]);

  // Aging data
  const agingData = useMemo(() => {
    const buckets = [
      { range: "0-1 day", min: 0, max: 1, count: 0 },
      { range: "2-3 days", min: 2, max: 3, count: 0 },
      { range: "4-7 days", min: 4, max: 7, count: 0 },
      { range: "8-14 days", min: 8, max: 14, count: 0 },
      { range: "15-30 days", min: 15, max: 30, count: 0 },
      { range: "30+ days", min: 31, max: Infinity, count: 0 },
    ];

    filteredTags.forEach((tag) => {
      if (tag.status !== "Closed" && tag.status !== "Completed") {
        const daysOpen = Math.ceil(
          (new Date().getTime() - new Date(tag.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const bucket = buckets.find(
          (b) => daysOpen >= b.min && daysOpen <= b.max,
        );
        if (bucket) bucket.count++;
      }
    });

    return buckets.filter((b) => b.count > 0);
  }, [filteredTags]);

  const activeFiltersCount = [
    categoryFilter !== "all",
    priorityFilter !== "all",
    statusFilter !== "all",
    pillarFilter !== "all",
    assignedFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setPillarFilter("all");
    setAssignedFilter("all");
    setDateRange({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    });
  };

  const handleExport = async (format: "excel" | "csv") => {
    setExporting(true);
    // Simulate export
    setTimeout(() => {
      alert(
        `Export to ${format.toUpperCase()} completed. ${filteredTags.length} records exported.`,
      );
      setExporting(false);
    }, 1000);
  };

  const getDaysOpenClass = (daysOpen: number) => {
    if (daysOpen > 7) return "text-red-600 font-medium";
    if (daysOpen > 3) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link
              to="/supervisor/dashboard"
              className="flex items-center gap-1 hover:text-orange-500"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-gray-400">Reports & Analytics</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Reports & Analytics</h1>
              <p className="text-gray-500 mt-1">
                Analyze anomaly trends and export reports
              </p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("excel")}
                    disabled={exporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export data to Excel (.xlsx)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("csv")}
                    disabled={exporting}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export data to CSV</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-orange-500 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Filter Grid - Responsive với chiều rộng đều nhau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Date Range - chiếm 2 cột trên màn hình lớn */}
              <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
                <Label className="text-xs text-gray-500 mb-1 block">
                  Date Range
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                    >
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                              {format(dateRange.to, "MMM dd, yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd, yyyy")
                          )
                        ) : (
                          "Pick a date range"
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) =>
                        range &&
                        setDateRange({ from: range.from!, to: range.to! })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Select */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Category
                </Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Select */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Priority
                </Label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[140px]">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[140px]">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending Parts">Pending Parts</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pillar Select */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Pillar
                </Label>
                <Select value={pillarFilter} onValueChange={setPillarFilter}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="All Pillars" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[140px]">
                    <SelectItem value="all">All Pillars</SelectItem>
                    {pillars.map((pillar) => (
                      <SelectItem key={pillar} value={pillar}>
                        {pillar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To Select */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Assigned To
                </Label>
                <Select
                  value={assignedFilter}
                  onValueChange={setAssignedFilter}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[180px]">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {maintenanceUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-xs text-gray-500">Active filters:</span>
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {categoryFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setCategoryFilter("all")}
                    />
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Priority: {priorityFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setPriorityFilter("all")}
                    />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setStatusFilter("all")}
                    />
                  </Badge>
                )}
                {pillarFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Pillar: {pillarFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setPillarFilter("all")}
                    />
                  </Badge>
                )}
                {assignedFilter !== "all" &&
                  assignedFilter !== "unassigned" && (
                    <Badge variant="secondary" className="gap-1">
                      Assigned:{" "}
                      {mockUsers.find((u) => u.id === assignedFilter)?.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setAssignedFilter("all")}
                      />
                    </Badge>
                  )}
                {assignedFilter === "unassigned" && (
                  <Badge variant="secondary" className="gap-1">
                    Assigned: Unassigned
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setAssignedFilter("all")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Tags</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              <p className="text-xs text-gray-500">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-purple-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              <p className="text-xs text-gray-500">Closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
              <p className="text-xs text-gray-500">Avg Resolution (hrs)</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ReportType)}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="by-pillar">By Pillar</TabsTrigger>
            <TabsTrigger value="aging">Aging Report</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent || 1 * 100).toFixed(0)}%)`
                        }
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={priorityChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <RechartsTooltip />
                      <Bar
                        dataKey="value"
                        fill="#F97316"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trend Analysis (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      stroke="#EF4444"
                      name="Created"
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#22C55E"
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 10 Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Pillar</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Days Open</TableHead>
                        <TableHead>Resolved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTags.map((tag) => {
                        const daysOpen = Math.ceil(
                          (new Date().getTime() -
                            new Date(tag.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        return (
                          <TableRow key={tag.id}>
                            <TableCell className="font-mono text-xs">
                              {tag.tagId}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {tag.description}
                            </TableCell>
                            <TableCell>{tag.categoryName}</TableCell>
                            <TableCell>
                              <Badge
                                className={STATUS_CONFIG[tag.status].bgColor}
                              >
                                <span
                                  className={STATUS_CONFIG[tag.status].color}
                                >
                                  {tag.status}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tag.priority ? (
                                <Badge
                                  className={
                                    PRIORITY_CONFIG[tag.priority].bgColor
                                  }
                                >
                                  <span
                                    className={
                                      PRIORITY_CONFIG[tag.priority].color
                                    }
                                  >
                                    {tag.priority}
                                  </span>
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {tag.pillar ? (
                                <Badge
                                  className={PILLAR_CONFIG[tag.pillar].bgColor}
                                >
                                  <span
                                    className={PILLAR_CONFIG[tag.pillar].color}
                                  >
                                    {tag.pillar}
                                  </span>
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {tag.assignedToUserName || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(tag.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className={getDaysOpenClass(daysOpen)}>
                              {tag.status !== "Closed" &&
                              tag.status !== "Completed"
                                ? `${daysOpen}d`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {tag.completedAt
                                ? new Date(tag.completedAt).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredTags.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="by-category" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {categoryChartData.map((cat) => (
                <Card key={cat.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-2xl font-bold">{cat.value}</p>
                      </div>
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${(cat.value / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {((cat.value / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Pillar Tab */}
          <TabsContent value="by-pillar" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillarChartData.map((pillar) => (
                <Card key={pillar.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${PILLAR_CONFIG[pillar.name].bgColor}`}
                      >
                        <span className={PILLAR_CONFIG[pillar.name].color}>
                          {pillar.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{pillar.name}</p>
                        <p className="text-2xl font-bold">{pillar.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aging Report Tab */}
          <TabsContent value="aging" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {agingData.map((bucket) => (
                    <div key={bucket.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{bucket.range}</span>
                        <span className="font-medium">{bucket.count} tags</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bucket.range === "30+ days"
                              ? "bg-red-500"
                              : "bg-orange-500"
                          }`}
                          style={{
                            width: `${(bucket.count / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {agingData.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No open tags to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
