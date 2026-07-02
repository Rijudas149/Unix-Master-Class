import type { Scenario } from '../types'
import { CopyButton } from './CopyButton'

const DIFFICULTY_STYLES: Record<Scenario['difficulty'], string> = {
  basic: 'bg-[var(--success-soft)] text-[var(--success)]',
  intermediate: 'bg-[var(--brand-soft)] text-[var(--brand)]',
  advanced: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  expert: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

interface ScenarioCardProps {
  scenario: Scenario
  index: number
}

export function ScenarioCard({ scenario, index }: ScenarioCardProps) {
  return (
    <article
      className="animate-fade-in rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      style={{ animationDelay: `${Math.min(index * 15, 300)}ms` }}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex-1 text-base font-semibold leading-snug text-[var(--text)]">
          {scenario.scenario}
        </h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DIFFICULTY_STYLES[scenario.difficulty]}`}>
          {scenario.difficulty}
        </span>
      </div>

      <div className="mb-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Code Pattern</div>
        <code className="inline-block rounded-lg bg-[var(--brand-soft)] px-3 py-1.5 font-mono text-sm text-[var(--brand)]">
          {scenario.codePattern}
        </code>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Example</span>
          <CopyButton text={scenario.example} id={`sc-${scenario.id}`} />
        </div>
        <pre className="overflow-x-auto rounded-lg bg-[var(--terminal-bg)] p-3 font-mono text-xs leading-relaxed text-[var(--terminal-text)] sm:text-sm">
          $ {scenario.example}
        </pre>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {scenario.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  )
}
