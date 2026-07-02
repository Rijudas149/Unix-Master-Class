import { useState } from 'react'
import type { UnixCommand } from '../types'
import { CopyButton } from './CopyButton'

const CATEGORY_COLORS: Record<string, string> = {
  'File & Directory': 'from-blue-500 to-cyan-500',
  'Text Processing': 'from-violet-500 to-purple-500',
  'Process Management': 'from-orange-500 to-red-500',
  'User & Permissions': 'from-rose-500 to-pink-500',
  'Networking': 'from-sky-500 to-blue-500',
  'System Information': 'from-slate-500 to-gray-500',
  'Disk & Filesystem': 'from-amber-500 to-yellow-500',
  'Archives & Compression': 'from-lime-500 to-green-500',
  'Package Management': 'from-emerald-500 to-teal-500',
  'Shell Builtins': 'from-indigo-500 to-blue-500',
  'Development Tools': 'from-fuchsia-500 to-pink-500',
  'Security': 'from-red-500 to-orange-500',
  'Scheduling & Automation': 'from-cyan-500 to-teal-500',
  'Environment & Variables': 'from-teal-500 to-emerald-500',
  'Pipes & Redirection': 'from-purple-500 to-indigo-500',
  'Terminal & Session': 'from-gray-500 to-slate-500',
  'Search & Find': 'from-yellow-500 to-amber-500',
  'macOS / BSD': 'from-neutral-500 to-stone-500',
  'Linux Specific': 'from-green-500 to-lime-500',
  'Containers & Cloud': 'from-blue-600 to-indigo-600',
  'Database CLI': 'from-orange-600 to-red-600',
  'Monitoring & Logs': 'from-pink-500 to-rose-500',
}

const TYPE_COLORS: Record<string, string> = {
  'Shell Builtin': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'Shell Operator': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'POSIX Utility': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'GNU Coreutils': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'Filter / Stream Processor': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Network Utility': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Process Utility': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'Filesystem Utility': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  'System Utility': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Linux Specific': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  'BSD / macOS Utility': 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300',
  'Security Tool': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'Archive Utility': 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  'Package Manager': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Development Tool': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  'Container CLI': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  'Kubernetes CLI': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  'Cloud CLI': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'Database Client': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Monitoring Utility': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'Text Utility': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

interface CommandCardProps {
  command: UnixCommand
  index: number
}

export function CommandCard({ command, index }: CommandCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activePattern, setActivePattern] = useState(0)
  const gradient = CATEGORY_COLORS[command.category] ?? 'from-slate-500 to-gray-500'
  const typeStyle = TYPE_COLORS[command.type] ?? TYPE_COLORS['POSIX Utility']
  const patterns = command.patterns ?? [{ label: 'Primary usage', pattern: command.pattern, example: command.example }]
  const current = patterns[activePattern] ?? patterns[0]

  return (
    <article
      className="group animate-fade-in terminal-glow rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
      style={{ animationDelay: `${Math.min(index * 20, 400)}ms` }}
    >
      {/* Expandable header — separate button, no nested interactive elements */}
      <button
        type="button"
        className="w-full cursor-pointer rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${command.name} details`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} font-mono text-sm font-bold text-white shadow-md`}>
              {command.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                {command.name}
                {command.aliases && command.aliases.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({command.aliases.join(', ')})
                  </span>
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {command.explanation}
              </p>
            </div>
          </div>
          <span className={`mt-1 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeStyle}`}>
            {command.type}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {command.category}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {patterns.length} patterns
          </span>
          {command.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {tag}
            </span>
          ))}
        </div>

        {!expanded && (
          <code className="mt-3 block truncate rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs text-amber-300 dark:bg-black">
            $ {command.example}
          </code>
        )}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Usage Patterns ({patterns.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patterns.map((p, i) => (
                <button
                  key={`tab-${i}-${p.label}`}
                  type="button"
                  onClick={() => setActivePattern(i)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition
                    ${activePattern === i
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Syntax Pattern</div>
            <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-emerald-400 dark:bg-black">
              {current.pattern}
            </code>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Example</span>
              <CopyButton text={current.example} id={`cmd-${command.id}-${activePattern}`} />
            </div>
            <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-amber-300 dark:bg-black">
              $ {current.example}
            </code>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">All Patterns</div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-2 dark:border-slate-800">
              {patterns.map((p, i) => (
                <button
                  key={`list-${i}-${p.label}`}
                  type="button"
                  onClick={() => setActivePattern(i)}
                  className={`w-full cursor-pointer rounded-lg p-2.5 text-left transition
                    ${activePattern === i ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.label}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{p.pattern}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-500">$ {p.example}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
