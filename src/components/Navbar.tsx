import type { AppSection } from '../types'

interface NavbarProps {
  active: AppSection
  onNavigate: (section: AppSection) => void
  isDark: boolean
  onToggleTheme: () => void
  commandCount: number
  scenarioCount: number
}

const NAV_ITEMS: { id: AppSection; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'commands', label: 'Commands', icon: '$' },
  { id: 'facts', label: 'Facts', icon: '⚡' },
  { id: 'learn', label: 'Learn', icon: '▶' },
]

export function Navbar({ active, onNavigate, isDark, onToggleTheme, commandCount, scenarioCount }: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur-xl"
      style={{ background: 'var(--nav-bg)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="group flex cursor-pointer items-center gap-2.5"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-lg font-bold text-white shadow-lg transition group-hover:scale-105"
            style={{ background: 'var(--gradient-brand)' }}
          >
            $
          </span>
          <div className="text-left">
            <div className="text-sm font-bold text-[var(--text)]">Unix Teacher</div>
            <div className="hidden text-[10px] text-[var(--text-faint)] sm:block">
              {commandCount} commands · {scenarioCount} scenarios
            </div>
          </div>
        </button>

        <nav className="flex items-center gap-1 rounded-xl bg-[var(--surface-muted)] p-1">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all
                ${active === id
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
            >
              <span className="font-mono text-xs opacity-70">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition hover:scale-105"
          aria-label="Toggle theme"
        >
          {isDark ? '☀' : '☾'}
        </button>
      </div>
    </header>
  )
}
