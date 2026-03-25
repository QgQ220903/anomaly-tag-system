// src/components/layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  BarChart3,
  Database,
  Users,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  currentRole: string;
}

const getNavItems = (role: string) => {
  // Role-specific navigation
  const roleNav: Record<
    string,
    Array<{ path: string; icon: any; label: string }>
  > = {
    Operator: [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/create-tag", icon: FileText, label: "Create Tag" },
      { path: "/my-tags", icon: ListTodo, label: "My Tags" },
    ],
    "Production Supervisor": [
      {
        path: "/supervisor/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      { path: "/supervisor/tags", icon: ClipboardList, label: "All Tags" },
      {
        path: "/supervisor/pending",
        icon: UserCheck,
        label: "Pending Assignment",
      },
      {
        path: "/supervisor/overdue",
        icon: AlertTriangle,
        label: "Overdue Tags",
      },
      {
        path: "/supervisor/verify",
        icon: CheckCircle,
        label: "Verify & Close",
      },
      { path: "/supervisor/reports", icon: BarChart3, label: "Reports" },
    ],
    "Maintenance Supervisor": [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/assigned-tags", icon: ListTodo, label: "Assigned Tags" },
      { path: "/completed-tags", icon: CheckCircle, label: "Completed" },
    ],
    "Quality Coordinator": [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/tags", icon: ClipboardList, label: "All Tags" },
      { path: "/reports/quality", icon: BarChart3, label: "Quality Reports" },
    ],
    "Continuous Improvement": [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/tags", icon: ClipboardList, label: "All Tags" },
      { path: "/reports", icon: BarChart3, label: "Analytics" },
    ],
    Administrator: [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/tags", icon: ClipboardList, label: "All Tags" },
      { path: "/master-data", icon: Database, label: "Master Data" },
      { path: "/users", icon: Users, label: "Users" },
      { path: "/reports", icon: BarChart3, label: "Reports" },
    ],
  };

  return roleNav[role] || roleNav.Operator;
};

const roleBadgeColors: Record<string, string> = {
  Operator: "bg-blue-100 text-blue-700",
  "Production Supervisor": "bg-purple-100 text-purple-700",
  "Maintenance Supervisor": "bg-orange-100 text-orange-700",
  "Quality Coordinator": "bg-green-100 text-green-700",
  "Continuous Improvement": "bg-teal-100 text-teal-700",
  Administrator: "bg-gray-100 text-gray-700",
};

const userNames: Record<string, { name: string; initials: string }> = {
  Operator: { name: "John Operator", initials: "JO" },
  "Production Supervisor": { name: "Ana Silva", initials: "AS" },
  "Maintenance Supervisor": { name: "Mike Maintenance", initials: "MM" },
  "Quality Coordinator": { name: "Lisa Quality", initials: "LQ" },
  "Continuous Improvement": { name: "Tom CI", initials: "TC" },
  Administrator: { name: "Admin User", initials: "AD" },
};

export const Sidebar: React.FC<SidebarProps> = ({ currentRole }) => {
  const navItems = getNavItems(currentRole);
  const userInfo = userNames[currentRole] || {
    name: "Demo User",
    initials: "DU",
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold">Anomaly Tag System</h1>
        <div className="mt-2">
          <Badge className={roleBadgeColors[currentRole]}>{currentRole}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-sidebar-border/50">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userInfo.initials}
          </div>
          <div className="text-sm">
            <p className="font-medium text-sidebar-foreground">
              {userInfo.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{currentRole}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
        <p>Version 1.0</p>
        <p>© 2026 Anomaly Tag System</p>
      </div>
    </aside>
  );
};
