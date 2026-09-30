import { Route, Routes } from 'react-router-dom';
import './App.css'
import RegisterWorkerProfilePage from './component/worker/RegisterWorkerProfilePage'
import WorkerDashboard from './component/worker/WorkerDashboard';
import LandingWorker from './component/worker/LandingWorker';

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<LandingWorker />} />
      <Route path="/worker/register" element={<RegisterWorkerProfilePage/>}/>
      <Route path="/worker/dashboard" element={<WorkerDashboard/>}/>
    </Routes>
    </>
  )
}

export default App;
