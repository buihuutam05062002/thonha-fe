import React from "react";
import { Badge } from "react-bootstrap";
import logoImg from "../../../assets/logo.png";
import { IconHome, IconOrders, IconNotif, IconUser } from "../../icon/Index";

const SIDEBAR_NAV = [
  { label: "Trang chủ", icon: <IconHome active />, active: true },
  { label: "Đơn hàng", icon: <IconOrders />, active: false },
  { label: "Thông báo", icon: <IconNotif />, active: false, badge: 3 },
  { label: "Tài khoản", icon: <IconUser />, active: false },
];

export function Sidebar() {
  return (
    <aside
      className="bg-white border-end d-none d-lg-flex flex-column p-4 sticky-top vh-100"
      style={{ width: "260px" }}
    >
      <a href="#" className="mb-4 px-2 block">
        <img
          src={logoImg}
          alt="Thợ Nhà"
          style={{ height: "42px", width: "auto" }}
        />
      </a>

      <nav className="nav flex-column gap-2 flex-grow-1">
        {SIDEBAR_NAV.map((item) => (
          <button
            key={item.label}
            className={`btn border-0 text-start d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-semibold ${
              item.active ? "text-warning" : "text-secondary"
            }`}
            style={{
              backgroundColor: item.active ? "#FFF4E6" : "transparent",
              color: item.active ? "#F5820D" : "#6B7280",
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <Badge bg="danger" pill className="ms-auto">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      <div className="pt-3 border-top d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-warning bg-opacity-10 fw-bold d-flex align-items-center justify-content-center"
          style={{ width: "38px", height: "38px", color: "#F5820D" }}
        >
          T
        </div>
        <div className="overflow-hidden">
          <p className="fw-bold text-dark mb-0 text-truncate small">
            Trần Minh Tuấn
          </p>
          <p
            className="text-muted mb-0 text-truncate"
            style={{ fontSize: "11px" }}
          >
            Thợ điện
          </p>
        </div>
      </div>
    </aside>
  );
}
