import { useCallback, useEffect, useState } from "react";
import {
  fetchWorkerProfiles, fetchWorkerProfileDetail,
  approveWorkerProfile, rejectWorkerProfile,
} from "./workerApprovalApi";
import PendingTable from "./PendingTable";
import ProfileDetail from "./ProfileDetail";
import "./WorkerApprovalPage.css";

export default function WorkerApprovalPage() {
  const [profiles, setProfiles] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await fetchWorkerProfiles({ status: "PENDING" });
      setProfiles(res.content);
      // tự chọn hồ sơ đầu tiên nếu chưa chọn gì
      setSelectedId((cur) => cur ?? res.content[0]?.id ?? null);
    } catch (e) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError("");
    fetchWorkerProfileDetail(selectedId)
      .then((res) => { if (!cancelled) setDetail(res); })
      .catch((e) => { if (!cancelled) setDetailError(e.message); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const afterDecision = (updatedId) => {
    // hồ sơ đã duyệt/từ chối thì rời khỏi danh sách "chờ duyệt"
    setProfiles((list) => list.filter((p) => p.id !== updatedId));
    setSelectedId(null);
    setDetail(null);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt hồ sơ thợ này?")) return;
    try {
      await approveWorkerProfile(id);
      afterDecision(id);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await rejectWorkerProfile(id, reason);
      afterDecision(id);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="wa-page">
      <header className="wa-header"><h1>Duyệt hồ sơ</h1></header>

      <div className="wa-panel">
        <div className="wa-list">
          <h2>Thợ chờ duyệt</h2>
          <PendingTable
            profiles={profiles}
            loading={listLoading}
            error={listError}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <ProfileDetail
          profile={detail}
          loading={detailLoading}
          error={detailError}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </section>
  );
}
