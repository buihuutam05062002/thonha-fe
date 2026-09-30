import React from "react";
import { Card, Badge } from "react-bootstrap";

export function NotificationDropdown() {
  return (
    <Card
      className="position-fixed border-0 shadow-lg rounded-4 overflow-hidden z-3"
      style={{ top: "65px", right: "20px", width: "320px" }}
    >
      <Card.Header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
        <span className="fw-bold text-dark small">Thông báo</span>
        <Badge bg="danger" pill>
          3 mới
        </Badge>
      </Card.Header>
      <div className="list-group list-group-flush">
        {[
          {
            msg: "Khách hàng Lê Minh C đã đặt lịch vệ sinh máy lạnh vào 14:00 hôm nay.",
            time: "5 phút trước",
          },
          {
            msg: "Bạn vừa nhận được đánh giá 5★ từ Trần Thị B.",
            time: "1 giờ trước",
          },
          {
            msg: "Thu nhập tuần này của bạn tăng 12% so với tuần trước.",
            time: "3 giờ trước",
          },
        ].map((n, i) => (
          <div
            key={i}
            className="list-group-item p-3 list-group-item-action border-bottom-0"
          >
            <p className="mb-1 text-dark small leading-snug">{n.msg}</p>
            <span className="text-muted" style={{ fontSize: "10px" }}>
              {n.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
