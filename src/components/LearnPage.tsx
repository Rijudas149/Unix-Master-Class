import { useMemo, useState } from 'react'
import { commands } from '../data'
import type { UnixCommand } from '../types'
import { CommandLesson } from './CommandLesson'

const MODULES = [
  {
    title: 'Navigation & Files',
    intro: 'Move around the filesystem and manage files.',
    commands: ['pwd', 'cd', 'ls', 'mkdir', 'cp', 'mv', 'rm', 'find', 'tree'],
  },
  {
    title: 'Reading & Searching Text',
    intro: 'View files and search for patterns.',
    commands: ['cat', 'less', 'head', 'tail', 'grep', 'sed', 'awk', 'cut', 'sort', 'uniq'],
  },
  {
    title: 'Processes',
    intro: 'Monitor and control running programs.',
    commands: ['ps', 'top', 'htop', 'kill', 'nohup', 'jobs', 'bg', 'fg', 'nice', 'renice'],
  },
  {
    title: 'Permissions & Users',
    intro: 'Manage access and ownership.',
    commands: ['chmod', 'chown', 'chgrp', 'umask', 'sudo', 'su', 'id', 'whoami', 'groups'],
  },
  {
    title: 'Networking',
    intro: 'Connect and transfer data remotely.',
    commands: ['ping', 'curl', 'wget', 'ssh', 'scp', 'netstat', 'ss', 'dig', 'nc', 'traceroute'],
  },
  {
    title: 'Pipes & Redirection',
    intro: 'Chain commands with | and control stdin/stdout/stderr.',
    commands: ['|', '>', '>>', '<', '2>&1', '&>', 'tee', 'xargs', '2>', 'set -o pipefail'],
  },
  {
    title: 'Archives',
    intro: 'Compress and package files.',
    commands: ['tar', 'gzip', 'gunzip', 'zip', 'unzip', 'bzip2', 'xz'],
  },
  {
    title: 'System Info',
    intro: 'Inspect hardware, disk, and OS.',
    commands: ['uname', 'df', 'du', 'free', 'uptime', 'dmesg', 'lscpu', 'lsblk', 'mount'],
  },
]

export function LearnPage() {
  const [moduleIdx, setModuleIdx] = useState(0)
  const [cmdIdx, setCmdIdx] = useState(0)

  const mod = MODULES[moduleIdx]
  const modCommands = useMemo(
    () => mod.commands.map((n) => commands.find((c) => c.name === n)).filter((c): c is UnixCommand => !!c),
    [mod],
  )
  const active = modCommands[cmdIdx] ?? modCommands[0] ?? null

  function selectModule(i: number) {
    setModuleIdx(i)
    setCmdIdx(0)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Learning Path</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Browse by topic on the left — full lessons open on the right
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar navigation */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Topics
            </div>
            <nav className="space-y-1">
              {MODULES.map((m, i) => (
                <button
                  key={m.title}
                  type="button"
                  onClick={() => selectModule(i)}
                  className={`w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm transition
                    ${moduleIdx === i
                      ? 'bg-[var(--brand-soft)] font-semibold text-[var(--brand)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                    }`}
                >
                  {m.title}
                </button>
              ))}
            </nav>

            <div className="my-3 border-t border-[var(--border)]" />

            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              {mod.title}
            </div>
            <p className="mb-2 px-2 text-xs leading-relaxed text-[var(--text-faint)]">{mod.intro}</p>
            <div className="max-h-64 space-y-0.5 overflow-y-auto lg:max-h-[28rem]">
              {modCommands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => setCmdIdx(i)}
                  className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left font-mono text-sm transition
                    ${cmdIdx === i
                      ? 'bg-[var(--brand)] text-white'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                    }`}
                >
                  {cmd.name}
                </button>
              ))}
              {modCommands.length === 0 && (
                <p className="px-2 text-xs text-[var(--text-faint)]">No commands in this module.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Lesson panel */}
        <div className="min-w-0 flex-1">
          {active ? (
            <CommandLesson key={`${moduleIdx}-${active.id}`} command={active} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] py-24 text-center">
              <p className="text-[var(--text-muted)]">Select a command from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
