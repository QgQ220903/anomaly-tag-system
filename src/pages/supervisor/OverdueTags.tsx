// src/pages/supervisor/OverdueTags.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  AlertCircle,
  Clock,
  Search,
  RotateCcw,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockTags, mockUsers } from "@/lib/mockData";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper to get SLA days
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

// Helper to get overdue info
const getOverdueInfo = (createdAt: string, priority?: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const slaHours = priority ? getSLADays(priority) * 24 : 72 * 24;
  const overdueHours = Math.floor(diffHours - slaHours);
  const overdueDays = Math.floor(overdueHours / 24);
  const remainingHours = overdueHours % 24;

  if (overdueDays > 0) {
    return { text: `${overdueDays}d ${remainingHours}h`, hours: overdueHours };
  }
  return { text: `${overdueHours}h`, hours: overdueHours };
};

export const OverdueTags: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Get overdue tags (tags that have exceeded SLA)
  const overdueTags = useMemo(() => {
    return mockTags.filter((tag) => {
      if (tag.status === "Closed" || tag.status === "Completed") return false;
      if (!tag.priority) return false;

      const created = new Date(tag.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      const slaHours = getSLADays(tag.priority) * 24;

      return diffHours > slaHours;
    });
  }, []);

  // Filtered tags
  const filteredTags = useMemo(() => {
    let filtered = overdueTags;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tag) =>
          tag.tagId.toLowerCase().includes(term) ||
          tag.description.toLowerCase().includes(term) ||
          tag.machineName?.toLowerCase().includes(term),
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((tag) => tag.priority === priorityFilter);
    }

    // Sort by overdue severity (most overdue first)
    return filtered.sort((a, b) => {
      const aCreated = new Date(a.createdAt);
      const bCreated = new Date(b.createdAt);
      const aSla = getSLADays(a.priority) * 24;
      const bSla = getSLADays(b.priority) * 24;
      const aOverdue =
        (new Date().getTime() - aCreated.getTime()) / (1000 * 60 * 60) - aSla;
      const bOverdue =
        (new Date().getTime() - bCreated.getTime()) / (1000 * 60 * 60) - bSla;
      return bOverdue - aOverdue;
    });
  }, [overdueTags, searchTerm, priorityFilter]);

  // Stats by priority
  const criticalOverdue = overdueTags.filter(
    (t) => t.priority === "Critical",
  ).length;
  const highOverdue = overdueTags.filter((t) => t.priority === "High").length;
  const mediumOverdue = overdueTags.filter(
    (t) => t.priority === "Medium",
  ).length;
  const lowOverdue = overdueTags.filter((t) => t.priority === "Low").length;

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "border-l-4 border-red-600 bg-red-50/40";
      case "High":
        return "border-l-4 border-orange-500 bg-orange-50/20";
      default:
        return "border-l-4 border-amber-500";
    }
  };

  const getEscalationInfo = (createdAt: string, priority?: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (priority === "Critical") {
      if (diffHours > 24)
        return { level: "plant_manager", text: "Escalated to Plant Manager" };
      if (diffHours > 4)
        return {
          level: "maintenance_manager",
          text: "Escalated to Maintenance Manager",
        };
      if (diffHours > 1)
        return {
          level: "production_manager",
          text: "Escalated to Production Manager",
        };
    } else if (priority === "High") {
      if (diffHours > 48)
        return { level: "plant_manager", text: "Escalated to Plant Manager" };
      if (diffHours > 4)
        return {
          level: "maintenance_manager",
          text: "Escalated to Maintenance Manager",
        };
    } else {
      if (diffHours > 72)
        return { level: "plant_manager", text: "Escalated to Plant Manager" };
    }
    return null;
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
            <span className="text-gray-400">Overdue Tags</span>
          </nav>
          <h1 className="text-2xl font-bold">Overdue Tags</h1>
          <p className="text-gray-500 mt-1">
            Tags that have exceeded their SLA timeframe
          </p>
        </div>

        {/* Alert Banner */}
        {overdueTags.length > 0 && (
          <div className="bg-amber-500 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">
                {overdueTags.length} tag
                {overdueTags.length !== 1 ? "s are" : " is"} overdue — immediate
                action required
              </span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80 hover:bg-white/20"
            >
              View Escalation Policy →
            </Button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPriorityFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Overdue ({overdueTags.length})
          </button>
          <button
            onClick={() => setPriorityFilter("Critical")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === "Critical"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            Critical ({criticalOverdue})
          </button>
          <button
            onClick={() => setPriorityFilter("High")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === "High"
                ? "bg-orange-600 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
          >
            High ({highOverdue})
          </button>
          <button
            onClick={() => setPriorityFilter("Medium")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === "Medium"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Medium ({mediumOverdue})
          </button>
          <button
            onClick={() => setPriorityFilter("Low")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              priorityFilter === "Low"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Low ({lowOverdue})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by Tag ID, description, machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Tags Cards */}
        <div className="space-y-3">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => {
              const overdueInfo = getOverdueInfo(tag.createdAt, tag.priority);
              const slaDays = getSLADays(tag.priority);
              const created = new Date(tag.createdAt);
              const now = new Date();
              const diffHours =
                (now.getTime() - created.getTime()) / (1000 * 60 * 60);
              const slaHours = slaDays * 24;
              const exceededHours = Math.floor(diffHours - slaHours);
              // const reporter = mockUsers.find(u => u.id === tag.createdBy);
              const assignee = mockUsers.find((u) => u.id === tag.assignedTo);
              const escalationInfo = getEscalationInfo(
                tag.createdAt,
                tag.priority,
              );

              return (
                <Card
                  key={tag.id}
                  className={`hover:shadow-md transition-shadow ${getPriorityBadgeClass(tag.priority || "")}`}
                >
                  <CardContent className="p-5">
                    {/* Row 1: Tag ID and Priority Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          {tag.tagId}
                        </span>
                        <Badge
                          className={PRIORITY_CONFIG[tag.priority!].bgColor}
                        >
                          <span
                            className={PRIORITY_CONFIG[tag.priority!].color}
                          >
                            {tag.priority}
                          </span>
                        </Badge>
                      </div>
                      <Badge className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-semibold">
                        OVERDUE by {overdueInfo.text}
                      </Badge>
                    </div>

                    {/* Row 2: Category and Machine */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{tag.categoryName}</span>
                      <span>•</span>
                      <span>{tag.machineName}</span>
                    </div>

                    {/* SLA Exceeded Info */}
                    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Original SLA: {slaDays} day{slaDays !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-red-600 font-semibold">
                        Exceeded by:{" "}
                        {exceededHours > 24
                          ? `${Math.floor(exceededHours / 24)}d ${exceededHours % 24}h`
                          : `${exceededHours}h`}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {tag.description}
                    </p>

                    {/* Assigned To Row */}
                    <div className="flex items-center gap-2 mb-3">
                      {assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gray-200">
                              {getInitials(assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">
                            Assigned to {assignee.name}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-amber-600 font-medium">
                            ⚠ Not yet assigned
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Escalation Info */}
                    {escalationInfo && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {escalationInfo.text}
                        </span>
                        <Clock className="w-3 h-3 text-gray-400 ml-auto" />
                        <span className="text-xs text-gray-400">
                          {new Date(tag.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                        <span className={STATUS_CONFIG[tag.status].color}>
                          {tag.status}
                        </span>
                      </Badge>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/supervisor/tags/${tag.id}/assign`)
                              }
                              className="text-gray-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Reassign
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reassign to another maintenance team</p>
                          </TooltipContent>
                        </Tooltip>

                        {tag.priority === "Critical" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() =>
                                  alert(
                                    `Escalate ${tag.tagId} to Plant Manager`,
                                  )
                                }
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Escalate
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Escalate to Plant Manager (Section 8.2)</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">
                    No overdue tags!
                  </h3>
                  <p className="text-gray-500">
                    All tags are within their SLA timeframe
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

// Import CheckCircle for empty state
import { CheckCircle } from "lucide-react";
