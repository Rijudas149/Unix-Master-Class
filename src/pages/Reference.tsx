import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { commands } from '../data'
import { allTopics } from '../data/curriculum'
import { COMMAND_CATEGORIES } from '../data/commandMeta'

const topicIds = new Set(allTopics.map((t) => t.id))

export function Reference() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [search, setSearch] = useState(initialQuery)
  const [category, setCategory] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const types = useMemo(
    () => [...new Set(commands.map((c) => c.type))].sort(),
    [],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return commands.filter((c) => {
      if (category !== 'all' && c.category !== category) return false
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => t.includes(q)) ||
        (c.aliases ?? []).some((a) => a.toLowerCase().includes(q))
      )
    })
  }, [search, category, typeFilter])

  const withLesson = filtered.filter((c) => topicIds.has(c.id)).length

  return (
    <div className="page reference-page">
      <header className="page-header">
        <h1>Command Reference</h1>
        <p>
          Browse all <strong>{commands.length}</strong> Unix/Linux commands.
          {withLesson > 0 && <> <strong>{withLesson}</strong> have full lessons in the learning path.</>}
        </p>
      </header>

      <div className="reference-filters filters">
        <label>
          Search:
          <input
            type="search"
            placeholder="Command name, tag, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              const next = new URLSearchParams(searchParams)
              if (e.target.value) next.set('q', e.target.value)
              else next.delete('q')
              setSearchParams(next, { replace: true })
            }}
          />
        </label>
        <label>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {COMMAND_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label>
          Type:
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="results-count">
        Showing {filtered.length} command{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="reference-grid">
        {filtered.map((cmd) => {
          const hasLesson = topicIds.has(cmd.id)
          return (
            <article key={cmd.id} className="reference-card">
              <div className="reference-card-top">
                <code className="reference-cmd">{cmd.name}</code>
                {hasLesson && <span className="lesson-badge">📚 Lesson</span>}
              </div>
              <p className="reference-desc">{cmd.explanation.split('. ')[0]}.</p>
              <div className="reference-meta">
                <span className="tag">{cmd.category}</span>
                <span className="tag tag-muted">{cmd.type}</span>
              </div>
              <pre className="reference-example">{cmd.example}</pre>
              <div className="reference-actions">
                {hasLesson ? (
                  <Link to={`/learn/${cmd.id}`} className="btn btn-sm btn-primary">
                    Open Lesson →
                  </Link>
                ) : (
                  <span className="reference-no-lesson">Reference only</span>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-ghost copy-btn-inline"
                  onClick={() => navigator.clipboard.writeText(cmd.example)}
                >
                  Copy example
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="practice-empty">
          <p>No commands match your filters. Try a different search or category.</p>
        </div>
      )}
    </div>
  )
}
