import { useMemo, useState } from 'react'
import { commands } from '../data'
import type { CommandCategory, CommandType, UnixCommand } from '../types'
import { COMMAND_CATEGORIES, COMMAND_TYPES } from '../types'
import { CommandLesson } from './CommandLesson'
import { CommandSearchDropdown } from './CommandSearchDropdown'

export function CommandsPage() {
  const [category, setCategory] = useState<CommandCategory | 'all'>('all')
  const [commandType, setCommandType] = useState<CommandType | 'all'>('all')
  const [selected, setSelected] = useState<UnixCommand | null>(null)

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of commands) counts.set(c.category, (counts.get(c.category) ?? 0) + 1)
    return counts
  }, [])

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of commands) counts.set(c.type, (counts.get(c.type) ?? 0) + 1)
    return counts
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Command Lessons</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Search and select a command — learn in 4 steps:{' '}
          <strong className="text-[var(--brand)]">Understand → Syntax → Patterns → Practice</strong>
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <CommandSearchDropdown
          commands={commands}
          selected={selected}
          onSelect={setSelected}
          categoryFilter={category}
          typeFilter={commandType}
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={commandType}
            onChange={(e) => setCommandType(e.target.value as CommandType | 'all')}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="all">All Types ({commands.length})</option>
            {COMMAND_TYPES.map((t) => {
              const count = typeCounts.get(t) ?? 0
              if (!count) return null
              return <option key={t} value={t}>{t} ({count})</option>
            })}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CommandCategory | 'all')}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="all">All Categories</option>
            {COMMAND_CATEGORIES.map((cat) => {
              const count = categoryCounts.get(cat) ?? 0
              if (!count) return null
              return <option key={cat} value={cat}>{cat} ({count})</option>
            })}
          </select>
        </div>
      </div>

      {selected ? (
        <CommandLesson key={selected.id} command={selected} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] py-20 text-center">
          <div className="text-4xl opacity-40">⌘</div>
          <p className="mt-4 text-lg font-medium text-[var(--text)]">Select a command to start learning</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Type in the search box above or click the dropdown arrow to browse
          </p>
        </div>
      )}
    </div>
  )
}
