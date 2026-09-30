import React from "react";
import { IconAC, IconElec, IconPaint, IconPlumbing } from "../../icon/Index";
import { OrderCard } from "./OrderCard";

const ORDERS = [
  {
    id: 1,
    icon: <IconElec />,
    iconBg: "#FFF7ED",
    customer: "Nguyễn Văn A",
    service: "Sửa điện",
    address: "Q. Bình Thạnh, TP.HCM",
    time: "10:30 - Hôm nay",
    status: "Đang thực hiện",
  },
  {
    id: 2,
    icon: <IconPlumbing />,
    iconBg: "#EFF6FF",
    customer: "Trần Thị B",
    service: "Sửa ống nước",
    address: "Q. 7, TP.HCM",
    time: "08:00 - Hôm nay",
    status: "Hoàn thành",
  },
  {
    id: 3,
    icon: <IconAC />,
    iconBg: "#ECFEFF",
    customer: "Lê Minh C",
    service: "Vệ sinh máy lạnh",
    address: "Q. Gò Vấp, TP.HCM",
    time: "14:00 - Hôm nay",
    status: "Đang chờ",
  },
  {
    id: 4,
    icon: <IconPaint />,
    iconBg: "#F5F3FF",
    customer: "Phạm Quang D",
    service: "Sơn nhà",
    address: "Q. Tân Bình, TP.HCM",
    time: "09:00 - Hôm qua",
    status: "Hoàn thành",
  },
];

export function RecentOrders() {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0 text-dark">Đơn hàng gần đây</h6>
        <button
          className="btn btn-link p-0 text-decoration-none fw-bold small"
          style={{ color: "#F5820D" }}
        >
          Xem tất cả →
        </button>
      </div>
      <div className="d-flex flex-column gap-2">
        {ORDERS.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}
