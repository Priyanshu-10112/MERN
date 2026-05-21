import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  Users,
  Bot,
  MessageSquare,
  FileText,
  Sparkles,
  Clock,
} from 'lucide-react'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload & Analyze' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/teams', icon: Users, label: 'Team Analysis' },
  { to: '/evaluation', icon: Sparkles, label: 'AI Evaluation' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Bot size={20} />
        </div>
        <h1>Excel Analyzer</h1>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <link.icon size={19} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <Sparkles size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
          <p>AI-powered data analysis with Groq</p>
          <button>Learn More</button>
        </div>
      </div>
    </aside>
  )
}
