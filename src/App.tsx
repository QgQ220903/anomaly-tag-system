// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Operator Pages
import { OperatorDashboard } from "@/pages/operator/OperatorDashboard";
import { CreateTag } from "@/pages/operator/CreateTag";
import { MyTags } from "@/pages/operator/MyTags";
import { TagDetailPage } from "@/pages/operator/TagDetailPage";

// Supervisor Pages
import { SupervisorDashboard } from "@/pages/supervisor/SupervisorDashboard";
import { AllTagsList } from "./pages/supervisor/AllTagList";
import { PendingQueue } from "./pages/supervisor/PendingQueue";
import { OverdueTags } from "./pages/supervisor/OverdueTags";
import { AssignTag } from "./pages/supervisor/AssignTag";
import { VerifyClose } from "@/pages/supervisor/VerifyClose";
import { Reports } from "@/pages/supervisor/Reports";

// Role selector for demo
const RoleSelector: React.FC<{
  currentRole: string;
  onRoleChange: (role: string) => void;
}> = ({ currentRole, onRoleChange }) => {
  const roles = [
    "Operator",
    "Production Supervisor",
    "Maintenance Supervisor",
    "Quality Coordinator",
    "Continuous Improvement",
    "Administrator",
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-2">
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value)}
        className="text-sm border-none focus:outline-none bg-transparent"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
};

function App() {
  const [currentRole, setCurrentRole] = useState("Production Supervisor");

  // Role-based routing
  const getRoutes = () => {
    switch (currentRole) {
      case "Operator":
        return (
          <>
            <Route path="/" element={<OperatorDashboard />} />
            <Route path="/create-tag" element={<CreateTag />} />
            <Route path="/my-tags" element={<MyTags />} />
            <Route path="/tag/:id" element={<TagDetailPage />} />
          </>
        );

      case "Production Supervisor":
        return (
          <>
            <Route
              path="/"
              element={<Navigate to="/supervisor/dashboard" replace />}
            />
            <Route
              path="/supervisor/dashboard"
              element={<SupervisorDashboard />}
            />
            <Route path="/supervisor/tags" element={<AllTagsList />} />
            <Route path="/supervisor/pending" element={<PendingQueue />} />
            <Route path="/supervisor/overdue" element={<OverdueTags />} />
            <Route path="/supervisor/tags/:id/assign" element={<AssignTag />} />
            <Route path="/supervisor/verify" element={<VerifyClose />} />
            <Route path="/supervisor/reports" element={<Reports />} />
          </>
        );

      default:
        return <Route path="/" element={<OperatorDashboard />} />;
    }
  };

  return (
    <BrowserRouter>
      <AppLayout currentRole={currentRole}>
        <Routes>
          {getRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <RoleSelector currentRole={currentRole} onRoleChange={setCurrentRole} />
    </BrowserRouter>
  );
}

export default App;
