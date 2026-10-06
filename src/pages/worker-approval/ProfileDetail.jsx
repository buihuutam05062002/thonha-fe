import { useState } from "react";
import { STATUSES } from "./workerApprovalApi";

const statusLabel = (v) => STATUSES.find((s) => s.value === v)?.label ?? v;
const docTypeLabel = (t) =>
  ({
    CCCD_FRONT: "CCCD mặt trước",
    CCCD_BACK: "CCCD mặt sau",
    CERTIFICATE: "Chứng chỉ nghề",
    DEGREE: "Bằng cấp",
  }[t] ?? t);

export default function ProfileDetail({ profile, loading, error, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (loading) return <aside className="wa-detail wa-empty">Đang tải...</aside>;
  if (error) return <aside className="wa-detail wa-empty wa-error">{error}</aside>;
  if (!profile) return <aside className="wa-detail wa-empty">Chọn một hồ sơ để xem chi tiết</aside>;

  const pending = profile.approvalStatus === "PENDING";

  const submitReject = () => {
    if (!reason.trim()) return;
    onReject(profile.id, reason.trim());
    setRejecting(false);
    setReason("");
  };

  return (
    <aside className="wa-detail">
      <div className="wa-detail-header">
        <h2>Chi tiết hồ sơ</h2>
        <span className={`wa-status wa-status-${profile.approvalStatus?.toLowerCase()}`}>
          {statusLabel(profile.approvalStatus)}
        </span>
      </div>

      <div className="wa-profile-card">
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="wa-avatar" />
        ) : (
          <span className="wa-avatar wa-avatar-fallback">{profile.name?.[0]?.toUpperCase()}</span>
        )}
        <div>
          <strong>{profile.name}</strong>
          <p className="wa-muted">
            {profile.yearsOfExperience != null ? `${profile.yearsOfExperience} năm kinh nghiệm` : ""}
          </p>
        </div>
      </div>

      <dl className="wa-fields">
        <dt>Số điện thoại</dt>
        <dd>{profile.phoneNumber || "—"}</dd>

        <dt>Chuyên môn</dt>
        <dd>{profile.specialtyText || "—"}</dd>

        <dt>Khu vực hoạt động</dt>
        <dd>{profile.serviceArea || "—"}</dd>

        <dt>Nơi cư trú</dt>
        <dd>{profile.residenceCity || "—"}</dd>

        {profile.rejectReason && (
          <>
            <dt>Lý do từ chối</dt>
            <dd className="wa-reject-reason">{profile.rejectReason}</dd>
          </>
        )}
      </dl>

      {profile.documents?.length > 0 && (
        <div className="wa-docs">
          <p className="wa-docs-title">Giấy tờ kèm theo</p>
          <ul>
            {profile.documents.map((d) => (
              <li key={d.id}>
                <span className="wa-doc-check" aria-hidden="true">✓</span>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer">{docTypeLabel(d.type)}</a>
                ) : (
                  docTypeLabel(d.type)
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pending && !rejecting && (
        <div className="wa-actions">
          <button className="wa-approve" onClick={() => onApprove(profile.id)}>Chấp nhận</button>
          <button className="wa-reject" onClick={() => setRejecting(true)}>Từ chối</button>
        </div>
      )}

      {pending && rejecting && (
        <div className="wa-reject-form">
          <textarea
            placeholder="Nhập lý do từ chối..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="wa-actions">
            <button className="wa-reject" disabled={!reason.trim()} onClick={submitReject}>
              Xác nhận từ chối
            </button>
            <button className="wa-cancel" onClick={() => { setRejecting(false); setReason(""); }}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
