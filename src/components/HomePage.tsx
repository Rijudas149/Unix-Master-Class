import { commands, scenarios } from '../data'
import type { AppSection } from '../types'

interface HomePageProps {
  onNavigate: (section: AppSection) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const featured = commands.slice(0, 6)
  const featuredScenarios = scenarios.filter((s) => s.difficulty === 'basic').slice(0, 3)

  return (
    <div>
      <section
        className="relative overflow-hidden border-b border-[var(--border)]"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--brand)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              {commands.length} commands · {scenarios.length} scenarios
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-6xl">
              Master Unix
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand)' }}>
                From Zero to Hero
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
              Learn every command through a guided 4-step lesson — Understand, Syntax, Patterns, and Practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate('commands')} className="btn-primary cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold shadow-lg">
                Start Lessons →
              </button>
              <button type="button" onClick={() => onNavigate('facts')} className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">
                Explore Facts ⚡
              </button>
            </div>
          </div>

          <div className="mt-12 hidden lg:block">
            <div className="ml-auto max-w-lg rounded-2xl border border-[var(--border-strong)] p-1 shadow-[var(--shadow-lg)]" style={{ background: 'var(--terminal-bg)' }}>
              <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--surface-muted)' }}>
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 font-mono text-xs text-[var(--text-faint)]">tamald@unix-teacher ~</span>
              </div>
              <div className="space-y-1 p-4 font-mono text-sm">
                <p><span className="text-[var(--terminal-prompt)]">$</span> <span className="text-[var(--text)]">grep -r "ERROR" /var/log | tail -20</span></p>
                <p className="text-red-400">error.log: ERROR: Connection timeout</p>
                <p><span className="text-[var(--terminal-prompt)]">$</span> <span className="text-[var(--terminal-cmd)]">kubectl get pods -n prod</span></p>
                <p><span className="text-[var(--terminal-prompt)]">$</span> <span className="animate-pulse text-[var(--text-faint)]">_</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Commands', value: commands.length, desc: 'Guided 4-step lessons', section: 'commands' as AppSection },
            { label: 'Patterns', value: commands.reduce((s, c) => s + (c.patterns?.length ?? 1), 0), desc: 'Syntax variants', section: 'commands' as AppSection },
            { label: 'Basic Facts', value: scenarios.filter((s) => s.difficulty === 'basic').length, desc: 'Daily terminal tasks', section: 'facts' as AppSection },
            { label: 'All Scenarios', value: scenarios.length, desc: 'Basic to expert', section: 'facts' as AppSection },
          ].map(({ label, value, desc, section }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(section)}
              className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[var(--shadow)]"
            >
              <div className="text-3xl font-bold text-[var(--brand)]">{value}</div>
              <div className="mt-1 font-semibold text-[var(--text)]">{label}</div>
              <div className="mt-1 text-sm text-[var(--text-faint)]">{desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16" style={{ background: 'var(--app-bg-subtle)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[var(--text)]">Quick Start Commands</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => onNavigate('commands')}
                className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--brand)] hover:shadow-[var(--shadow)]"
              >
                <div className="font-mono font-bold text-[var(--brand)]">{cmd.name}</div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{cmd.explanation}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-[var(--text)]">Basic Scenarios</h2>
        <p className="mt-2 text-[var(--text-muted)]">Everyday tasks to build your terminal confidence</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {featuredScenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate('facts')}
              className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition hover:border-[var(--accent)] hover:shadow-[var(--shadow)]"
            >
              <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--success)]">basic</span>
              <h3 className="mt-2 font-semibold text-[var(--text)]">{s.scenario}</h3>
              <code className="mt-3 block truncate rounded bg-[var(--terminal-bg)] px-2 py-1.5 font-mono text-xs text-[var(--terminal-text)]">
                $ {s.example}
              </code>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
