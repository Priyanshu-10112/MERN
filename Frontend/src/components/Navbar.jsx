import { useLocation } from 'react-router-dom'
import { Search, Bell, Settings } from 'lucide-react'

const titles = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Data',
  '/teams': 'Team Analysis',
  '/evaluation': 'AI Evaluation',
  '/chat': 'AI Chat Assistant',
  '/reports': 'Reports',
}

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>{titles[pathname] || 'Dashboard'}</h2>
        <div className="search-box">
          <Search size={16} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
          <input type="text" placeholder="Search teams, projects, reports…" />
        </div>
      </div>
      <div className="navbar-right">
        <button className="nav-icon-btn" id="nav-notifications" title="Notifications">
          <Bell size={18} />
          <span className="badge" />
        </button>
        <button className="nav-icon-btn" id="nav-settings" title="Settings">
          <Settings size={18} />
        </button>
        <div className="user-avatar" title="Profile">KS</div>
      </div>
    </header>
  )
}
