import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { GlobalSearch, useGlobalSearch } from './GlobalSearch'

export function Layout() {
  const { open, setOpen } = useGlobalSearch()

  return (
    <div className="app-layout">
      <Sidebar onOpenSearch={() => setOpen(true)} />
      <main className="main-content">
        <Outlet />
      </main>
      <GlobalSearch open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
