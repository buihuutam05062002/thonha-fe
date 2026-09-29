import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  // Sau này lấy user thật từ đăng nhập / context rồi truyền vào
  const user = { name: "Admin", role: "Admin", avatar: "" };

  return (
    <div className="admin-layout">
      <Sidebar user={user} />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
