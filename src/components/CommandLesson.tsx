import { useState } from 'react'
import type { UnixCommand } from '../types'
import { CopyButton } from './CopyButton'

const STEPS = [
  { id: 'understand', label: 'Understand', icon: '◉' },
  { id: 'syntax', label: 'Syntax', icon: '⌘' },
  { id: 'patterns', label: 'Patterns', icon: '◎' },
  { id: 'practice', label: 'Practice', icon: '▶' },
] as const

type StepId = (typeof STEPS)[number]['id']

interface CommandLessonProps {
  command: UnixCommand
}

export function CommandLesson({ command }: CommandLessonProps) {
  const [step, setStep] = useState<StepId>('understand')
  const [patternIdx, setPatternIdx] = useState(0)
  const patterns = command.patterns ?? [{ label: 'Primary usage', pattern: command.pattern, example: command.example }]
  const current = patterns[patternIdx] ?? patterns[0]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
      {/* Command header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-raised)] px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-2xl font-bold text-[var(--brand)]">{command.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--brand)]">
                {command.type}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-0.5 text-xs text-[var(--text-muted)]">
                {command.category}
              </span>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--accent)]">
                {patterns.length} patterns
              </span>
            </div>
          </div>
        </div>

        {/* Step navigator */}
        <div className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all
                ${step === s.id
                  ? 'bg-[var(--brand)] text-white shadow-md'
                  : 'bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]'
                }`}
            >
              <span className="mr-1.5 opacity-70">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 'understand' && (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)]">What does this command do?</h3>
            <p className="text-base leading-relaxed text-[var(--text-muted)]">{command.explanation}</p>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Quick preview</div>
              <code className="mt-2 block font-mono text-sm text-[var(--terminal-cmd)]">
                $ {command.example}
              </code>
            </div>
            {command.tags && command.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {command.tags.map((t) => (
                  <span key={t} className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'syntax' && (
          <div className="animate-fade-in space-y-5">
            <h3 className="text-lg font-bold text-[var(--text)]">How is the syntax structured?</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Every command follows a predictable structure. Read it left to right: the command name, then options (flags), then arguments (files, paths, or values).
            </p>
            <div className="rounded-xl bg-[var(--terminal-bg)] p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--terminal-prompt)]">General form</div>
              <code className="font-mono text-lg text-[var(--terminal-text)]">{command.pattern}</code>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { part: 'Command', desc: `The program name: ${command.name.split(' ')[0]}`, color: 'text-[var(--brand)]' },
                { part: 'Options', desc: 'Flags like -a, -r, --help that modify behavior', color: 'text-[var(--accent)]' },
                { part: 'Arguments', desc: 'Files, paths, hostnames, or values the command acts on', color: 'text-[var(--terminal-text)]' },
              ].map(({ part, desc, color }) => (
                <div key={part} className="rounded-xl border border-[var(--border)] p-4">
                  <div className={`font-mono text-sm font-bold ${color}`}>{part}</div>
                  <div className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'patterns' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text)]">Usage patterns ({patterns.length})</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={patternIdx === 0}
                  onClick={() => setPatternIdx((i) => i - 1)}
                  className="cursor-pointer rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="flex items-center px-2 text-sm text-[var(--text-faint)]">
                  {patternIdx + 1} / {patterns.length}
                </span>
                <button
                  type="button"
                  disabled={patternIdx >= patterns.length - 1}
                  onClick={() => setPatternIdx((i) => i + 1)}
                  className="cursor-pointer rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-[var(--brand)] bg-[var(--brand-soft)] p-5">
              <div className="text-sm font-semibold text-[var(--brand)]">{current.label}</div>
              <code className="mt-3 block font-mono text-base text-[var(--text)]">{current.pattern}</code>
              <div className="mt-4 flex items-center justify-between">
                <code className="font-mono text-sm text-[var(--accent)]">$ {current.example}</code>
                <CopyButton text={current.example} id={`lesson-${command.id}-${patternIdx}`} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {patterns.map((p, i) => (
                <button
                  key={`pat-${i}`}
                  type="button"
                  onClick={() => setPatternIdx(i)}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition
                    ${patternIdx === i
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                >
                  <div className="text-xs font-semibold text-[var(--text)]">{p.label}</div>
                  <div className="mt-1 truncate font-mono text-[11px] text-[var(--text-faint)]">{p.pattern}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'practice' && (
          <div className="animate-fade-in space-y-5">
            <h3 className="text-lg font-bold text-[var(--text)]">Try it yourself</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Copy the command below and run it in your terminal. Start with the primary example, then experiment with the other patterns from step 3.
            </p>

            <div className="rounded-xl bg-[var(--terminal-bg)] p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[var(--terminal-prompt)]">Primary example</span>
                <CopyButton text={command.example} id={`practice-main-${command.id}`} label="Copy & Run" />
              </div>
              <code className="block font-mono text-base text-[var(--terminal-cmd)]">$ {command.example}</code>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-[var(--text)]">More examples to try</div>
              {patterns.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[var(--text-faint)]">{p.label}</div>
                    <code className="mt-0.5 block truncate font-mono text-sm text-[var(--text)]">$ {p.example}</code>
                  </div>
                  <CopyButton text={p.example} id={`practice-${command.id}-${i}`} />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--text-muted)]">
              <strong className="text-[var(--accent)]">Tip:</strong> Run <code className="font-mono text-[var(--brand)]">man {command.name.split(' ')[0]}</code> to read the full manual page with every option documented.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
