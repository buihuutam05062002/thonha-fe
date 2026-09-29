import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileCheck, Users, LayoutGrid, ClipboardList,
  MessageCircle, CircleAlert, FileDown, Percent, Settings, LogOut,
  Bell, Search, ChevronLeft, ChevronRight, Wrench,
} from "lucide-react";
import "./Sidebar.css";

import logo from "../../assets/logo.jpg";

// Sửa lại path cho khớp với router của bạn
const MENU = [
  { label: "Tổng quan", to: "/dashboard", icon: LayoutDashboard },
  { label: "Duyệt hồ sơ", to: "/profiles", icon: FileCheck },
  { label: "Người dùng", to: "/users", icon: Users },
  { label: "Danh mục", to: "/categories", icon: LayoutGrid },
  { label: "Thống kê", to: "/statistics", icon: ClipboardList },
  { label: "Hội thoại", to: "/conversations", icon: MessageCircle },
  { label: "Khiếu nại", to: "/complaints", icon: CircleAlert },
  { label: "Xuất file", to: "/export", icon: FileDown },
  { label: "Hoa hồng", to: "/commissions", icon: Percent },
];

export default function Sidebar({ user = { name: "Admin", role: "Admin", avatar: "" } }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? MENU.filter((m) => m.label.toLowerCase().includes(q)) : MENU;
  }, [query]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className={`sb ${collapsed ? "sb-collapsed" : ""}`}>
      <button
        className="sb-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sb-brand">
        <img src={logo} alt="" width={60} />
        <span className="sb-text sb-brand-name">Thợ Nhà</span>
      </div>

      {!collapsed && (
        <label className="sb-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Tìm chức năng"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      )}

      <nav className="sb-nav" aria-label="Menu chính">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="sb-text">{label}</span>
          </NavLink>
        ))}
        {items.length === 0 && <p className="sb-none">Không có chức năng phù hợp</p>}
      </nav>

      <div className="sb-bottom">
        <div className="sb-user">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="sb-avatar" />
          ) : (
            <span className="sb-avatar sb-avatar-fallback">
              {user.name?.[0]?.toUpperCase() ?? "A"}
            </span>
          )}
          <div className="sb-text sb-user-info">
            <strong>{user.name}</strong>
            <span className="sb-badge">{user.role}</span>
          </div>
          <button className="sb-icon-btn sb-text" aria-label="Thông báo">
            <Bell size={18} />
          </button>
        </div>

        <NavLink to="/settings" className="sb-link" title={collapsed ? "Cài đặt" : undefined}>
          <Settings size={16} aria-hidden="true" />
          <span className="sb-text">Cài đặt</span>
        </NavLink>
        <button className="sb-link sb-logout" onClick={handleLogout} title={collapsed ? "Đăng xuất" : undefined}>
          <LogOut size={16} aria-hidden="true" />
          <span className="sb-text">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
