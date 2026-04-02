import { Outlet, Navigate } from "react-router-dom";
import  useAuth  from "../hooks/useAuth"
import AIChat from "../components/common/AIChat";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

const PublicUserLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If accepted and promoted to intern, redirect to intern dashboard
  if (user?.role === "intern")
    return <Navigate to="/intern" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ================= Sidebar (Desktop) ================= */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ================= Mobile Sidebar ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* drawer */}
          <div className="relative w-64 bg-white shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        <AIChat type="private" />
      </div>
    </div>
  );
};
export default PublicUserLayout;
