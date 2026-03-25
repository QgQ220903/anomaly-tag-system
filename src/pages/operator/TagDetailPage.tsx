// src/pages/operator/TagDetailPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { mockTags, mockUsers } from "@/lib/mockData";
import { PRIORITY_CONFIG, STATUS_CONFIG, PILLAR_CONFIG } from "@/types";

// Mock status history data
const getMockStatusHistory = () => {
  return [
    {
      id: "1",
      status: "Closed",
      changedBy: "Sarah Smith",
      changedAt: "2026-03-21T15:30:00",
      comment: "Verified resolution. Machine operating normally.",
    },
    {
      id: "2",
      status: "Completed",
      changedBy: "Mike Maintenance",
      changedAt: "2026-03-21T14:00:00",
      comment: "Replaced faulty sensor. Tested and working.",
    },
    {
      id: "3",
      status: "In Progress",
      changedBy: "Mike Maintenance",
      changedAt: "2026-03-21T10:30:00",
      comment: "Inspected machine, found sensor issue. Ordering replacement.",
    },
    {
      id: "4",
      status: "Open",
      changedBy: "John Operator",
      changedAt: "2026-03-21T08:30:00",
      comment: "Initial report",
    },
  ];
};

// Mock supervisor notes
const getSupervisorNote = () => {
  return {
    hasNote: true,
    comment:
      "Critical issue - please prioritize. Machine downtime affecting production line.",
  };
};

