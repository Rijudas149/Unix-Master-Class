import { useMemo, useState } from 'react'
import { scenarios } from '../data'
import { ScenarioCard } from './ScenarioCard'
import { SearchBar } from './SearchBar'

type DifficultyFilter = 'all' | 'basic' | 'intermediate' | 'advanced' | 'expert'

function isPipeScenario(s: (typeof scenarios)[number]) {
  return s.tags.includes('pipes') || s.id.startsWith('scenario-pipe-')
}

export function FactsPage() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [pipesOnly, setPipesOnly] = useState(false)
  const [tag, setTag] = useState<string>('all')

  const pipeCount = useMemo(() => scenarios.filter(isPipeScenario).length, [])
  const generalCount = scenarios.length - pipeCount

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const s of scenarios) {
      if (isPipeScenario(s)) continue
      s.tags.forEach((t) => tags.add(t))
    }
    return [...tags].sort()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return scenarios.filter((s) => {
      if (pipesOnly) {
        if (!isPipeScenario(s)) return false
      } else if (isPipeScenario(s)) {
        return false
      }

      if (difficulty !== 'all' && s.difficulty !== difficulty) return false
      if (!pipesOnly && tag !== 'all' && !s.tags.includes(tag)) return false
      if (!q) return true
      return (
        s.scenario.toLowerCase().includes(q) ||
        s.codePattern.toLowerCase().includes(q) ||
        s.example.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [search, difficulty, tag, pipesOnly])

  const poolCount = pipesOnly ? pipeCount : generalCount

  const stats = useMemo(() => {
    const pool = scenarios.filter((s) => (pipesOnly ? isPipeScenario(s) : !isPipeScenario(s)))
    return {
      basic: pool.filter((s) => s.difficulty === 'basic').length,
      intermediate: pool.filter((s) => s.difficulty === 'intermediate').length,
      advanced: pool.filter((s) => s.difficulty === 'advanced').length,
      expert: pool.filter((s) => s.difficulty === 'expert').length,
    }
  }, [pipesOnly])

  function togglePipes() {
    setPipesOnly((prev) => {
      const next = !prev
      if (next) setTag('all')
      return next
    })
    setDifficulty('all')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          ⚡ Developer Facts
        </div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Real-World Scenarios</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          {pipesOnly
            ? `${pipeCount} pipe & redirection scenarios — click #pipes again to return to general scenarios`
            : `${generalCount} general scenarios — click #pipes to view pipe & redirection examples`}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
        {(['basic', 'intermediate', 'advanced', 'expert'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={`cursor-pointer rounded-xl border p-3 text-center transition hover:border-[var(--brand)] hover:shadow-sm
              ${difficulty === d ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}
          >
            <div className="text-2xl font-bold text-[var(--text)]">{stats[d]}</div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{d}</div>
          </button>
        ))}
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={pipesOnly ? 'Search pipe scenarios...' : 'Search scenarios, patterns, tags...'}
          resultCount={filtered.length}
          totalCount={poolCount}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={togglePipes}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition
              ${pipesOnly
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-90'
              }`}
          >
            #pipes ({pipeCount})
          </button>
          {(['all', 'basic', 'intermediate', 'advanced', 'expert'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium capitalize transition
                ${difficulty === d
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--accent-soft)]'
                }`}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>

        {!pipesOnly && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setTag('all')}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium transition
                ${tag === 'all' ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'}`}
            >
              all tags
            </button>
            {allTags.slice(0, 40).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag((prev) => (prev === t ? 'all' : t))}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium transition
                  ${tag === t ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'}`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((s, i) => (
          <ScenarioCard key={s.id} scenario={s} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-[var(--text-muted)]">No scenarios match your filters.</p>
        </div>
      )}
    </div>
  )
}
