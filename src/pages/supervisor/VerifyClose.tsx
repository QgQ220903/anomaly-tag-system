// src/pages/supervisor/VerifyClose.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  CheckCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Wrench,
  AlertTriangle,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to get relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

export const VerifyClose: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [closeComment, setCloseComment] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

  // Get completed tags (status = Completed)
  const completedTags = useMemo(() => {
    return mockTags.filter(
      (tag) => tag.status === "Completed" && tag.resolution,
    );
  }, []);

  // Filter tags
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return completedTags;
    const term = searchTerm.toLowerCase();
    return completedTags.filter(
      (tag) =>
        tag.tagId.toLowerCase().includes(term) ||
        tag.description.toLowerCase().includes(term) ||
        tag.machineName?.toLowerCase().includes(term) ||
        tag.categoryName?.toLowerCase().includes(term),
    );
  }, [completedTags, searchTerm]);

  const handleClose = (tag: any) => {
    setSelectedTag(tag);
    setCloseDialogOpen(true);
  };

  const handleReopen = (tag: any) => {
    setSelectedTag(tag);
    setReopenDialogOpen(true);
  };

  const confirmClose = () => {
    alert(
      `Tag ${selectedTag?.tagId} closed with comment: ${closeComment || "No comment"}`,
    );
    setCloseDialogOpen(false);
    setCloseComment("");
    setSelectedTag(null);
  };

  const confirmReopen = () => {
    alert(
      `Tag ${selectedTag?.tagId} reopened for rework. Reason: ${reopenReason}`,
    );
    setReopenDialogOpen(false);
    setReopenReason("");
    setSelectedTag(null);
  };

  const toggleExpand = (tagId: string) => {
    setExpandedTagId(expandedTagId === tagId ? null : tagId);
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
            <span className="text-gray-400">Verify & Close</span>
          </nav>
          <h1 className="text-2xl font-bold">Verify & Close</h1>
          <p className="text-gray-500 mt-1">
            Review completed work and confirm resolution
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="text-lg text-gray-600">
            <span className="font-semibold text-green-600">
              {completedTags.length}
            </span>{" "}
            tags awaiting your verification
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Tag ID, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tags Cards */}
        <div className="space-y-4">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => {
              const assignee = mockUsers.find((u) => u.id === tag.assignedTo);
              const resolution = tag.resolution;
              const isExpanded = expandedTagId === tag.id;

              return (
                <Card
                  key={tag.id}
                  className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    {/* Row 1: Tag ID and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          {tag.tagId}
                        </span>
                        <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                          <span className={STATUS_CONFIG[tag.status].color}>
                            {tag.status}
                          </span>
                        </Badge>
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
                      </div>
                      <span className="text-sm text-gray-500">
                        Completed{" "}
                        {getRelativeTime(tag.completedAt || tag.createdAt)}
                      </span>
                    </div>

                    {/* Row 2: Category and Machine */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{tag.categoryName}</span>
                      <span>•</span>
                      <span>{tag.machineName}</span>
                    </div>

                    {/* Completed By Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm bg-gray-200">
                          {assignee ? getInitials(assignee.name) : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Completed by {assignee?.name || "Unknown"}{" "}
                          (Maintenance)
                        </p>
                        <p className="text-xs text-gray-400">
                          {tag.completedAt
                            ? formatDate(tag.completedAt)
                            : "Date unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {tag.description}
                    </p>

                    {/* Collapsible Resolution Details */}
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() => toggleExpand(tag.id)}
                    >
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Hide Resolution Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                View Resolution Details
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="mt-3">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          {/* Action Taken */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Wrench className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Action Taken
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">
                              {resolution?.actionTaken}
                            </p>
                          </div>

                          {/* Parts Used */}
                          {resolution?.partsUsed && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Parts Used
                                </span>
                              </div>
                              <p className="text-sm text-gray-800">
                                {resolution.partsUsed}
                              </p>
                            </div>
                          )}

                          {/* Time Spent & Root Cause */}
                          <div className="grid grid-cols-2 gap-4">
                            {resolution?.timeSpent && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Time Spent
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">
                                  {resolution.timeSpent} hours
                                </p>
                              </div>
                            )}
                            {resolution?.rootCause && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Root Cause
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">
                                  {resolution.rootCause}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Resolved By */}
                          {resolution?.resolvedBy && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Resolved By
                                </span>
                              </div>
                              <p className="text-sm text-gray-800">
                                {mockUsers.find(
                                  (u) => u.id === resolution.resolvedBy,
                                )?.name || resolution.resolvedBy}
                              </p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReopen(tag)}
                            className="text-gray-500 hover:text-amber-600"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reopen for Rework
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reopen tag if resolution is not satisfactory</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleClose(tag)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Close Tag
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Confirm resolution and close tag</p>
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
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">
                    No completed tags awaiting verification
                  </p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/supervisor/tags")}
                    className="text-orange-500 mt-2"
                  >
                    View all tags →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Close Tag Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close {selectedTag?.tagId}?</DialogTitle>
            <DialogDescription>
              Confirm that the issue has been fully resolved and the production
              area is back to normal operation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="close-comment" className="text-sm font-medium">
                Closing comment (optional)
              </Label>
              <Textarea
                id="close-comment"
                placeholder="Add any final notes before closing..."
                value={closeComment}
                onChange={(e) => setCloseComment(e.target.value)}
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmClose}
              className="bg-green-500 hover:bg-green-600"
            >
              Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Dialog */}
      <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reopen {selectedTag?.tagId} for Rework?</DialogTitle>
            <DialogDescription>
              The maintenance supervisor will be notified automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reopen-reason" className="text-sm font-medium">
                Reason for reopening <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reopen-reason"
                placeholder="Describe why this resolution is not satisfactory..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={3}
                className="mt-1 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maintenance supervisor will be notified automatically
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReopenDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReopen}
              disabled={!reopenReason.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
            >
              Reopen Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

// Import missing components
import { Label } from "@/components/ui/label";
