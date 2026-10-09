import React from "react";
import { Badge } from "react-bootstrap";
import logoImg from "../../../assets/logo.png";
import { IconHome, IconOrders, IconNotif, IconUser } from "../../icon/Index";

export function Sidebar({ user, pendingCount = 0, onOpenNotif }) {
  const items = [
    { label: "Trang chủ", icon: <IconHome active />, active: true },
    { label: "Đơn hàng", icon: <IconOrders />, soon: true },
    { label: "Thông báo", icon: <IconNotif />, badge: pendingCount, onClick: onOpenNotif },
    { label: "Tài khoản", icon: <IconUser />, soon: true },
  ];

  return (
    <aside className="bg-white border-end d-none d-lg-flex flex-column p-4 sticky-top vh-100" style={{ width: "260px" }}>
      <a href="/worker/dashboard" className="mb-4 px-2 block">
        <img src={logoImg} alt="Thợ Nhà" style={{ height: "42px", width: "auto" }} />
      </a>

      <nav className="nav flex-column gap-2 flex-grow-1">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={item.soon}
            title={item.soon ? "Sắp ra mắt" : undefined}
            onClick={item.onClick}
            className="btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold"
            style={{
              backgroundColor: item.active ? "#FFF4E6" : "transparent",
              color: item.active ? "#F5820D" : "#6B7280",
              opacity: item.soon ? 0.55 : 1,
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge > 0 && <Badge bg="danger" pill className="ms-auto">{item.badge}</Badge>}
            {item.soon && <small className="ms-auto" style={{ fontSize: 10 }}>Sắp có</small>}
          </button>
        ))}
      </nav>

      <div className="pt-3 border-top d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-warning bg-opacity-10 fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: "38px", height: "38px", color: "#F5820D" }}
        >
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="fw-bold text-dark mb-0 text-truncate small">{user.name}</p>
          <p className="text-muted mb-0 text-truncate" style={{ fontSize: "11px" }}>{user.specialty || "Thợ"}</p>
        </div>
      </div>
    </aside>
  );
}
