// src/pages/supervisor/AssignTag.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Shield,
  Star,
  Truck,
  DollarSign,
  Heart,
  Leaf,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { mockTags, mockUsers } from "@/lib/mockData";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  PILLAR_CONFIG,
  type Priority,
  type Pillar,
} from "@/types";

// Priority card component
interface PriorityCardProps {
  priority: Priority;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}

const PriorityCard: React.FC<PriorityCardProps> = ({
  priority,
  selected,
  onSelect,
  icon,
}) => {
  const getColorClass = () => {
    switch (priority) {
      case "Critical":
        return "border-red-500 bg-red-50";
      case "High":
        return "border-orange-500 bg-orange-50";
      case "Medium":
        return "border-amber-500 bg-amber-50";
      case "Low":
        return "border-blue-500 bg-blue-50";
      default:
        return "";
    }
  };

  const getTextColor = () => {
    switch (priority) {
      case "Critical":
        return "text-red-600";
      case "High":
        return "text-orange-600";
      case "Medium":
        return "text-amber-600";
      case "Low":
        return "text-blue-600";
      default:
        return "";
    }
  };

  const getSLA = () => {
    switch (priority) {
      case "Critical":
        return "24 hours";
      case "High":
        return "48 hours";
      case "Medium":
        return "72 hours";
      case "Low":
        return "120 hours";
      default:
        return "";
    }
  };

  const getBadgeColor = () => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      case "Low":
        return "bg-blue-100 text-blue-700";
      default:
        return "";
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
        selected
          ? getColorClass()
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={selected ? getTextColor() : "text-gray-400"}>
          {icon}
        </div>
        <span
          className={`font-bold text-sm ${selected ? getTextColor() : "text-gray-700"}`}
        >
          {priority}
        </span>
        <span className="text-xs text-gray-500">Resolve within {getSLA()}</span>
        <Badge className={`${getBadgeColor()} text-xs rounded px-2`}>
          SLA: {getSLA()}
        </Badge>
      </div>
    </button>
  );
};

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper to get workload color
const getWorkloadColor = (activeTasks: number) => {
  if (activeTasks <= 2) return "text-green-600";
  if (activeTasks <= 4) return "text-amber-600";
  return "text-red-600";
};

