// src/pages/supervisor/PendingQueue.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  AlertCircle,
  User,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockTags, mockUsers } from "@/lib/mockData";

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const PendingQueue: React.FC = () => {
  const navigate = useNavigate();

  // Get tags that need assignment (no priority OR no assignee)
  const pendingTags = useMemo(() => {
    return mockTags.filter((tag) => !tag.priority || !tag.assignedTo);
  }, []);

  // Stats
  const unassignedCount = pendingTags.filter((t) => !t.assignedTo).length;
  const waitingOver1Hour = pendingTags.filter((t) => {
    const created = new Date(t.createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours > 1 && (!t.priority || !t.assignedTo);
  }).length;
  const waitingOver4Hours = pendingTags.filter((t) => {
    const created = new Date(t.createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours > 4 && (!t.priority || !t.assignedTo);
  }).length;

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest">("oldest");
  const [reporterFilter, setReporterFilter] = useState<string>("all");

  // Get unique reporters from pending tags
  const reporters = useMemo(() => {
    const reporterIds = new Set(pendingTags.map((t) => t.createdBy));
    return mockUsers.filter((u) => reporterIds.has(u.id));
  }, [pendingTags]);

  // Filter and sort pending tags
  const filteredTags = useMemo(() => {
    let filtered = pendingTags;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tag) =>
          tag.tagId.toLowerCase().includes(term) ||
          tag.description.toLowerCase().includes(term) ||
          tag.machineName?.toLowerCase().includes(term),
      );
    }

    // Reporter filter
    if (reporterFilter !== "all") {
      filtered = filtered.filter((tag) => tag.createdBy === reporterFilter);
    }

    // Sort by created time
    filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return filtered;
  }, [pendingTags, searchTerm, sortOrder, reporterFilter]);

  const getTimeSince = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return { text: `${diffMinutes}m ago`, level: "normal" };
    } else if (diffHours < 4) {
      return {
        text: `${Math.floor(diffHours)}h ${Math.floor(diffMinutes % 60)}m ago — Getting urgent`,
        level: "urgent",
      };
    } else {
      return {
        text: `${Math.floor(diffHours)}h ${Math.floor(diffMinutes % 60)}m ago — URGENT`,
        level: "critical",
      };
    }
  };

  const getCardBorderClass = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (diffHours > 4) return "border-l-4 border-red-400 bg-red-50/20";
    if (diffHours > 1) return "border-l-4 border-amber-400 bg-amber-50/30";
    return "border-l-4 border-gray-200";
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
            <span className="text-gray-400">Pending Assignment</span>
          </nav>
          <h1 className="text-2xl font-bold">Pending Assignment</h1>
          <p className="text-gray-500 mt-1">
            Tags waiting for priority setting and assignment
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {unassignedCount}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total unassigned</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-400">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-700">
                    {waitingOver1Hour}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">Getting urgent</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-400">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-700">
                    {waitingOver4Hours}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Escalation triggered
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
              {/* Search - chiếm phần lớn không gian trên desktop */}
              <div className="flex-1 w-full lg:w-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by Tag ID, description, machine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Sort Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  Sort by:
                </span>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSortOrder("oldest")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                      sortOrder === "oldest"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    onClick={() => setSortOrder("newest")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                      sortOrder === "newest"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Newest First
                  </button>
                </div>
              </div>

              {/* Reporter Filter */}
              <div className="w-full lg:w-56 shrink-0">
                <Select
                  value={reporterFilter}
                  onValueChange={setReporterFilter}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Reported By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reporters</SelectItem>
                    {reporters.map((reporter) => (
                      <SelectItem key={reporter.id} value={reporter.id}>
                        {reporter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags Cards */}
        <div className="space-y-3">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => {
              const timeSince = getTimeSince(tag.createdAt);
              const reporter = mockUsers.find((u) => u.id === tag.createdBy);
              const cardBorderClass = getCardBorderClass(tag.createdAt);

              return (
                <Card
                  key={tag.id}
                  className={`hover:shadow-md transition-shadow ${cardBorderClass}`}
                >
                  <CardContent className="p-5">
                    {/* Row 1: Tag ID and Time */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-700">
                        {tag.tagId}
                      </span>
                      <span
                        className={`text-xs ${
                          timeSince.level === "critical"
                            ? "text-red-600 font-semibold"
                            : timeSince.level === "urgent"
                              ? "text-amber-600 font-medium"
                              : "text-gray-400"
                        }`}
                      >
                        {timeSince.text}
                      </span>
                    </div>

                    {/* Row 2: Category and Machine */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{tag.categoryName}</span>
                      <span>•</span>
                      <span>{tag.machineName}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {tag.description}
                    </p>

                    {/* Reporter Row */}
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-200">
                          {reporter ? getInitials(reporter.name) : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        Reported by {reporter?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {reporter?.department || ""}
                      </span>
                    </div>

                    {/* Action Row */}
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() =>
                              navigate(`/supervisor/tags/${tag.id}/assign`)
                            }
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Assign Now
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Set priority and assign to maintenance</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">No tags pending assignment</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
