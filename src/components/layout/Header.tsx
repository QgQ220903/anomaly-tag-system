// src/components/layout/Header.tsx
import React from "react";
import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  currentRole: string;
}

// Role badge colors
const roleBadgeColors: Record<string, string> = {
  Operator: "bg-blue-100 text-blue-700",
  "Production Supervisor": "bg-purple-100 text-purple-700",
  "Maintenance Supervisor": "bg-orange-100 text-orange-700",
  "Quality Coordinator": "bg-green-100 text-green-700",
  "Continuous Improvement": "bg-teal-100 text-teal-700",
  Administrator: "bg-gray-100 text-gray-700",
};

export const Header: React.FC<HeaderProps> = ({ currentRole }) => {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {getPageTitle()}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium">{getUserName(currentRole)}</p>
            <Badge className={`${roleBadgeColors[currentRole]} text-xs mt-0.5`}>
              {currentRole}
            </Badge>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials(currentRole)}
          </div>
        </div>
      </div>
    </header>
  );
};

function getPageTitle() {
  const path = window.location.pathname;
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/create-tag": "Create New Anomaly Tag",
    "/my-tags": "My Tags",
    "/supervisor/dashboard": "Supervisor Dashboard",
    "/supervisor/tags": "All Anomaly Tags",
    "/supervisor/pending": "Pending Assignment",
    "/supervisor/overdue": "Overdue Tags",
    "/assigned-tags": "Assigned Tags",
    "/reports": "Reports & Analytics",
    "/master-data": "Master Data Management",
    "/users": "User Management",
  };
  return titles[path] || "Anomaly Tag System";
}

function getUserName(role: string): string {
  const names: Record<string, string> = {
    Operator: "John Operator",
    "Production Supervisor": "Ana Silva",
    "Maintenance Supervisor": "Mike Maintenance",
    "Quality Coordinator": "Lisa Quality",
    "Continuous Improvement": "Tom CI",
    Administrator: "Admin User",
  };
  return names[role] || "Demo User";
}

function getUserInitials(role: string): string {
  const initials: Record<string, string> = {
    Operator: "JO",
    "Production Supervisor": "AS",
    "Maintenance Supervisor": "MM",
    "Quality Coordinator": "LQ",
    "Continuous Improvement": "TC",
    Administrator: "AD",
  };
  return initials[role] || "DU";
}
