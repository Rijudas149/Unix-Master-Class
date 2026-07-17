import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useProgress } from '../context/ProgressContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/learn', label: 'Learn', icon: '📚' },
  { path: '/reference', label: 'Reference', icon: '⌨️' },
  { path: '/practice', label: 'Shell Practice', icon: '💻' },
  { path: '/facts', label: 'Facts', icon: '💡' },
  { path: '/tools', label: 'Study Tools', icon: '🛠️' },
]

interface SidebarProps {
  onOpenSearch: () => void
}

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { getOverallStudyProgress, getOverallPracticeProgress, getStudyStreak } = useProgress()
  const streak = getStudyStreak()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">$</div>
        <div>
          <h1>Unix Shell</h1>
          <p>Master Academy</p>
        </div>
      </div>

      <button type="button" className="search-trigger" onClick={onOpenSearch}>
        <span>🔍 Search...</span>
        <kbd>Ctrl K</kbd>
      </button>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-progress">
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-flame">🔥</span>
            <span>{streak} day streak</span>
          </div>
        )}
        <div className="progress-mini">
          <span>Study</span>
          <div className="progress-bar"><div className="progress-fill study" style={{ width: `${getOverallStudyProgress()}%` }} /></div>
          <span className="progress-pct">{getOverallStudyProgress()}%</span>
        </div>
        <div className="progress-mini">
          <span>Practice</span>
          <div className="progress-bar"><div className="progress-fill practice" style={{ width: `${getOverallPracticeProgress()}%` }} /></div>
          <span className="progress-pct">{getOverallPracticeProgress()}%</span>
        </div>
      </div>

      <button type="button" className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Night Mode'}
      </button>
    </aside>
  )
}
