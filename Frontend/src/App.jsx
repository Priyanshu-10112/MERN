import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import UploadData from './pages/UploadData'
import EnhancedUpload from './pages/EnhancedUpload'
import TeamAnalysis from './pages/TeamAnalysis'
import AIChat from './pages/AIChat'
import Reports from './pages/Reports'
import AIEvaluation from './pages/AIEvaluation'
import History from './pages/History'

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<EnhancedUpload />} />
            <Route path="/upload-old" element={<UploadData />} />
            <Route path="/teams" element={<TeamAnalysis />} />
            <Route path="/evaluation" element={<AIEvaluation />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
