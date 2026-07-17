import { useMemo, useState } from 'react'
import { practiceQuestions, platformLabels } from '../data/practiceQuestions'
import { useProgress } from '../context/ProgressContext'
import type { PracticeStatus } from '../types'

const PAGE_SIZE = 50

export function Practice() {
  const { progress, setPracticeStatus, getPracticeStats } = useProgress()
  const stats = getPracticeStats()

  const [difficulty, setDifficulty] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | PracticeStatus>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const getStatus = (id: string): PracticeStatus => {
    const p = progress.practice[id]
    if (p?.status) return p.status
    if (p?.solved) return 'done'
    return 'due'
  }

  const filtered = useMemo(() => {
    return practiceQuestions.filter((q) => {
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false
      if (platform !== 'all' && q.platform !== platform) return false
      if (statusFilter !== 'all' && getStatus(q.id) !== statusFilter) return false
      if (search) {
        const s = search.toLowerCase()
        if (
          !q.title.toLowerCase().includes(s) &&
          !q.category.toLowerCase().includes(s) &&
          !q.tags.some((t) => t.includes(s)) &&
          !(q.problemNumber || '').includes(s)
        ) return false
      }
      return true
    })
  }, [difficulty, platform, statusFilter, search, progress.practice])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const openQuestion = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleStatusChange = (id: string, status: PracticeStatus) => {
    setPracticeStatus(id, status)
  }

  return (
    <div className="page practice-page practice-external">
      <header className="page-header">
        <h1>Shell Practice</h1>
        <p>
          {stats.total}+ real Unix/Linux challenges from OverTheWire, HackerRank, Exercism, GeeksforGeeks, and more.
          Click any question to open it on the original site and practice there.
        </p>
      </header>

      <div className="practice-tracker">
        <div className="tracker-card due">
          <span className="tracker-num">{stats.due}</span>
          <span className="tracker-label">Due</span>
        </div>
        <div className="tracker-card done">
          <span className="tracker-num">{stats.done}</span>
          <span className="tracker-label">Done</span>
        </div>
        <div className="tracker-card failed">
          <span className="tracker-num">{stats.failed}</span>
          <span className="tracker-label">Failed</span>
        </div>
        <div className="tracker-card total">
          <span className="tracker-num">{stats.total}</span>
          <span className="tracker-label">Total</span>
        </div>
        <div className="tracker-progress">
          <span>Completion</span>
          <div className="progress-bar lg">
            <div
              className="progress-fill practice"
              style={{ width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%` }}
            />
          </div>
          <span>{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
        </div>
      </div>

      <div className="practice-filters-bar">
        <input
          type="search"
          placeholder="Search by title, category, problem #..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(0) }}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(0) }}>
          <option value="all">All Platforms</option>
          <option value="overthewire">OverTheWire</option>
          <option value="hackerrank">HackerRank</option>
          <option value="exercism">Exercism</option>
          <option value="geeksforgeeks">GeeksforGeeks</option>
          <option value="codewars">Codewars</option>
          <option value="leetcode">LeetCode</option>
          <option value="cmdchallenge">CMD Challenge</option>
        </select>
      </div>

      <div className="status-filter-group">
        <span className="status-filter-label">Show:</span>
        {(['all', 'due', 'done', 'failed'] as const).map((s) => (
          <label key={s} className={`status-filter-chip ${statusFilter === s ? 'active' : ''}`}>
            <input
              type="radio"
              name="statusFilter"
              value={s}
              checked={statusFilter === s}
              onChange={() => { setStatusFilter(s); setPage(0) }}
            />
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <span className="chip-count">
                {s === 'due' ? stats.due : s === 'done' ? stats.done : stats.failed}
              </span>
            )}
          </label>
        ))}
      </div>

      <p className="results-count">
        Showing {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== practiceQuestions.length && ` (filtered from ${practiceQuestions.length})`}
      </p>

      <div className="practice-table-wrap">
        <table className="practice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Platform</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>Status</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((q, i) => {
              const status = getStatus(q.id)
              return (
                <tr key={q.id} className={`practice-row status-${status}`}>
                  <td className="col-num">{q.problemNumber || page * PAGE_SIZE + i + 1}</td>
                  <td className="col-title">
                    <button type="button" className="title-link" onClick={() => openQuestion(q.url)}>
                      {q.title}
                    </button>
                    {q.preview && <span className="preview-text">{q.preview}</span>}
                  </td>
                  <td>
                    <span className={`platform-badge ${q.platform}`}>
                      {platformLabels[q.platform]}
                    </span>
                  </td>
                  <td><span className={`badge ${q.difficulty}`}>{q.difficulty}</span></td>
                  <td className="col-cat">{q.category}</td>
                  <td>
                    <div className="status-checkboxes" onClick={(e) => e.stopPropagation()}>
                      {(['due', 'done', 'failed'] as PracticeStatus[]).map((s) => (
                        <label key={s} className={`status-check status-${s} ${status === s ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={status === s}
                            onChange={() => handleStatusChange(q.id, status === s ? 'due' : s)}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => openQuestion(q.url)}>
                      Solve ↗
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="practice-empty">
          <p>No questions match your filters. Try changing difficulty, platform, or status.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button type="button" className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
