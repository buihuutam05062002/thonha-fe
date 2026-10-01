import React from "react";
import { IconBell, IconSettings } from "../../icon/Index"   ;

export function HeaderDashboard({ onToggleNotif }) {
  return (
    <header className="bg-white border-bottom sticky-top z-3 px-4 py-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-warning bg-opacity-10 text-warning fw-bold d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px", color: "#F5820D" }}
        >
          T
        </div>
        <div>
          <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
            Xin chào,
          </p>
          <p className="fw-bold text-dark mb-0 leading-tight">Trần Minh Tuấn</p>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          onClick={onToggleNotif}
          className="btn btn-light rounded-circle p-2 position-relative border-0"
        >
          <IconBell />
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" />
        </button>
        <button className="btn btn-light rounded-circle p-2 border-0">
          <IconSettings />
        </button>
      </div>
    </header>
  );
}
