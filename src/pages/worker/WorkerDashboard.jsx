import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Sidebar } from "../../components/worker/dashboard/Sidebar";
import { HeaderDashboard } from "../../components/worker/dashboard/HeaderDashboard";
import { ActiveStatusCard } from "../../components/worker/dashboard/ActiveStatusCard";
import { OverviewStats } from "../../components/worker/dashboard/OverviewStats";
import { IncomingRequests } from "../../components/worker/dashboard/IncomingRequests";
import { WeeklyIncome } from "../../components/worker/dashboard/WeeklyIncome";
import { RecentOrders } from "../../components/worker/dashboard/RecentOrders";
import { QuickMenu } from "../../components/worker/dashboard/QuickMenu";
import { BottomNav } from "../../components/worker/dashboard/BottomNav";
import { NotificationDropdown } from "../../components/worker/dashboard/NotificationDropdown";
import { ApprovalPending } from "../../components/worker/dashboard/ApprovalPending";
import { parseApiError } from "../../api/apiError";
import { getStoredUser } from "../../api/authApi";
import {
  getMyWorkerProfile,
  updateWorkerAvailability,
  getWorkerDashboard,
  respondToMatching,
} from "../../api/workerApi";
import { useNavigate } from "react-router-dom";
import { useUserTopics } from "../../hooks/useUserTopics";

// Realtime qua WebSocket. Chỉ khi mất kết nối mới quay về polling thưa để không bị "mù".
const FALLBACK_POLL_MS = 30000;

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [dashError, setDashError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [respondError, setRespondError] = useState(null);
  const mounted = useRef(true);

  // đặt lại true khi mount: React.StrictMode (dev) chạy mount -> cleanup -> mount
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyWorkerProfile()
      .then((data) => {
        if (cancelled) return;
        if (!data) navigate("/worker/register", { replace: true });
        else setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(parseApiError(err).message || "Không tải được hồ sơ, vui lòng tải lại trang.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  const approved = profile?.approvalStatus === "APPROVED";

  const loadDashboard = useCallback(async () => {
    try {
      const data = await getWorkerDashboard();
      if (!mounted.current) return;
      setDashboard(data);
      setDashError(null);
    } catch (err) {
      if (mounted.current) setDashError(parseApiError(err).message || "Không tải được dữ liệu bảng điều khiển.");
    }
  }, []);

  // ---- Realtime: backend đẩy sự kiện qua WebSocket, FE chỉ cần tải lại dashboard ----
  const refreshTimer = useRef(null);
  const handleSocketMessage = useCallback(() => {
    // gộp nhiều sự kiện đến liên tiếp (vd: mời 1 lúc nhiều thợ) thành 1 lần tải
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(loadDashboard, 300);
  }, [loadDashboard]);
  useEffect(() => () => clearTimeout(refreshTimer.current), []);

  const userId = getStoredUser()?.id;
  const wsConnected = useUserTopics(approved ? userId : null, ["matching"], handleSocketMessage);

  // tải lần đầu + khi người dùng quay lại tab
  useEffect(() => {
    if (!approved) return undefined;
    loadDashboard();
    const onVisible = () => { if (document.visibilityState === "visible") loadDashboard(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [approved, loadDashboard]);

  // mỗi lần (kết nối lại) WebSocket thành công: tải lại để bù các sự kiện bị lỡ lúc mất mạng
  useEffect(() => {
    if (approved && wsConnected) loadDashboard();
  }, [approved, wsConnected, loadDashboard]);

  // dự phòng: chỉ polling khi WebSocket đang không kết nối được
  useEffect(() => {
    if (!approved || wsConnected) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") loadDashboard();
    }, FALLBACK_POLL_MS);
    return () => clearInterval(id);
  }, [approved, wsConnected, loadDashboard]);

  const handleToggle = async () => {
    if (toggling || profile?.availabilityStatus === "BUSY") return;
    setToggling(true);
    setToggleError(null);
    try {
      const next = profile.availabilityStatus !== "READY";
      setProfile(await updateWorkerAvailability(next));
    } catch (err) {
      const parsed = parseApiError(err);
      setToggleError(parsed.message || "Không thể đổi trạng thái, vui lòng thử lại.");
      if (parsed.code === "WORKER_BUSY" || parsed.code === "WORKER_NOT_APPROVED") {
        const fresh = await getMyWorkerProfile().catch(() => null);
        if (fresh) setProfile(fresh);
      }
    } finally {
      setToggling(false);
    }
  };

  const handleRespond = async (req, result) => {
    setBusyId(req.matchingLogId);
    setRespondError(null);
    try {
      await respondToMatching(req.requestId, req.matchingLogId, result);
      const fresh = await getMyWorkerProfile().catch(() => null); // trạng thái/ số đơn có thể đổi
      if (fresh && mounted.current) setProfile(fresh);
    } catch (err) {
      setRespondError(parseApiError(err).message || "Không thể gửi phản hồi, vui lòng thử lại.");
    } finally {
      if (mounted.current) setBusyId(null);
      loadDashboard(); // yêu cầu có thể đã hết hạn hoặc thợ khác đã nhận
    }
  };

  if (loading) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center">
        <Spinner animation="border" style={{ color: "#F5820D" }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center p-3">
        <p className="text-danger mb-0">{loadError}</p>
      </div>
    );
  }

  if (!profile) return null;

  if (!approved) {
    return <ApprovalPending status={profile.approvalStatus} reason={profile.rejectReason} />;
  }

  const user = {
    name: getStoredUser()?.fullName || "Thợ Nhà",
    specialty: profile.specialties?.map((s) => s.name).join(", "),
  };
  const incoming = dashboard?.incomingRequests ?? [];
  const orders = dashboard?.recentOrders ?? [];
  const toggleNotif = () => setNotifOpen((v) => !v);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar user={user} pendingCount={incoming.length} onOpenNotif={toggleNotif} />

      <div className="flex-grow-1 d-flex flex-column min-width-0">
        <HeaderDashboard onToggleNotif={toggleNotif} pendingCount={incoming.length} />

        <main className="flex-grow-1 p-3 p-lg-4 pb-5">
          <Container fluid="lg" style={{ maxWidth: "900px" }}>
            <ActiveStatusCard
              status={profile.availabilityStatus}
              loading={toggling}
              error={toggleError}
              onToggle={handleToggle}
            />

            {dashError && !dashboard && (
              <div className="alert alert-danger small" role="alert">
                {dashError}{" "}
                <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={loadDashboard}>Thử lại</button>
              </div>
            )}

            {!dashboard && !dashError && (
              <div className="text-center py-5"><Spinner animation="border" style={{ color: "#F5820D" }} /></div>
            )}

            {dashboard && (
              <>
                <IncomingRequests requests={incoming} busyId={busyId} error={respondError} onRespond={handleRespond} />
                <OverviewStats summary={dashboard.summary} />
                <WeeklyIncome data={dashboard.weeklyIncome} total={dashboard.summary.incomeWeek} />
                <RecentOrders orders={orders} />
                <QuickMenu />
              </>
            )}
          </Container>
        </main>
      </div>

      <BottomNav pendingCount={incoming.length} onOpenNotif={toggleNotif} />

      {notifOpen && <NotificationDropdown incoming={incoming} orders={orders} onClose={() => setNotifOpen(false)} />}
    </div>
  );
}
