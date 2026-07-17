import { Link, useParams } from 'react-router-dom'
import { getScenarioById, getCategoryForScenario, getAdjacentScenarios } from '../data/facts'
import { CodeBlock, MarkdownContent } from '../components/CodeBlock'
import { BookmarkButton } from '../components/BookmarkButton'

export function FactScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined
  const category = scenarioId ? getCategoryForScenario(scenarioId) : undefined
  const { prev, next } = scenarioId ? getAdjacentScenarios(scenarioId) : {}

  if (!scenario) {
    return (
      <div className="page">
        <h1>Scenario not found</h1>
        <Link to="/facts">Back to Facts</Link>
      </div>
    )
  }

  return (
    <div className="page lesson-page fact-scenario-page">
      <nav className="breadcrumb">
        <Link to="/facts">Facts</Link>
        {category && (
          <>
            {' / '}
            <Link to={`/facts?category=${category.id}`}>{category.name}</Link>
          </>
        )}
        {' / '}
        <span>{scenario.title}</span>
      </nav>

      <header className="lesson-header">
        <div className="lesson-header-top">
          <div className="topic-card-top">
            <span className={`badge ${scenario.level}`}>{scenario.level}</span>
            <span className="fact-category-tag">{scenario.category}</span>
          </div>
          <BookmarkButton type="fact" id={scenario.id} label={scenario.title} />
        </div>
        <h1>{scenario.title}</h1>
        <p>{scenario.description}</p>
        <div className="fact-tags">
          {scenario.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </header>

      <article className="lesson-content fact-content">
        <section className="lesson-block">
          <h2>Scenario</h2>
          <MarkdownContent content={scenario.explanation} />
        </section>

        {scenario.keyPoints && (
          <div className="key-points">
            <h4>Key Points</h4>
            <ul>
              {scenario.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="lesson-block">
          <h4>Command Pattern</h4>
          <p className="block-hint">Reusable pattern — adjust paths and arguments for your environment.</p>
          <CodeBlock code={scenario.mainCode} />
        </section>

        <section className="lesson-block">
          <h4>Example Command</h4>
          <p className="block-hint">Concrete example you can copy and run in your terminal.</p>
          <CodeBlock code={scenario.exampleCode} />
        </section>

        <div className="lesson-nav-buttons">
          {prev ? (
            <Link to={`/facts/${prev.id}`} className="btn btn-ghost">
              ← {prev.title}
            </Link>
          ) : (
            <Link to="/facts" className="btn btn-ghost">← All Facts</Link>
          )}
          {next && (
            <Link to={`/facts/${next.id}`} className="btn btn-primary">
              {next.title} →
            </Link>
          )}
        </div>
      </article>
    </div>
  )
}
