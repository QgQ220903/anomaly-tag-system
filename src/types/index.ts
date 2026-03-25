// src/types/index.ts
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'In Progress' | 'Pending Parts' | 'Completed' | 'Closed';
export type Pillar = 'Safety' | 'Quality' | 'Delivery' | 'Cost' | 'Morale' | 'Environment';
export type UserRole = 'Operator' | 'Production Supervisor' | 'Maintenance Supervisor' | 'Quality Coordinator' | 'Continuous Improvement' | 'Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  examples?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  department: string;
  status?: 'active' | 'inactive';
}

export interface AnomalyTag {
  id: string;
  tagId: string;
  category: string;
  categoryName?: string;
  machineId: string;
  machineName?: string;
  description: string;
  priority?: Priority;
  status: Status;
  pillar?: Pillar;
  createdBy: string;
  createdByUserName: string;
  createdAt: string;
  assignedTo?: string;
  assignedToUserName?: string;
  assignedAt?: string;
  completedAt?: string;
  closedAt?: string;
  photos?: string[];
  resolution?: ResolutionDetails;
  statusHistory?: StatusHistory[];
}

export interface ResolutionDetails {
  actionTaken: string;
  partsUsed?: string;
  timeSpent?: number;
  rootCause?: string;
  resolvedBy: string;
  resolvedAt: string;
  comments?: string;
}

export interface StatusHistory {
  id: string;
  previousStatus: Status;
  newStatus: Status;
  changedBy: string;
  changedAt: string;
  comments?: string;
}

export const PRIORITY_CONFIG: Record<Priority, { color: string; bgColor: string; label: string; sla: number }> = {
  Critical: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Critical', sla: 24 },
  High: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'High', sla: 48 },
  Medium: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Medium', sla: 72 },
  Low: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Low', sla: 120 },
};

export const STATUS_CONFIG: Record<Status, { color: string; bgColor: string; label: string }> = {
  Open: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Open' },
  'In Progress': { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'In Progress' },
  'Pending Parts': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Pending Parts' },
  Completed: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Completed' },
  Closed: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Closed' },
};

export const PILLAR_CONFIG: Record<Pillar, { color: string; bgColor: string }> = {
  Safety: { color: 'text-red-700', bgColor: 'bg-red-100' },
  Quality: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  Delivery: { color: 'text-green-700', bgColor: 'bg-green-100' },
  Cost: { color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  Morale: { color: 'text-purple-700', bgColor: 'bg-purple-100' },
  Environment: { color: 'text-teal-700', bgColor: 'bg-teal-100' },
};