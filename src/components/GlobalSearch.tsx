import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { commands } from '../data'
import { allTopics } from '../data/curriculum'
import { allScenarios } from '../data/facts'

interface SearchResult {
  id: string
  type: 'topic' | 'command' | 'fact'
  title: string
  subtitle: string
  path: string
}

function buildIndex(): SearchResult[] {
  const topicIds = new Set(allTopics.map((t) => t.id))
  const results: SearchResult[] = []

  for (const t of allTopics) {
    results.push({
      id: `topic-${t.id}`,
      type: 'topic',
      title: t.title,
      subtitle: `${t.module} · ${t.level}`,
      path: `/learn/${t.id}`,
    })
  }

  for (const c of commands) {
    results.push({
      id: `cmd-${c.id}`,
      type: 'command',
      title: c.name,
      subtitle: topicIds.has(c.id) ? `${c.category} · has lesson` : c.category,
      path: topicIds.has(c.id) ? `/learn/${c.id}` : `/reference?q=${encodeURIComponent(c.name)}`,
    })
  }

  for (const s of allScenarios.slice(0, 200)) {
    results.push({
      id: `fact-${s.id}`,
      type: 'fact',
      title: s.title,
      subtitle: `${s.category} · ${s.level}`,
      path: `/facts/${s.id}`,
    })
  }

  return results
}

const SEARCH_INDEX = buildIndex()

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SEARCH_INDEX.slice(0, 12)
    return SEARCH_INDEX.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q),
    ).slice(0, 20)
  }, [query])

  const goTo = useCallback(
    (path: string) => {
      navigate(path)
      onClose()
      setQuery('')
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!open) return
    setActiveIdx(0)
    const input = document.getElementById('global-search-input') as HTMLInputElement | null
    input?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIdx]) {
        goTo(results[activeIdx].path)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIdx, goTo, onClose])

  if (!open) return null

  const typeIcon = { topic: '📚', command: '⌨️', fact: '💡' }

  return (
    <div className="search-overlay" onClick={onClose} role="presentation">
      <div className="search-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="global-search-input"
            type="search"
            className="search-input"
            placeholder="Search commands, lessons, scenarios..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0) }}
            autoComplete="off"
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>

        <ul className="search-results">
          {results.length === 0 && (
            <li className="search-empty">No results for &ldquo;{query}&rdquo;</li>
          )}
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                className={`search-result ${i === activeIdx ? 'active' : ''}`}
                onClick={() => goTo(r.path)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="search-result-icon">{typeIcon[r.type]}</span>
                <span className="search-result-body">
                  <span className="search-result-title">{r.title}</span>
                  <span className="search-result-sub">{r.subtitle}</span>
                </span>
                <span className="search-result-type">{r.type}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="search-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> open</span>
          <span><kbd>Ctrl</kbd>+<kbd>K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}

export function useGlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { open, setOpen }
}
