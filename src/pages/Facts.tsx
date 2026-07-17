import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { factCategories, allScenarios } from '../data/facts'

export function Facts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    return factCategories
      .filter((c) => !categoryFilter || c.id === categoryFilter)
      .map((cat) => ({
        ...cat,
        scenarios: cat.scenarios.filter((s) => {
          const levelOk = levelFilter === 'all' || s.level === levelFilter
          const searchOk =
            !q ||
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
          return levelOk && searchOk
        }),
      }))
      .filter((c) => c.scenarios.length > 0)
  }, [categoryFilter, levelFilter, search])

  const visibleCount = filteredCategories.reduce((n, c) => n + c.scenarios.length, 0)

  return (
    <div className="page facts-page">
      <header className="page-header">
        <h1>Facts — Developer Scenarios</h1>
        <p>
          {allScenarios.length} practical Unix/Linux scenarios for developers and sysadmins: log analysis,
          pipes, permissions, networking, DevOps, and more. Each includes explanation, pattern, and example.
        </p>
      </header>

      <div className="filters facts-filters">
        <label>
          Search:
          <input
            type="search"
            placeholder="Title, tag, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Level:
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </label>
        <label>
          Category:
          <select
            value={categoryFilter ?? 'all'}
            onChange={(e) => {
              const val = e.target.value
              const next = new URLSearchParams(searchParams)
              if (val === 'all') next.delete('category')
              else next.set('category', val)
              setSearchParams(next)
            }}
          >
            <option value="all">All Categories</option>
            {factCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="facts-count">{visibleCount} scenario{visibleCount !== 1 ? 's' : ''} shown</p>

      {filteredCategories.map((cat) => (
        <section key={cat.id} className="module-section">
          <div className="module-section-header">
            <h2>{cat.name}</h2>
            <span className="module-meta">{cat.scenarios.length} scenarios</span>
          </div>
          <p className="section-desc">{cat.description}</p>
          <div className="topic-list">
            {cat.scenarios.map((scenario) => (
              <Link key={scenario.id} to={`/facts/${scenario.id}`} className="topic-card fact-card">
                <div className="topic-card-top">
                  <span className={`badge ${scenario.level}`}>{scenario.level}</span>
                  <span className="fact-category-tag">{scenario.category}</span>
                </div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="fact-tags">
                  {scenario.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
