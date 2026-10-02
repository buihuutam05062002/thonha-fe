import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { getStoredUser } from "../api/client.js";
import "./AdminLayout.css";

export default function AdminLayout() {
  const stored = getStoredUser();
  const user = {
    name: stored?.fullName || "Admin",
    role: (stored?.roles || []).join(", ") || "ADMIN",
    avatar: stored?.avatarUrl || "",
  };

  return (
    <div className="admin-layout">
      <Sidebar user={user} />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
