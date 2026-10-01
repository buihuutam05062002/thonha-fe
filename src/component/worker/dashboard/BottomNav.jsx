import React from "react";
import { IconHome, IconOrders, IconNotif, IconUser } from "../../icon/Index";

export function BottomNav() {
  const items = [
    { label: "Trang chủ", icon: (a) => <IconHome active={a} />, active: true },
    {
      label: "Đơn hàng",
      icon: (a) => <IconOrders active={a} />,
      active: false,
    },
    {
      label: "Thông báo",
      icon: (a) => <IconNotif active={a} />,
      active: false,
      badge: true,
    },
    { label: "Tài khoản", icon: (a) => <IconUser active={a} />, active: false },
  ];

  return (
    <nav className="d-lg-none fixed-bottom bg-white border-top d-flex align-items-center justify-content-around py-2 shadow-lg z-3">
      {items.map((item) => (
        <button
          key={item.label}
          className="btn border-0 p-1 position-relative d-flex flex-column align-items-center"
        >
          {item.icon(item.active)}
          {item.badge && (
            <span
              className="position-absolute bg-danger rounded-circle"
              style={{ width: "8px", height: "8px", top: "2px", right: "12px" }}
            />
          )}
          <span
            className="fw-semibold mt-1"
            style={{
              fontSize: "10px",
              color: item.active ? "#F5820D" : "#9CA3AF",
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
