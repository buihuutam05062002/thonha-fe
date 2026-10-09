import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../pages/admin/user-management/UserManagement";
import WorkerApprovalPage from "../../pages/admin/worker-approval/WorkerApprovalPage";

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
