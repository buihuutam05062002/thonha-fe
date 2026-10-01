import { Route, Routes } from 'react-router-dom';
import './App.css'
import RegisterWorkerProfilePage from './component/worker/RegisterWorkerProfilePage'
import WorkerDashboard from './component/worker/WorkerDashboard';
import LandingWorker from './component/worker/LandingWorker';
import  AdminLayout from './layouts/AdminLayout'
import UserManagement from "./pages/user-management/UserManagement";
import WorkerApprovalPage from "./pages/worker-approval/WorkerApprovalPage"
import { Navigate } from 'react-router-dom';

function App() {

  return (
    <>
    <Routes>
      <Route  path="/" element={<LandingWorker />} />
      <Route path="/worker/register" element={<RegisterWorkerProfilePage/>}/>
      <Route path="/worker/dashboard" element={<WorkerDashboard/>}/>
      <Route element={<AdminLayout />}>
          <Route  element={<Navigate to="/users" replace />} />
          {/* <Route path="/dashboard" element={<Placeholder title="Tổng quan" />} /> */}
          <Route path="/profiles" element={<WorkerApprovalPage />} />
          <Route path="/users" element={<UserManagement />} />
      </Route>
    </Routes>
    </>
  )
}

export default App;
