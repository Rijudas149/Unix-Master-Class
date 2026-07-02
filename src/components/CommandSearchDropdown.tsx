import { useEffect, useMemo, useRef, useState } from 'react'
import type { UnixCommand } from '../types'

interface CommandSearchDropdownProps {
  commands: UnixCommand[]
  selected: UnixCommand | null
  onSelect: (cmd: UnixCommand) => void
  categoryFilter?: string
  typeFilter?: string
}

export function CommandSearchDropdown({
  commands,
  selected,
  onSelect,
  categoryFilter = 'all',
  typeFilter = 'all',
}: CommandSearchDropdownProps) {
  const [query, setQuery] = useState(selected?.name ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const pool = useMemo(() => {
    return commands.filter((c) => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      return true
    })
  }, [commands, categoryFilter, typeFilter])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return pool.slice(0, 20)
    return pool
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.explanation.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 20)
  }, [pool, query])

  useEffect(() => {
    if (selected) setQuery(selected.name)
  }, [selected])

  useEffect(() => {
    setHighlight(0)
  }, [query, open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function pick(cmd: UnixCommand) {
    onSelect(cmd)
    setQuery(cmd.name)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault()
      pick(results[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-faint)]"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search a command — e.g. grep, ls, docker, kubectl..."
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-10 text-sm text-[var(--text)] shadow-[var(--shadow)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-glow)]"
          aria-label="Search commands"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); inputRef.current?.focus() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-[var(--text-faint)] hover:bg-[var(--surface-muted)]"
          aria-label="Toggle dropdown"
        >
          <svg className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-2 shadow-[var(--shadow-lg)]"
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              No commands found for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((cmd, i) => (
              <li key={cmd.id} role="option" aria-selected={selected?.id === cmd.id}>
                <button
                  type="button"
                  onClick={() => pick(cmd)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full cursor-pointer px-4 py-3 text-left transition
                    ${highlight === i || selected?.id === cmd.id
                      ? 'bg-[var(--brand-soft)]'
                      : 'hover:bg-[var(--surface-muted)]'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-[var(--brand)]">{cmd.name}</span>
                    <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] text-[var(--text-faint)]">
                      {cmd.type}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{cmd.explanation}</p>
                </button>
              </li>
            ))
          )}
          {query && results.length === 20 && (
            <li className="border-t border-[var(--border)] px-4 py-2 text-center text-[10px] text-[var(--text-faint)]">
              Showing top 20 matches — refine your search
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
