import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTopicById } from '../data/curriculum'
import { useProgress } from '../context/ProgressContext'
import { CodeBlock } from '../components/CodeBlock'
import { LessonContent, TabularDisplay } from '../components/LessonContent'
import { ExerciseEditor } from '../components/ExerciseEditor'
import { BookmarkButton } from '../components/BookmarkButton'

export function TopicLesson() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topicId ? getTopicById(topicId) : undefined
  const [activeSection, setActiveSection] = useState(0)
  const [showExercises, setShowExercises] = useState(false)
  const [revealedSolutions, setRevealedSolutions] = useState<Set<string>>(new Set())
  const { markSectionComplete, markExerciseComplete, addStudyTime } = useProgress()
  const lastTick = useRef(Date.now())

  useEffect(() => {
    lastTick.current = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastTick.current) / 1000)
      if (elapsed > 0 && topicId) {
        addStudyTime(elapsed, topicId)
        lastTick.current = now
      }
    }, 30000)
    return () => {
      clearInterval(interval)
      const final = Math.floor((Date.now() - lastTick.current) / 1000)
      if (final > 0 && topicId) addStudyTime(final, topicId)
    }
  }, [topicId, addStudyTime])

  if (!topic) {
    return (
      <div className="page">
        <h1>Topic not found</h1>
        <Link to="/learn">Back to Learn</Link>
      </div>
    )
  }

  const section = topic.sections[activeSection]

  const handleSectionDone = () => {
    markSectionComplete(topic.id, section.id)
    if (activeSection < topic.sections.length - 1) {
      setActiveSection(activeSection + 1)
    } else {
      setShowExercises(true)
    }
  }

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="page lesson-page">
      <nav className="breadcrumb">
        <Link to="/learn">Learn</Link> / <span>{topic.module}</span> / <span>{topic.title}</span>
      </nav>

      <header className="lesson-header">
        <div className="lesson-header-top">
          <span className={`badge ${topic.level}`}>{topic.level}</span>
          <BookmarkButton type="topic" id={topic.id} label={topic.title} />
        </div>
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </header>

      <div className="lesson-layout">
        <aside className="lesson-sidebar">
          <h3>Sections</h3>
          <ul>
            {topic.sections.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`section-nav ${activeSection === i && !showExercises ? 'active' : ''}`}
                  onClick={() => { setActiveSection(i); setShowExercises(false) }}
                >
                  {i + 1}. {s.title}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={`section-nav exercises-nav ${showExercises ? 'active' : ''}`}
                onClick={() => setShowExercises(true)}
              >
                📝 Exercises ({topic.exercises.length})
              </button>
            </li>
          </ul>
        </aside>

        <article className="lesson-content">
          {!showExercises ? (
            <>
              <div className="lesson-section-header">
                <span className="lesson-section-badge">
                  Section {activeSection + 1} of {topic.sections.length}
                </span>
                <h2>{section.title}</h2>
              </div>

              <div className="lesson-flow">
                <section className="lesson-panel lesson-panel-explain">
                  <div className="lesson-panel-label">
                    <span className="lesson-panel-icon">📖</span>
                    Explanation
                  </div>
                  <LessonContent content={section.content} />
                </section>

                {section.pseudoCode && (
                  <section className="lesson-panel lesson-panel-pseudo">
                    <div className="lesson-panel-label">
                      <span className="lesson-panel-icon">🧩</span>
                      Step-by-Step Logic
                    </div>
                    <CodeBlock code={section.pseudoCode} language="pseudo" />
                  </section>
                )}

                {section.example && (
                  <section className="lesson-panel lesson-panel-example">
                    <div className="lesson-panel-label">
                      <span className="lesson-panel-icon">💻</span>
                      Try This Command
                    </div>
                    <p className="lesson-panel-hint">Copy the command below and run it in your terminal (Linux, macOS, or WSL).</p>
                    <CodeBlock code={section.example} />
                  </section>
                )}

                {section.output && (
                  <section className="lesson-panel lesson-panel-output">
                    <div className="lesson-panel-label">
                      <span className="lesson-panel-icon">✅</span>
                      Expected Output
                    </div>
                    <p className="lesson-panel-hint">Your terminal output should look similar to this.</p>
                    <TabularDisplay text={section.output} />
                  </section>
                )}

                {section.keyPoints && (
                  <section className="lesson-panel lesson-panel-takeaways">
                    <div className="lesson-panel-label">
                      <span className="lesson-panel-icon">💡</span>
                      Key Takeaways
                    </div>
                    <ul className="takeaway-list">
                      {section.keyPoints.map((kp, i) => (
                        <li key={i}>
                          <span className="takeaway-check">✓</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="lesson-nav-buttons">
                {activeSection > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveSection(activeSection - 1)}>
                    ← Previous
                  </button>
                )}
                <button type="button" className="btn btn-primary" onClick={handleSectionDone}>
                  {activeSection < topic.sections.length - 1 ? 'Mark Done & Next →' : 'Mark Done & Go to Exercises →'}
                </button>
              </div>
            </>
          ) : (
            <div className="exercises-panel">
              <h2>Exercises — {topic.title}</h2>
              <p>Practice what you learned. Write your command in the editor and click <strong>Check Answer</strong> to verify.</p>

              {topic.exercises.map((ex, i) => (
                <div key={ex.id} className="exercise-card">
                  <div className="exercise-header">
                    <span className="exercise-num">Exercise {i + 1}</span>
                    <span className={`badge ${ex.difficulty}`}>{ex.difficulty}</span>
                  </div>
                  <p className="exercise-question">{ex.question}</p>
                  {ex.hint && (
                    <details className="hint-details">
                      <summary>💡 Hint</summary>
                      <p>{ex.hint}</p>
                    </details>
                  )}
                  <ExerciseEditor
                    exercise={ex}
                    solutionRevealed={revealedSolutions.has(ex.id)}
                    onRevealSolution={() => toggleSolution(ex.id)}
                    onMarkComplete={() => markExerciseComplete(topic.id, ex.id)}
                    onCorrect={() => markExerciseComplete(topic.id, ex.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