export const AssignTag: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tag = mockTags.find((t) => t.id === id);

  // Form states
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(
    null,
  );
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [instructions, setInstructions] = useState("");

  // Assignee search states
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Photo dialog states
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

  // Close assignee dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assigneeRef.current &&
        !assigneeRef.current.contains(event.target as Node)
      ) {
        setAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">Tag not found</p>
        <Button onClick={() => navigate("/supervisor/tags")} className="mt-4">
          Back to Tags
        </Button>
      </div>
    );
  }

  const maintenanceUsers = mockUsers.filter(
    (u) => u.role === "Maintenance Supervisor",
  );
  const reporter = mockUsers.find((u) => u.id === tag.createdBy);

  // Filtered assignees based on search
  const filteredAssignees = useMemo(() => {
    if (!assigneeSearch.trim()) return maintenanceUsers;
    const term = assigneeSearch.toLowerCase();
    return maintenanceUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term),
    );
  }, [maintenanceUsers, assigneeSearch]);

  // Mock workload data for maintenance users
  const getUserWorkload = (userId: string) => {
    const userTags = mockTags.filter(
      (t) =>
        t.assignedTo === userId &&
        t.status !== "Closed" &&
        t.status !== "Completed",
    );
    return userTags.length;
  };

  // Mock photos for demo
  const mockPhotos = [
    "https://picsum.photos/id/20/400/300",
    "https://picsum.photos/id/21/400/300",
    "https://picsum.photos/id/22/400/300",
    "https://picsum.photos/id/23/400/300",
  ];
  const hasPhotos = mockPhotos.length > 0;

  const isValid = selectedPriority && selectedPillar && selectedAssignee;
  const canAssign = isValid;

  const handleAssign = () => {
    if (canAssign) {
      alert(`Tag ${tag.tagId} assigned with:
- Priority: ${selectedPriority}
- Pillar: ${selectedPillar}
- Assigned to: ${maintenanceUsers.find((u) => u.id === selectedAssignee)?.name}
- Instructions: ${instructions || "None"}`);
      navigate("/supervisor/tags");
    }
  };

  // const getPillarIcon = (pillar: Pillar) => {
  //   switch (pillar) {
  //     case 'Safety': return <Shield className="w-4 h-4" />;
  //     case 'Quality': return <Star className="w-4 h-4" />;
  //     case 'Delivery': return <Truck className="w-4 h-4" />;
  //     case 'Cost': return <DollarSign className="w-4 h-4" />;
  //     case 'Morale': return <Heart className="w-4 h-4" />;
  //     case 'Environment': return <Leaf className="w-4 h-4" />;
  //     default: return null;
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusHistory = () => {
    const history = [
      {
        status: "Open",
        changedBy: tag.createdByUserName,
        changedAt: tag.createdAt,
        comment: "Initial report",
      },
    ];

    if (tag.assignedAt) {
      history.push({
        status: "Assigned",
        changedBy: "System",
        changedAt: tag.assignedAt,
        comment: `Assigned to ${tag.assignedToUserName}`,
      });
    }

    if (tag.resolution) {
      history.push({
        status: "Completed",
        changedBy: tag.resolution.resolvedBy,
        changedAt: tag.resolution.resolvedAt,
        comment: tag.resolution.actionTaken,
      });
    }

    return history;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/supervisor/dashboard"
          className="flex items-center gap-1 hover:text-orange-500"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <Link to="/supervisor/tags" className="hover:text-orange-500">
          Anomaly Tags
        </Link>
        <span>/</span>
        <span className="text-gray-400">{tag.tagId}</span>
        <span>/</span>
        <span className="text-gray-400">Assign & Prioritize</span>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Tag Detail (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tag Information Card */}
          <Card>
            <CardContent className="p-6">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
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
                </div>
                <span className="text-sm text-gray-500">
                  Created {formatDate(tag.createdAt)}
                </span>
              </div>

              {/* Reporter Row */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="w-8 h-8 bg-slate-700">
                  <AvatarFallback className="text-white text-xs">
                    {reporter ? getInitials(reporter.name) : "UN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    Reported by {reporter?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {reporter?.department || ""}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Category
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {tag.categoryName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Machine
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {tag.machineName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {tag.machineName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Current Pillar
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {tag.pillar ? (
                      <Badge className={PILLAR_CONFIG[tag.pillar].bgColor}>
                        <span className={PILLAR_CONFIG[tag.pillar].color}>
                          {tag.pillar}
                        </span>
                      </Badge>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {tag.description}
                </p>
              </div>

              {/* Photos Section */}
              {hasPhotos && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                    Photos ({mockPhotos.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getStatusHistory().map((entry, index) => (
                  <div key={index} className="relative pl-8 pb-4 last:pb-0">
                    <div
                      className={`absolute left-0 top-1 w-5 h-5 rounded-full ${
                        entry.status === "Open"
                          ? "bg-blue-500"
                          : entry.status === "Assigned"
                            ? "bg-purple-500"
                            : "bg-green-500"
                      } ring-4 ring-white shadow-sm`}
                    />
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

        {/* Right Column - Assign & Prioritize (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Assign & Prioritize</h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete all sections before assigning
              </p>

              {/* Section 1: Set Priority */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      1 / Set Priority
                    </span>
                    <span className="text-red-500 text-xs">*</span>
                  </div>
                  {selectedPriority && (
                    <button
                      onClick={() => setSelectedPriority(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PriorityCard
                    priority="Critical"
                    selected={selectedPriority === "Critical"}
                    onSelect={() => setSelectedPriority("Critical")}
                    icon={<AlertCircle className="w-6 h-6" />}
                  />
                  <PriorityCard
                    priority="High"
                    selected={selectedPriority === "High"}
                    onSelect={() => setSelectedPriority("High")}
                    icon={<AlertTriangle className="w-6 h-6" />}
                  />
                  <PriorityCard
                    priority="Medium"
                    selected={selectedPriority === "Medium"}
                    onSelect={() => setSelectedPriority("Medium")}
                    icon={<Clock className="w-6 h-6" />}
                  />
                  <PriorityCard
                    priority="Low"
                    selected={selectedPriority === "Low"}
                    onSelect={() => setSelectedPriority("Low")}
                    icon={<CheckCircle className="w-6 h-6" />}
                  />
                </div>
              </div>

              {/* Section 2: Operational Pillar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      2 / Operational Pillar
                    </span>
                    <span className="text-red-500 text-xs">*</span>
                  </div>
                  {selectedPillar && (
                    <button
                      onClick={() => setSelectedPillar(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Select
                  value={selectedPillar || ""}
                  onValueChange={(v) => setSelectedPillar(v as Pillar)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select pillar" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px]">
                    <SelectItem value="Safety">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        <span>Safety</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Quality">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span>Quality</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Delivery">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-500" />
                        <span>Delivery</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Cost">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <span>Cost</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Morale">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>Morale</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Environment">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span>Environment</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the primary operational pillar affected
                </p>
              </div>

              {/* Section 3: Assign To */}
              <div className="mt-6" ref={assigneeRef}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      3 / Assign To
                    </span>
                    <span className="text-red-500 text-xs">*</span>
                  </div>
                  {selectedAssignee && (
                    <button
                      onClick={() => setSelectedAssignee("")}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Searchable Assignee Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search maintenance supervisor..."
                      value={assigneeSearch}
                      onChange={(e) => setAssigneeSearch(e.target.value)}
                      onFocus={() => setAssigneeDropdownOpen(true)}
                      className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {assigneeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Filter by name..."
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredAssignees.map((user) => {
                          const workload = getUserWorkload(user.id);
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedAssignee(user.id);
                                setAssigneeDropdownOpen(false);
                                setAssigneeSearch("");
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                                selectedAssignee === user.id
                                  ? "bg-orange-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-sm bg-gray-200">
                                      {getInitials(user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {user.department}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      workload <= 2
                                        ? "bg-green-500"
                                        : workload <= 4
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${getWorkloadColor(workload)}`}
                                  >
                                    {workload} active{" "}
                                    {workload === 1 ? "task" : "tasks"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {filteredAssignees.length === 0 && (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            No maintenance supervisors found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected assignee display */}
                {selectedAssignee && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm bg-gray-300">
                          {getInitials(
                            maintenanceUsers.find(
                              (u) => u.id === selectedAssignee,
                            )?.name || "",
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {
                            maintenanceUsers.find(
                              (u) => u.id === selectedAssignee,
                            )?.name
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {
                            maintenanceUsers.find(
                              (u) => u.id === selectedAssignee,
                            )?.department
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAssignee("")}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Change
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Only Maintenance Supervisors can be assigned (BR-07)
                </p>
              </div>

              {/* Section 4: Instructions */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    4 / Instructions (optional)
                  </span>
                </div>
                <Textarea
                  placeholder="Add specific instructions, safety notes, or additional context for the maintenance team..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Alert when priority not selected */}
              {!selectedPriority && (
                <Alert
                  variant="destructive"
                  className="mt-6 animate-in fade-in-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>Priority Required</AlertTitle>
                  <AlertDescription>
                    Priority must be set before assigning to maintenance (BR-04)
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleAssign}
                disabled={!canAssign}
                className={`w-full mt-6 py-6 text-base font-medium ${
                  canAssign
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Tag
              </Button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Email notification will be sent to the assigned maintenance
                supervisor (BR-15)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
