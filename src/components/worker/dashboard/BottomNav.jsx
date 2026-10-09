import React from "react";
import { IconHome, IconOrders, IconNotif, IconUser } from "../../icon/Index";

export function BottomNav({ pendingCount = 0, onOpenNotif }) {
  const items = [
    { label: "Trang chủ", icon: (a) => <IconHome active={a} />, active: true },
    { label: "Đơn hàng", icon: (a) => <IconOrders active={a} />, soon: true },
    { label: "Thông báo", icon: (a) => <IconNotif active={a} />, badge: pendingCount > 0, onClick: onOpenNotif },
    { label: "Tài khoản", icon: (a) => <IconUser active={a} />, soon: true },
  ];

  return (
    <nav className="d-lg-none fixed-bottom bg-white border-top d-flex align-items-center justify-content-around py-2 shadow-lg z-3">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={item.soon}
          onClick={item.onClick}
          className="btn border-0 p-1 position-relative d-flex flex-column align-items-center"
          style={{ opacity: item.soon ? 0.5 : 1 }}
        >
          {item.icon(item.active)}
          {item.badge && (
            <span className="position-absolute bg-danger rounded-circle"
                  style={{ width: "8px", height: "8px", top: "2px", right: "12px" }} />
          )}
          <span className="fw-semibold mt-1" style={{ fontSize: "10px", color: item.active ? "#F5820D" : "#9CA3AF" }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
