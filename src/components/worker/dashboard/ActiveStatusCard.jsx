import React from "react";
import { Card } from "react-bootstrap";
import { ToggleSwitch } from "../../ui/ToggleSwitch";

const STATUS_VIEW = {
  READY: { label: "Sẵn sàng", dot: "bg-success", text: "text-success" },
  OFFLINE: { label: "Ngoại tuyến", dot: "bg-secondary", text: "text-muted" },
  BUSY: { label: "Đang bận", dot: "bg-warning", text: "text-warning" },
};

export function ActiveStatusCard({ status, loading, error, onToggle }) {
  const view = STATUS_VIEW[status] ?? STATUS_VIEW.OFFLINE;
  const locked = status === "BUSY";
  const disabled = locked || loading;

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="fw-bold mb-1 text-dark">Trạng thái hoạt động</h6>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`rounded-circle d-inline-block ${view.dot}`}
                style={{ width: "8px", height: "8px" }}
              />
              <span className={`fw-semibold small ${view.text}`}>
                {view.label}
              </span>
            </div>
          </div>

          <ToggleSwitch
            on={status === "READY"}
            onToggle={onToggle}
            disabled={disabled}
          />
        </div>

        {locked && (
          <p className="small text-muted mb-0 mt-3">
            Bạn đang thực hiện một đơn. Hoàn thành đơn để bật/tắt trạng thái
            nhận việc.
          </p>
        )}
        {error && <p className="small text-danger mb-0 mt-3">{error}</p>}
      </Card.Body>
    </Card>
  );
}
