import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { modules, allTopics } from '../data/curriculum'
import { useProgress } from '../context/ProgressContext'

export function Learn() {
  const [searchParams] = useSearchParams()
  const moduleFilter = searchParams.get('module')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const { progress, getTopicProgress } = useProgress()

  const filteredModules = moduleFilter
    ? modules.filter((m) => m.id === moduleFilter)
    : modules

  return (
    <div className="page learn-page">
      <header className="page-header">
        <h1>Learn Unix & Linux</h1>
        <p>Every command explained in simple language with examples, patterns, and exercises.</p>
      </header>

      <div className="filters">
        <label>
          Filter by level:
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </label>
      </div>

      {filteredModules.map((mod) => {
        const topics = mod.topics.filter(
          (t) => levelFilter === 'all' || t.level === levelFilter,
        )
        if (topics.length === 0) return null

        const completed = topics.filter((t) => progress.topics[t.id]?.completed).length

        return (
          <section key={mod.id} className="module-section">
            <div className="module-section-header">
              <h2>{mod.name}</h2>
              <span className="module-meta">{completed}/{topics.length} completed</span>
            </div>
            <div className="topic-list">
              {topics.map((topic) => {
                const tp = getTopicProgress(topic.id)
                const sectionPct = topic.sections.length
                  ? Math.round((tp.sectionsCompleted.length / topic.sections.length) * 100)
                  : 0
                return (
                  <Link key={topic.id} to={`/learn/${topic.id}`} className="topic-card">
                    <div className="topic-card-top">
                      <span className={`badge ${topic.level}`}>{topic.level}</span>
                      {tp.completed && <span className="done-badge">✓ Done</span>}
                    </div>
                    <h3>{topic.title}</h3>
                    <p>{topic.description}</p>
                    <div className="topic-meta">
                      <span>{topic.sections.length} sections</span>
                      <span>{topic.exercises.length} exercises</span>
                      <span>~{topic.estimatedMinutes} min</span>
                    </div>
                    <div className="progress-bar sm">
                      <div className="progress-fill study" style={{ width: `${sectionPct}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="learn-summary">
        <p>Total: <strong>{allTopics.length}</strong> topics across <strong>{modules.length}</strong> modules</p>
      </div>
    </div>
  )
}
