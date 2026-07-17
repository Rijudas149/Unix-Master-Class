import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { GlobalSearch, useGlobalSearch } from './GlobalSearch'

export function Layout() {
  const { open, setOpen } = useGlobalSearch()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileNavOpen)
    return () => document.body.classList.remove('nav-open')
  }, [mobileNavOpen])

  return (
    <div className="app-layout">
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-topbar-title">Unix Shell Academy</span>
        <button
          type="button"
          className="mobile-search-btn"
          onClick={() => setOpen(true)}
          aria-label="Search"
        >
          🔍
        </button>
      </header>

      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        role="presentation"
      />

      <Sidebar
        onOpenSearch={() => setOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="main-content">
        <Outlet />
      </main>

      <GlobalSearch open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
