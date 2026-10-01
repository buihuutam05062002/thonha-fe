import { Navigate, Route, Routes } from "react-router-dom";
import LandingWorker from "../../component/worker/LandingWorker";
import RegisterWorkerProfilePage from "../../component/worker/RegisterWorkerProfilePage";
import WorkerDashboard from "../../component/worker/WorkerDashboard";

export default function WorkerArea() {
  return (
    <Routes>
      <Route index element={<LandingWorker />} />
      <Route path="register" element={<RegisterWorkerProfilePage />} />
      <Route path="dashboard" element={<WorkerDashboard />} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  );
}
