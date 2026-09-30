import React from "react";
import { Card, Badge } from "react-bootstrap";

const STATUS_CONFIG = {
  "Đang chờ": { bg: "warning", text: "dark", dot: "#F59E0B" },
  "Đang thực hiện": { bg: "warning", text: "dark", dot: "#F5820D" },
  "Hoàn thành": { bg: "success", text: "success", dot: "#22C55E" },
};

export function OrderCard({ order }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["Đang chờ"];

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-2.5 hover-shadow transition-all">
      <Card.Body className="p-3 d-flex align-items-center gap-3">
        {/* Icon */}
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: order.iconBg,
          }}
        >
          {order.icon}
        </div>

        {/* Info */}
        <div className="flex-grow-1 min-width-0">
          <p className="mb-0 fw-bold text-dark text-truncate small">
            {order.customer}{" "}
            <span className="text-muted font-weight-normal">·</span>{" "}
            {order.service}
          </p>
          <p
            className="mb-0 text-muted text-truncate"
            style={{ fontSize: "12px" }}
          >
            {order.address}
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>
            {order.time}
          </p>
        </div>

        {/* Status Pill */}
        <Badge
          bg={status.bg}
          className={`bg-opacity-10 text-${status.text} rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 flex-shrink-0`}
          style={{ fontSize: "11px" }}
        >
          <span
            className="rounded-circle d-inline-block"
            style={{ width: "6px", height: "6px", backgroundColor: status.dot }}
          />
          {order.status}
        </Badge>
      </Card.Body>
    </Card>
  );
}
