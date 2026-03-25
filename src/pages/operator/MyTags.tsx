// src/pages/operator/MyTags.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockTags } from "@/lib/mockData";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";

interface FilterType {
  id: string;
  label: string;
  count: number;
  status: string | null;
}

export const MyTags: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get tags created by current user (operator with id '1')
  const myTags = mockTags.filter((tag) => tag.createdBy === "1");

  // Calculate counts for filters
  const filters: FilterType[] = [
    { id: "all", label: "All", count: myTags.length, status: null },
    {
      id: "open",
      label: "Open",
      count: myTags.filter((t) => t.status === "Open").length,
      status: "Open",
    },
    {
      id: "in-progress",
      label: "In Progress",
      count: myTags.filter((t) => t.status === "In Progress").length,
      status: "In Progress",
    },
    {
      id: "pending-parts",
      label: "Pending Parts",
      count: myTags.filter((t) => t.status === "Pending Parts").length,
      status: "Pending Parts",
    },
    {
      id: "completed",
      label: "Completed",
      count: myTags.filter((t) => t.status === "Completed").length,
      status: "Completed",
    },
    {
      id: "closed",
      label: "Closed",
      count: myTags.filter((t) => t.status === "Closed").length,
      status: "Closed",
    },
  ];

  // Filter tags based on search and status filter
  const filteredTags = useMemo(() => {
    let filtered = myTags;

    // Apply status filter
    const selectedFilter = filters.find((f) => f.id === activeFilter);
    if (selectedFilter && selectedFilter.status) {
      filtered = filtered.filter((tag) => tag.status === selectedFilter.status);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tag) =>
          tag.tagId.toLowerCase().includes(term) ||
          (tag.categoryName && tag.categoryName.toLowerCase().includes(term)) ||
          (tag.machineName && tag.machineName.toLowerCase().includes(term)) ||
          tag.description.toLowerCase().includes(term),
      );
    }

    // Sort by created date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [myTags, activeFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getDaysOpen = (createdAt: string, status: string) => {
    if (status === "Closed" || status === "Completed") return null;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSLADays = (priority?: string) => {
    switch (priority) {
      case "Critical":
        return 1;
      case "High":
        return 2;
      case "Medium":
        return 3;
      case "Low":
        return 5;
      default:
        return 99;
    }
  };

  const isOverdue = (createdAt: string, priority?: string, status?: string) => {
    if (status === "Closed" || status === "Completed") return false;
    const daysOpen = getDaysOpen(createdAt, status || "");
    const slaDays = getSLADays(priority);
    return daysOpen !== null && daysOpen > slaDays;
  };

  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-orange-500 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-gray-400">My Tags</span>
      </nav>

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Tag ID, category, machine..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm font-medium text-gray-600">
                  <th className="px-4 py-3">Tag ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Machine</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Days Open</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTags.length > 0 ? (
                  paginatedTags.map((tag) => {
                    const daysOpen = getDaysOpen(tag.createdAt, tag.status);
                    const overdue = isOverdue(
                      tag.createdAt,
                      tag.priority,
                      tag.status,
                    );
                    const slaDays = getSLADays(tag.priority);

                    return (
                      <tr
                        key={tag.id}
                        onClick={() => navigate(`/tag/${tag.id}`)}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-orange-600 hover:text-orange-700 font-medium">
                            {tag.tagId}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tag.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tag.machineName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {truncateDescription(tag.description, 60)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                            <span className={STATUS_CONFIG[tag.status].color}>
                              {tag.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {tag.priority && (
                            <Badge
                              className={PRIORITY_CONFIG[tag.priority].bgColor}
                            >
                              <span
                                className={PRIORITY_CONFIG[tag.priority].color}
                              >
                                {tag.priority}
                              </span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {getRelativeTime(tag.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {daysOpen !== null ? (
                            <span
                              className={`text-sm font-medium ${overdue ? "text-red-500" : "text-gray-600"}`}
                            >
                              {daysOpen} {daysOpen === 1 ? "day" : "days"}
                              {overdue && ` (SLA: ${slaDays}d)`}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tag/${tag.id}`);
                            }}
                            className="text-gray-500 hover:text-orange-500"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No tags found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm
                            ? "Try a different search term"
                            : "Create your first anomaly tag"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTags.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredTags.length)} of{" "}
                {filteredTags.length} tags
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
