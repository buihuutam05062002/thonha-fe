import { Navigate, Route, Routes } from "react-router-dom";
import LandingWorker from "../../pages/worker/LandingWorker";
import RegisterWorkerProfilePage from "../../pages/worker/RegisterWorkerProfilePage";
import WorkerDashboard from "../../pages/worker/WorkerDashboard";

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
