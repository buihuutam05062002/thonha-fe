import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../pages/user-management/UserManagement";
import WorkerApprovalPage from "../../pages/worker-approval/WorkerApprovalPage";

export default function AdminArea() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="profiles" replace />} />
        <Route path="profiles" element={<WorkerApprovalPage />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}
