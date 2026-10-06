import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerApp from "./areas/customer/CustomerApp.jsx";
import WorkerArea from "./areas/worker/WorkerArea.jsx";
import AdminArea from "./areas/admin/AdminArea.jsx";
import AuthPage from "./pages/auth/AuthPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage onAuthenticated={() => (location.href = "/")} />} />
        <Route path="/worker/*" element={<WorkerArea />} />
        <Route path="/admin/*" element={<AdminArea />} />
        <Route path="/*" element={<CustomerApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
