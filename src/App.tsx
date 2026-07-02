import { useState, useCallback } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { commands, scenarios } from './data'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { CommandsPage } from './components/CommandsPage'
import { FactsPage } from './components/FactsPage'
import { LearnPage } from './components/LearnPage'
import type { AppSection } from './types'

function AppContent() {
  const [section, setSection] = useState<AppSection>('home')
  const { isDark, toggleTheme } = useTheme()

  const navigate = useCallback((next: AppSection) => {
    setSection(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <Navbar
        active={section}
        onNavigate={navigate}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        commandCount={commands.length}
        scenarioCount={scenarios.length}
      />

      <main>
        {section === 'home' && <HomePage onNavigate={navigate} />}
        {section === 'commands' && <CommandsPage />}
        {section === 'facts' && <FactsPage />}
        {section === 'learn' && <LearnPage />}
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[var(--text-faint)] sm:px-6">
          <p>Unix Teacher — {commands.length} commands · {scenarios.length} scenarios</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
