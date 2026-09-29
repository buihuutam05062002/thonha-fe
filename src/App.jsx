import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import './App.css'
import UserManagement from "./pages/user-management/UserManagement";
import WorkerApprovalPage from "./pages/worker-approval/WorkerApprovalPage"
function App() {


  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/users" replace />} />
          {/* <Route path="/dashboard" element={<Placeholder title="Tổng quan" />} /> */}
          <Route path="/profiles" element={<WorkerApprovalPage />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>
        {/* <Route path="/login" element={<Placeholder title="Đăng nhập" />} /> */}
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