export const TagDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tag = mockTags.find((t) => t.id === id);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">Tag not found</p>
        <Button onClick={() => navigate("/my-tags")} className="mt-4">
          Back to My Tags
        </Button>
      </div>
    );
  }

  const statusHistory = getMockStatusHistory();
  const supervisorNote = getSupervisorNote();
  const reporter = mockUsers.find((u) => u.id === tag.createdBy);
  const assignee = mockUsers.find((u) => u.id === tag.assignedTo);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-500";
      case "In Progress":
        return "bg-purple-500";
      case "Pending Parts":
        return "bg-yellow-500";
      case "Completed":
        return "bg-green-500";
      case "Closed":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // const getRelativeTime = (dateString: string) => {
  //     const date = new Date(dateString);
  //     const now = new Date();
  //     const diffMs = now.getTime() - date.getTime();
  //     const diffMins = Math.floor(diffMs / 60000);
  //     const diffHours = Math.floor(diffMs / 3600000);
  //     const diffDays = Math.floor(diffMs / 86400000);

  //     if (diffMins < 1) return 'Just now';
  //     if (diffMins < 60) return `${diffMins} minutes ago`;
  //     if (diffHours < 24) return `${diffHours} hours ago`;
  //     if (diffDays === 1) return 'Yesterday';
  //     return `${diffDays} days ago`;
  // };

  const getSLAInfo = () => {
    const isResolved = tag.status === "Closed" || tag.status === "Completed";

    if (isResolved && tag.completedAt) {
      const created = new Date(tag.createdAt);
      const completed = new Date(tag.completedAt);
      const resolutionHours = Math.ceil(
        (completed.getTime() - created.getTime()) / (1000 * 60 * 60),
      );
      const slaHours = tag.priority ? PRIORITY_CONFIG[tag.priority].sla : 72;
      const isWithinSLA = resolutionHours <= slaHours;

      return {
        type: "resolved",
        icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        title: "Resolution Time",
        value: `${resolutionHours} hours`,
        subtext: isWithinSLA
          ? `✓ Within SLA (${slaHours}h target)`
          : `⚠ Exceeded SLA (${slaHours}h target)`,
        subtextColor: isWithinSLA ? "text-green-600" : "text-red-600",
      };
    }

    if (!tag.priority) {
      return {
        type: "pending",
        icon: Clock,
        iconColor: "text-gray-400",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        title: "SLA Status",
        value: "Pending Priority",
        subtext: "Waiting for supervisor assignment",
        subtextColor: "text-gray-500",
      };
    }

    const created = new Date(tag.createdAt);
    const now = new Date();
    const elapsedHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const slaHours = PRIORITY_CONFIG[tag.priority].sla;
    const remainingHours = Math.max(0, slaHours - elapsedHours);
    const isOverdue = elapsedHours > slaHours;

    if (isOverdue) {
      const overdueHours = Math.floor(elapsedHours - slaHours);
      return {
        type: "overdue",
        icon: AlertCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        title: "SLA Status",
        value: `OVERDUE by ${overdueHours}h`,
        subtext: `Should be resolved within ${slaHours}h`,
        subtextColor: "text-red-500",
      };
    }

    return {
      type: "active",
      icon: Clock,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      title: "SLA Status",
      value: `${Math.floor(remainingHours)}h ${Math.floor((remainingHours % 1) * 60)}m remaining`,
      subtext: `Target: ${slaHours}h from creation`,
      subtextColor: "text-gray-500",
    };
  };

  const slaInfo = getSLAInfo();

  // Mock photos for demo
  const mockPhotos = [
    "https://picsum.photos/id/20/400/300",
    "https://picsum.photos/id/21/400/300",
    "https://picsum.photos/id/22/400/300",
    "https://picsum.photos/id/23/400/300",
  ];

  const hasPhotos = mockPhotos.length > 0;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <Link to="/my-tags" className="hover:text-orange-500 transition-colors">
          My Tags
        </Link>
        <span>/</span>
        <span className="text-gray-400">{tag.tagId}</span>
      </nav>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="-ml-2 text-gray-600 hover:text-orange-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xl font-bold">
                      {tag.tagId}
                    </span>
                    <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                      <span className={STATUS_CONFIG[tag.status].color}>
                        {tag.status}
                      </span>
                    </Badge>
                    {tag.priority && (
                      <Badge className={PRIORITY_CONFIG[tag.priority].bgColor}>
                        <span className={PRIORITY_CONFIG[tag.priority].color}>
                          {tag.priority}
                        </span>
                      </Badge>
                    )}
                    {tag.pillar && (
                      <Badge className={PILLAR_CONFIG[tag.pillar].bgColor}>
                        <span className={PILLAR_CONFIG[tag.pillar].color}>
                          {tag.pillar}
                        </span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(tag.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>By {reporter?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{tag.description}</p>
            </CardContent>
          </Card>

          {/* Details Grid Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-sm font-medium">{tag.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Machine
                    </p>
                    <p className="text-sm font-medium">{tag.machineName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-sm font-medium">{tag.machineName}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Assigned To
                    </p>
                    <div className="flex items-center gap-2">
                      {assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Not yet assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Reported By
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {reporter ? getInitials(reporter.name) : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {reporter?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos Card */}
          {hasPhotos && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photos ({mockPhotos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mockPhotos.map((photo, index) => (
                    <Dialog
                      key={index}
                      open={photoDialogOpen && selectedPhotoIndex === index}
                      onOpenChange={(open) => {
                        setPhotoDialogOpen(open);
                        if (!open) setSelectedPhotoIndex(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <button
                          onClick={() => {
                            setSelectedPhotoIndex(index);
                            setPhotoDialogOpen(true);
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                        >
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
                        <div className="relative">
                          <img
                            src={mockPhotos[selectedPhotoIndex || 0]}
                            alt="Full size"
                            className="w-full h-auto max-h-[85vh] object-contain"
                          />
                          <button
                            onClick={() => setPhotoDialogOpen(false)}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          {mockPhotos.length > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setSelectedPhotoIndex((prev) =>
                                    prev !== null
                                      ? (prev - 1 + mockPhotos.length) %
                                        mockPhotos.length
                                      : 0,
                                  )
                                }
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedPhotoIndex((prev) =>
                                    prev !== null
                                      ? (prev + 1) % mockPhotos.length
                                      : 0,
                                  )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {selectedPhotoIndex !== null &&
                            `${selectedPhotoIndex + 1} / ${mockPhotos.length}`}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.map((entry) => (
                  <div key={entry.id} className="relative pl-8 pb-4 last:pb-0">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-1 w-5 h-5 rounded-full ${getStatusColor(entry.status)} ring-4 ring-white shadow-sm`}
                    />

                    {/* Content */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">
                          {entry.status}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          by {entry.changedBy}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(entry.changedAt)}
                      </span>
                    </div>
                    {entry.comment && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-4">
          {/* SLA Status Card - Full width, no internal padding */}
          <div
            className={`border ${slaInfo.borderColor} rounded-lg overflow-hidden`}
          >
            <div className={`${slaInfo.bgColor} py-3 px-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <slaInfo.icon className={`w-4 h-4 ${slaInfo.iconColor}`} />
                  <span className="text-xs font-medium text-gray-600">
                    {slaInfo.title}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${slaInfo.iconColor}`}>
                    {slaInfo.value}
                  </span>
                  <p className={`text-xs ${slaInfo.subtextColor}`}>
                    {slaInfo.subtext}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor Note Card - Full width */}
          {supervisorNote.hasNote && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
              <div className="py-3 px-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-700">
                      Supervisor Note
                    </p>
                    <p className="text-sm text-blue-900 mt-0.5">
                      {supervisorNote.comment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info Card - Full width */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="py-3 px-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold">Quick Info</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="py-2.5 px-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                  <span className={STATUS_CONFIG[tag.status].color}>
                    {tag.status}
                  </span>
                </Badge>
              </div>
              <div className="py-2.5 px-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority</span>
                {tag.priority ? (
                  <Badge className={PRIORITY_CONFIG[tag.priority].bgColor}>
                    <span className={PRIORITY_CONFIG[tag.priority].color}>
                      {tag.priority}
                    </span>
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not set</span>
                )}
              </div>
              <div className="py-2.5 px-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Pillar</span>
                {tag.pillar ? (
                  <Badge className={PILLAR_CONFIG[tag.pillar].bgColor}>
                    <span className={PILLAR_CONFIG[tag.pillar].color}>
                      {tag.pillar}
                    </span>
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not set</span>
                )}
              </div>
              <div className="py-2.5 px-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Days Open</span>
                <span className="text-sm font-medium">
                  {Math.ceil(
                    (new Date().getTime() - new Date(tag.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            </div>
          </div>

          {/* Info Note - Full width */}
          <div className="bg-gray-50 rounded-lg py-3 px-4 text-center">
            <p className="text-xs text-gray-500">
              Your supervisor will review and assign this tag for resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagDetailPage;
