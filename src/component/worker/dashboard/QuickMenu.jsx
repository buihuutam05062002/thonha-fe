import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  IconCalendar,
  IconWallet,
  IconProfile,
  IconSupport,
} from "../../icon/Index";

const QUICK_MENU = [
  { label: "Lịch làm việc", icon: <IconCalendar /> },
  { label: "Thu nhập / Ví", icon: <IconWallet /> },
  { label: "Hồ sơ của tôi", icon: <IconProfile /> },
  { label: "Hỗ trợ", icon: <IconSupport /> },
];

export function QuickMenu() {
  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3 text-dark">Truy cập nhanh</h6>
      <Row className="g-3">
        {QUICK_MENU.map((item) => (
          <Col key={item.label} xs={6} sm={3}>
            <Card className="border-0 shadow-sm rounded-4 text-center hover-shadow transition-all button-card">
              <Card.Body className="p-3 d-flex flex-column align-items-center justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#FFF4E6",
                  }}
                >
                  {item.icon}
                </div>
                <span className="fw-semibold text-dark small">
                  {item.label}
                </span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
