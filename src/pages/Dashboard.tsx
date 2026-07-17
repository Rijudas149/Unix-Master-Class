import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { modules, allTopics } from '../data/curriculum'
import { allScenarios, getScenarioById } from '../data/facts'
import { getTopicById } from '../data/curriculum'
import { commands } from '../data'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function getCommandOfDay() {
  const today = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (const c of today) hash = ((hash << 5) - hash) + c.charCodeAt(0)
  return allTopics[Math.abs(hash) % allTopics.length]
}

export function Dashboard() {
  const {
    progress,
    getOverallStudyProgress,
    getOverallPracticeProgress,
    getModuleProgress,
    getPracticeStats,
    getContinueTopic,
    getStudyStreak,
  } = useProgress()

  const studyPct = getOverallStudyProgress()
  const practicePct = getOverallPracticeProgress()
  const practiceStats = getPracticeStats()
  const completedTopics = allTopics.filter((t) => progress.topics[t.id]?.completed).length
  const continueTopic = getContinueTopic()
  const continueProgress = continueTopic ? progress.topics[continueTopic.id] : undefined
  const streak = getStudyStreak()
  const commandOfDay = getCommandOfDay()
  const bookmarks = progress.bookmarks ?? []

  const levelCounts = {
    beginner: allTopics.filter((t) => t.level === 'beginner').length,
    intermediate: allTopics.filter((t) => t.level === 'intermediate').length,
    advanced: allTopics.filter((t) => t.level === 'advanced').length,
    expert: allTopics.filter((t) => t.level === 'expert').length,
  }

  const sectionPct = continueTopic && continueProgress
    ? Math.round((continueProgress.sectionsCompleted.length / continueTopic.sections.length) * 100)
    : 0

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <h1>Welcome to Unix Shell Master Academy</h1>
        <p>Your complete journey from zero to Unix/Linux expert — one command at a time.</p>
        {streak > 0 && (
          <div className="header-streak">
            <span className="streak-flame">🔥</span>
            <strong>{streak}-day study streak</strong> — keep it going!
          </div>
        )}
      </header>

      {continueTopic && (
        <section className="continue-banner">
          <div className="continue-content">
            <span className="continue-label">Continue where you left off</span>
            <h2>{continueTopic.title}</h2>
            <p>{continueTopic.module} · {continueProgress?.sectionsCompleted.length ?? 0}/{continueTopic.sections.length} sections</p>
            <div className="progress-bar lg">
              <div className="progress-fill study" style={{ width: `${sectionPct}%` }} />
            </div>
          </div>
          <Link to={`/learn/${continueTopic.id}`} className="btn btn-primary">
            Resume Lesson →
          </Link>
        </section>
      )}

      <section className="command-of-day">
        <div className="cod-label">Command of the Day</div>
        <div className="cod-body">
          <code className="cod-name">{commandOfDay.title}</code>
          <p>{commandOfDay.description}</p>
          <div className="cod-meta">
            <span className={`badge ${commandOfDay.level}`}>{commandOfDay.level}</span>
            <span>{commandOfDay.module}</span>
          </div>
        </div>
        <Link to={`/learn/${commandOfDay.id}`} className="btn btn-secondary btn-sm">
          Learn {commandOfDay.title} →
        </Link>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{studyPct}%</div>
          <div className="stat-label">Overall Study Progress</div>
          <div className="progress-bar lg"><div className="progress-fill study" style={{ width: `${studyPct}%` }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{practicePct}%</div>
          <div className="stat-label">Practice Progress</div>
          <div className="progress-bar lg"><div className="progress-fill practice" style={{ width: `${practicePct}%` }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedTopics}/{allTopics.length}</div>
          <div className="stat-label">Topics Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{practiceStats.done}/{practiceStats.total}</div>
          <div className="stat-label">Practice Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(progress.totalStudySeconds)}</div>
          <div className="stat-label">Total Study Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak > 0 ? `${streak}🔥` : '—'}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      {bookmarks.length > 0 && (
        <section className="section">
          <h2>Your Bookmarks</h2>
          <div className="bookmark-list">
            {bookmarks.slice(0, 8).map((b) => {
              if (b.type === 'topic') {
                const t = getTopicById(b.id)
                if (!t) return null
                return (
                  <Link key={`${b.type}-${b.id}`} to={`/learn/${b.id}`} className="bookmark-chip">
                    📚 {t.title}
                  </Link>
                )
              }
              if (b.type === 'fact') {
                const s = getScenarioById(b.id)
                if (!s) return null
                return (
                  <Link key={`${b.type}-${b.id}`} to={`/facts/${b.id}`} className="bookmark-chip">
                    💡 {s.title.slice(0, 40)}{s.title.length > 40 ? '…' : ''}
                  </Link>
                )
              }
              const cmd = commands.find((c) => c.id === b.id)
              if (!cmd) return null
              return (
                <Link key={`${b.type}-${b.id}`} to={`/reference?q=${cmd.name}`} className="bookmark-chip">
                  ⌨️ {cmd.name}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Learning Path</h2>
        <p className="section-desc">
          {modules.length} modules covering {commands.length}+ Unix commands — from navigation to system administration.
        </p>
        <div className="module-grid">
          {modules.map((mod, idx) => {
            const modProgress = getModuleProgress(mod.name)
            return (
              <div key={mod.id} className="module-card">
                <div className="module-num">Module {idx + 1}</div>
                <h3>{mod.name}</h3>
                <p>{mod.topics.length} topics</p>
                <div className="progress-bar"><div className="progress-fill study" style={{ width: `${modProgress.study}%` }} /></div>
                <span className="module-pct">{modProgress.study}% complete</span>
                <Link to={`/learn?module=${mod.id}`} className="btn btn-sm">Start Module</Link>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section">
        <h2>Difficulty Breakdown</h2>
        <div className="level-badges">
          <span className="badge beginner">Beginner: {levelCounts.beginner}</span>
          <span className="badge intermediate">Intermediate: {levelCounts.intermediate}</span>
          <span className="badge advanced">Advanced: {levelCounts.advanced}</span>
          <span className="badge expert">Expert: {levelCounts.expert}</span>
        </div>
      </section>

      <section className="section quick-actions">
        <Link to={continueTopic ? `/learn/${continueTopic.id}` : '/learn'} className="action-card">
          <span className="action-icon">📚</span>
          <h3>Continue Learning</h3>
          <p>{continueTopic ? `Resume ${continueTopic.title}` : 'Start your first lesson'}</p>
        </Link>
        <Link to="/reference" className="action-card">
          <span className="action-icon">⌨️</span>
          <h3>Command Reference</h3>
          <p>Browse all {commands.length} commands</p>
        </Link>
        <Link to="/practice" className="action-card">
          <span className="action-icon">💻</span>
          <h3>Shell Practice</h3>
          <p>OverTheWire, HackerRank, Exercism & more</p>
        </Link>
        <Link to="/facts" className="action-card">
          <span className="action-icon">💡</span>
          <h3>Facts & Scenarios</h3>
          <p>{allScenarios.length} real-world Unix/Linux command patterns</p>
        </Link>
      </section>
    </div>
  )
}
